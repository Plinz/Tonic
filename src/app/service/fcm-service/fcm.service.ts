import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class FcmService {

    constructor(private firebase: Firebase,
        private afs: AngularFirestore,
        private platform: Platform) { }

    async getToken(uid) {
        let token;

        if (this.platform.is('cordova')) {
            token = await this.firebase.getToken();
        }

        if (this.platform.is('ios')) {
            token = await this.firebase.getToken();
            await this.firebase.grantPermission();
        }

        this.saveToken(token, uid);
    }

    private saveToken(token, uid) {
        if (!token) return;

        const devicesRef = this.afs.collection('devices');

        const data = {
            token,
            userId: uid
        };

        return devicesRef.doc(token).set(data);
    }

    onNotifications() {
        return this.firebase.onNotificationOpen();
    }
}