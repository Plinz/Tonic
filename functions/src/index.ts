import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export const createList = functions.https.onCall(
    async (data, context) => {
        await admin.messaging().subscribeToTopic(data.token, data.topic);
        return 'suscribed to ' + data.topic;
    }
);


export const sendOnFirestoreCreate = functions.firestore
    .document('todolists/{listId}')
    .onCreate(async snapshot => {
        const list = snapshot.data;

        const notification: admin.messaging.Notification = {
            title: 'New list available',
            body: list.name
        }

        const payload: admin.messaging.Message = {
            notification,
            topic:'todolists'
        }

        return admin.messaging().send(payload);
    });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
