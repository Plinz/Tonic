import { Injectable } from '@angular/core';
import { ToastController, Platform } from '@ionic/angular';
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
        private afs: AngularFirestore,
        private platform: Platform) {
        this.afMessaging.messaging.subscribe((_messaging) => {
            _messaging.onMessage = _messaging.onMessage.bind(_messaging);
            _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
        })
    }

    public saveToken(uid) {
        const devicesRef = this.afs.collection('devices');
        const data = {
            token: this.token,
            userId: uid
        };
        devicesRef.doc(this.token).set(data);
        this.sub('todolists');

    }

    async requestPermission(uid) {
        if (this.platform.is('cordova')) {
            this.token = await this.fs.getToken();
            this.saveToken(uid);
        }
        else {
            this.afMessaging.requestToken.subscribe(
                (token) => {
                    this.token = token;
                    this.saveToken(uid);
                },
                (error) => { console.error(error); },
            );
        }
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
            this.makeToast(payload.notification.title);
        })
    }

    sub(topic) {
        this.fun
            .httpsCallable('subscribe')({ topic, token: this.token })
            .pipe(tap(_ => this.makeToast(_)))
            .subscribe();
    }


    unsub(topic) {
        this.fun
            .httpsCallable('unsubscribe')({ topic, token: this.token })
            .pipe(tap(_ => this.makeToast(_)))
            .subscribe();
    }
}
