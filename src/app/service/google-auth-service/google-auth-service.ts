import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from "rxjs/Observable";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { auth } from 'firebase/app';
import { ToastController, Platform } from '@ionic/angular';
import { FcmService } from '../fcm-service/fcm.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

@Injectable({
    providedIn: 'root',
})
export class GoogleAuthService {

    user: Observable<User>;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: Router,
        private toastController: ToastController,
        private fcm: FcmService,
        private platform: Platform,
        private gplus: GooglePlus) {
        this.afAuth.authState.subscribe(
            user => {
                if (user) {
                    this.user = this.afs.doc<User>(`users/${user.uid}`).valueChanges()
                } else {
                    this.user = of(null)
                }
            }
        )
    }

    private async presentToast(message) {
        const toast = await this.toastController.create({
            message,
            duration: 3000
        });
        toast.present();
    }

    private notificationSetup(uid) {
        this.fcm.getToken(uid);
        this.fcm.onNotifications().subscribe(
            (msg) => {
                if (this.platform.is('ios')) {
                    this.presentToast(msg.aps.alert);
                } else if (this.platform.is('android')) {
                    this.presentToast(msg.body);
                }
            });
    }

    googleLogin() {
        const provider = new auth.GoogleAuthProvider()
        return this.oAuthLogin(provider);
    }

    private async oAuthLogin(provider) {
        if (this.platform.is('cordova')) {
            const gplusUser = await this.gplus.login({
                'webClientId': '1036845890573-j59mac31rt2ubbc96pfrbrv0gekju6er.apps.googleusercontent.com',
                'offline': true,
                'scopes': 'profile email'
            })
            return await this.afAuth.auth.signInWithCredential(provider.credential(gplusUser.idToken)).then((credential) => {
                this.updateUserData(credential);
            });
        }
        else {
            return this.afAuth.auth.signInWithPopup(provider)
                .then((credential) => {
                    this.updateUserData(credential.user)
                });
        }
    }

    private updateUserData(user) {
        // Sets user data to firestore on login

        const userRef: AngularFirestoreDocument<any> = this.afs.doc('users/'+user.uid);

        const data: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        }

        userRef.set(data, { merge: true });
        this.notificationSetup(data.uid);
        this.router.navigate(["/tabs"]);

    }


    signOut() {
        this.afAuth.auth.signOut().then(() => {
            this.router.navigate(['']);
        });
    }

}