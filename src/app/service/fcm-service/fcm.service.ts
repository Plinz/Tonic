import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { tap } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore } from '@angular/fire/firestore';
import { Firebase } from '@ionic-native/firebase/ngx';

@Injectable()
export class FcmService {

    token;
    constructor(private fs: Firebase,
        private afMessaging: AngularFireMessaging,
        private toastController: ToastController,
        private fun: AngularFireFunctions,
        private afs: AngularFirestore) {
        this.afMessaging.messaging.subscribe((_messaging) => {
            _messaging.onMessage = _messaging.onMessage.bind(_messaging);
            _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
        })
    }

    async requestPermission(uid) {
        this.token = await this.fs.getToken();
        const devicesRef = this.afs.collection('devices');
        const data = {
            token: this.token,
            userId: uid
        };
        devicesRef.doc(this.token).set(data);
        this.sub();
    }

    async makeToast(message) {
        const toast = await this.toastController.create({
            message,
            duration: 5000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'dismiss'
        });
        toast.present();
    }

    showMessages() {
        this.afMessaging.messages.subscribe((payload: any) => {
            console.log("new message received. ", payload);
            this.makeToast(payload.notification.title);
        })
    }

    sub() {
        this.fun
            .httpsCallable('createList')({ topic: 'todolists', token: this.token })
            .pipe(tap(_ => console.log('')))
            .subscribe();
    }
}
