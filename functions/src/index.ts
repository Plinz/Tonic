import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { isEqual } from 'lodash';
import DocumentSnapshot = admin.firestore.DocumentSnapshot;
admin.initializeApp();
const ALGOLIA_ID = 'LLHP7Z6FT9';
const ALGOLIA_ADMIN_KEY = '646dc5d6915ce9389fccac109ced6daa';
const algoliasearch = require('algoliasearch');

const ALGOLIA_SHARED_LIST_INDEX_NAME = 'shared-lists';
const ALGOLIA_USERS_INDEX_NAME = 'users';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_SHARED_LIST_INDEX_NAME);
const indexUsers = client.initIndex(ALGOLIA_USERS_INDEX_NAME);

const isEquivalent = (before: any, after: any) => {
    return before && typeof before.isEqual === 'function'
        ? before.isEqual(after)
        : isEqual(before, after);
};

const conditions = {
    CHANGED: (fieldBefore: any, fieldAfter: any) =>
        fieldBefore !== undefined &&
        fieldAfter !== undefined &&
        !isEquivalent(fieldBefore, fieldAfter),

    ADDED: (fieldBefore: any, fieldAfter: any) =>
        fieldBefore === undefined && fieldAfter,

    REMOVED: (fieldBefore: any, fieldAfter: any) =>
        fieldBefore && fieldAfter === undefined,
};

const field = (
    fieldPath: string | admin.firestore.FieldPath,
    operation: 'ADDED' | 'REMOVED' | 'CHANGED',
    handler: (
        change: functions.Change<DocumentSnapshot>,
        context: functions.EventContext,
    ) => PromiseLike<any> | any,
) => {
    return function (change: functions.Change<DocumentSnapshot>, context: functions.EventContext) {
        const fieldBefore = change.before.get(fieldPath);
        const fieldAfter = change.after.get(fieldPath);
        return conditions[operation](fieldBefore, fieldAfter)
            ? handler(change, context)
            : Promise.resolve();
    };
};

//Find all tokens for a specified user
const findTokensFromUser = async (userId: string) => {
    const tokens: string[] = [];
    await admin.firestore().collection('devices').where('userId', '==', userId)
        .get()
        .then((val) => {
            val.forEach(
                doc => tokens.push(doc.data().token)
            );
        });
    return tokens;
}

const findTokenFromUserList = async (subscribers: string[]) => {
    const tokens: string[] = [];
    for (const subscriber of subscribers) {
        tokens.push(...await findTokensFromUser(subscriber));
    }
    return tokens;
}


const findTokensFromListSubscribers = async (listId: string) => {
    const tokens: string[] = [];
    await admin.firestore().collection('todolists').doc(listId).get()
        .then(async (list) => {
            for (const subscriber of list.data()!.subscribers) {
                tokens.push(...await findTokensFromUser(subscriber));
            }
        });
    return tokens;
}

const sendMessage = async (subscribersTokens: string[], payload: any) => {
    if (subscribersTokens.length > 0) {
        await admin.messaging().sendToDevice(subscribersTokens, payload).then((response) => {
            // For each message check if there was an error.
            response.results.forEach(async (result, idx) => {
                const error = result.error;
                if (error) {
                    // Cleanup the tokens who are not registered anymore.
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                        await admin.firestore().collection('devices').doc(subscribersTokens[idx]).delete();
                    }
                }
            });
        });
    }

}

export const subscribe = functions.https.onCall(
    async (data, context) => {
        const tokens = await findTokensFromUser(data.token);
        await admin.messaging().subscribeToTopic(tokens, data.topic);
        return 'Welcome to Tonic ! ';
    }
);

export const unsubscribe = functions.https.onCall(
    async (data, context) => {
        const tokens = await findTokensFromUser(data.token);
        await admin.messaging().unsubscribeFromTopic(tokens, data.topic);
        return 'unsubscribed to ' + data.topic;
    }
);

//Message send to users when changing complete status
export const sendOnListItemCompleteChanged = functions.region('europe-west1').firestore
    .document('todolists/{listId}/todoitems/{itemID}')
    .onUpdate(field('complete', 'CHANGED', async (snapshot, context) => {
        const item = snapshot.after.data();
        const documentRef = snapshot.after.ref.firestore.doc('/todolists/' + context.params.listId);
        const list = await documentRef.get().then((val) => val.data()!);
        const payload = {
            notification: {
                title: 'Item updated from list ' + list.name,
                body: item!.name + ' set to ' + item!.complete
            }
        }

        return sendMessage(await findTokensFromListSubscribers(list.uuid), payload);
    }));

//Message to send to users who subscrided to list add
export const sendOnNewSharedList = functions.region('europe-west1').firestore
    .document('todolists/{listId}')
    .onUpdate(field('shared', 'CHANGED', async (snapshot, context) => {
        const list = snapshot.after.data();
        if (list!.shared) {
            let senderName = '';
            let followers: string[] = [];
            await admin.firestore().collection('users').where('uid', '==', list!.owner).limit(1)
                .get()
                .then((val) => {
                    val.forEach(
                        doc => {
                            senderName = doc.data().displayName;
                            followers = doc.data().followers;
                        }
                    );
                });
            const payload = {
                notification: {
                    title: senderName + ' shared a list !',
                    body: list!.name + ' is now available !'
                }
            }
            return sendMessage(await findTokenFromUserList(followers), payload);
        }
    }));

/**
 * Before deleting the list : unsubscribe each device which subscribed to it 
 * and clean the todoitems nested collection
 */
export const onDeleteList = functions.region('europe-west1').firestore
    .document('todolists/{listId}')
    .onDelete(async (snapshot, context) => {
        const list = snapshot.data();
        const subscribers = list!.subscribers;
        const payload = {
            notification: {
                title: 'A list where you subscribed was deleted !',
                body: 'List ' + list!.name + ' deleted !'
            }
        }
        await sendMessage(await findTokenFromUserList(subscribers), payload);
        // Delete nested list items
        const collectionRef = snapshot.ref.firestore.collection('/todolists/' + context.params.listId + "/todoitems");
        await collectionRef.get().then((val) => {
            val.forEach(async doc => doc.ref.delete());
        }
        );
        return index.deleteObject(context.params.listId);
    });


export const onListNameChange = functions.region('europe-west1').firestore
    .document('todolists/{listId}')
    .onUpdate(field('name', 'CHANGED', async (snapshot, context) => {
        const list = snapshot.after.data();
        const subscribers = list!.subscribers;
        const payload = {
            notification: {
                title: 'The name of a list where you subscribed was modified !',
                body: snapshot.before.data()!.name + ' changed to ' + list!.name + ' !'
            }
        }
        await sendMessage(await findTokenFromUserList(subscribers), payload);
        list!.objectID = context.params.listId;
        return index.saveObject(list);
    }));


export const onListCreated = functions.region('europe-west1').firestore
    .document('todolists/{listId}')
    .onCreate(async (snapshot, context) => {
        const list = snapshot.data()!;
        list.objectID = context.params.listId;
        return index.saveObject(list);

    });


export const onUserCreated = functions.region('europe-west1').firestore
    .document('users/{userId}')
    .onCreate(async (snapshot, context) => {
        const user = snapshot.data()!;
        user.objectID = context.params.userId;
        user.followers = [];
        return indexUsers.saveObject(user);

    });

export const onUserUpdated = functions.region('europe-west1').firestore
    .document('users/{userId}')
    .onUpdate(async (snapshot, context) => {
        const user = snapshot.after.data()!;
        user.objectID = context.params.userId;
        user.followers = [];
        return indexUsers.saveObject(user);
    });

export const onMessageCreated = functions.region('europe-west1').firestore
    .document('conversations/{convId}/messages/{messageId}')
    .onCreate(async (snapshot, context) => {
        const message = snapshot.data()!;
        let senderName = '';
        await admin.firestore().collection('users').where('uid', '==', message.sender).limit(1)
            .get()
            .then((val) => {
                val.forEach(
                    doc => senderName = doc.data().displayName
                );
            });

        const title = 'New message from ' + senderName + ' !';
        let body = message.content;
        if(message.content.indexOf('vocal-message-header//') !== -1) {
            body = 'New voice message !';
        }
        
        const payload = {
            notification: {
                title,
                body
            }
        }
        await sendMessage(await findTokenFromUserList(message.receivers), payload);
    });