import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { auth } from 'firebase/app';
import { Platform, NavController, LoadingController } from '@ionic/angular';
import { FcmService } from '../fcm-service/fcm.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import * as firebase from 'firebase';

@Injectable({
    providedIn: 'root',
})
export class GoogleAuthService {

    user: Observable<firebase.User>;
    isConnected: boolean;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: NavController,
        private fcm: FcmService,
        private platform: Platform,
        private gplus: GooglePlus,
        private loading: LoadingController) {
        this.isConnected = false;
        this.afAuth.authState.subscribe(
            user => {
                this.user = this.afAuth.user;
            }
        );
    }

    isAuthenticated() {
        return this.isConnected;
    }

    googleLogin() {
        const provider = new auth.GoogleAuthProvider()
        return this.oAuthLogin(provider);
    }

    private async oAuthLogin(provider) {
        if (this.platform.is('cordova')) {
            const loader = await this.loading.create({ message: 'Connecting !' });
            const gplusUser = await this.gplus.login({
                'webClientId': '1036845890573-j59mac31rt2ubbc96pfrbrv0gekju6er.apps.googleusercontent.com',
                'scopes': 'profile email'
            });
            await loader.present();
            return await this.afAuth.auth.signInAndRetrieveDataWithCredential(provider.credential(gplusUser.idToken)).then((credential) => {
                this.updateUserData(credential.user);
            }).catch((error) => {
                alert('Failed to connect !');
            }).finally(() => {
                loader.dismiss();
            });
        }
        else {
            return this.afAuth.auth.signInWithPopup(provider)
                .then((credential) => {
                    this.updateUserData(credential.user);
                }).catch((error) => {
                    alert('Failed to connect !');
                });
        }
    }

    private updateUserData(user) {
        // Sets user data to firestore on login
        this.isConnected = true;
        const userRef: AngularFirestoreDocument<any> = this.afs.doc('users/' + user.uid);

        const data = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            followers: firebase.firestore.FieldValue.arrayUnion("x")
        }

        userRef.set(data, { merge: true });
        this.fcm.requestPermission(user.uid);
        this.router.navigateForward("/tabs");

    }

    signOut() {
        this.afAuth.auth.signOut().then(() => {
            if (this.platform.is('cordova')) {
                this.gplus.logout().then(() => {
                    this.isConnected = false;
                    this.router.navigateRoot('');
                });
            }
            else {
                this.isConnected = false;
                this.router.navigateRoot('');
            }
        });
    }
}