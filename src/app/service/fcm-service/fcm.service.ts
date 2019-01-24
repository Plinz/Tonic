import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { tap } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { TodoList } from 'src/app/domain/todo';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class FcmService {

    token;
    constructor(private afMessaging: AngularFireMessaging,
        private toastController: ToastController,
        private fun: AngularFireFunctions,
        private afs: AngularFirestore) {
        this.afMessaging.messaging.subscribe((_messaging) => {
            _messaging.onMessage = _messaging.onMessage.bind(_messaging);
            _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
        })
    }

    requestPermission(uid) {
        this.afMessaging.requestToken
            .subscribe(
                (token) => {
                    this.token = token;
                    const devicesRef = this.afs.collection('devices');

                    const data = {
                        token,
                        userId: uid
                    };
                    return devicesRef.doc(token).set(data);
                },
                (error) => { console.error(error); },
            );
    }

    async makeToast(message) {
        console.log(message);
        const toast = await this.toastController.create({
            message,
            duration: 5000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'dismiss'
        });
        toast.present();
    }

    showMessages()  {
        this.afMessaging.messages.subscribe((payload) => {
            console.log("new message received. ", payload);
            this.makeToast(payload);
        })
    }

    createList(list: TodoList) {
        this.fun
            .httpsCallable('createList')({ list, token: this.token })
            .pipe(tap(_ => this.makeToast('Make list ' + list.name)))
            .subscribe();
    }
}
