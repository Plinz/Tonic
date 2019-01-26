import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { isEqual } from 'lodash';
import DocumentSnapshot = admin.firestore.DocumentSnapshot;
admin.initializeApp();

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

//Get all the topics from which a user subscribed
const findTopicsFromUser = async (userId: string) => {
    const topics: string[] = [];
    await admin.firestore().collection('users').where('uid', '==', userId)
        .get()
        .then((val) => {
            val.forEach(doc =>
                doc.data().topics.forEach((topic: string) => topics.push(topic))
            );
        });
    return topics;
}

//Find all tokens for a specified user
const findTokensFromUser = async (userId: string) => {
    const tokens: string[] = [];
    await admin.firestore().collection('devices').where('userId', '==', userId)
        .get()
        .then((val) => {
            val.forEach(doc => tokens.push(doc.data().token));
        });
    return tokens;
}

//When a user is inserted, give him a list of topics
export const onUserInserted = functions.region('europe-west1').firestore
    .document('users/{userID}')
    .onCreate(async (snapshot, context) => {
        await admin.firestore().collection('users').doc(context.params.userID).update({ topics: [] });
    });


//When a device is inserted, get all the topics frol which the user previously subscribed and subscribe the new device to it
export const onDeviceInserted = functions.region('europe-west1').firestore
    .document('devices/{deviceId}')
    .onCreate(async (snapshot, context) => {
        const device = snapshot.data();
        const topics: string[] = await findTopicsFromUser(device!.userId);
        topics.forEach(async (topic: string) => await admin.messaging().subscribeToTopic(device!.token, topic));

    });

export const subscribe = functions.https.onCall(
    async (data, context) => {
        const tokens = await findTokensFromUser(data.token);
        await admin.messaging().subscribeToTopic(tokens, data.topic);
        return 'subscribed to ' + data.topic;
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

        const notification: admin.messaging.Notification = {
            title: 'Item updated from list ' + list.name,
            body: item!.name + ' set to ' + item!.complete
        }

        const payload: admin.messaging.Message = {
            notification,
            topic: 'todolists-' + list.uuid
        }

        return admin.messaging().send(payload);
    }));

//Message to send to users who subscrided to list add
export const sendOnNewSharedList = functions.region('europe-west1').firestore
    .document('todolists/{listId}')
    .onUpdate(field('shared', 'CHANGED', async (snapshot, context) => {
        const list = snapshot.after.data();

        const notification: admin.messaging.Notification = {
            title: 'New shared list available !',
            body: list!.name + ' is now available !'
        }

        const payload: admin.messaging.Message = {
            notification,
            topic: 'todolists'
        }

        return admin.messaging().send(payload);
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
        const tokens: string[] = [];
        subscribers.forEach(async (val: string) => tokens.push(...await findTokensFromUser(val)));

        const notification: admin.messaging.Notification = {
            title: 'A list where you subscribed was deleted !',
            body: 'List  ' + list!.name + ' deleted !'
        }

        const payload: admin.messaging.Message = {
            notification,
            topic: 'todolists-' + list!.uuid
        }

        const collectionRef = snapshot.ref.firestore.collection('/todolists/' + context.params.listId + "/todoitems");

        await admin.messaging().send(payload);
        if (tokens.length > 0) {
            await admin.messaging().unsubscribeFromTopic(tokens, 'todolists-' + list!.uuid);
        }
        await collectionRef.get().then((val) => {
            val.forEach(async doc => doc.ref.delete());
        }
        );
    });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
