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

export const subscribe = functions.https.onCall(
    async (data, context) => {
        await admin.messaging().subscribeToTopic(data.token, data.topic);
        return 'subscribed to ' + data.topic;
    }
);

export const unsubscribe = functions.https.onCall(
    async (data, context) => {
        await admin.messaging().unsubscribeFromTopic(data.token, data.topic);
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

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
