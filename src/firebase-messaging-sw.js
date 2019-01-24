importScripts('https://www.gstatic.com/firebasejs/5.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.0/firebase-messaging.js');

firebase.initializeApp({
    'messagingSenderId': '1036845890573'
});

const messaging = firebase.messaging();