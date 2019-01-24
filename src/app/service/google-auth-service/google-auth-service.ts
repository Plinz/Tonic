import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { auth } from 'firebase/app';
import { ToastController, Platform, NavController } from '@ionic/angular';
import { FcmService } from '../fcm-service/fcm.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { User } from 'src/app/domain/user';
import {share} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GoogleAuthService {

    user: Observable<firebase.User>;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: NavController,
        private toastController: ToastController,
        private fcm: FcmService,
        private platform: Platform,
        private gplus: GooglePlus) {
        this.afAuth.authState.subscribe(
            user => {
                if (user) {
                    this.user = this.afAuth.user;
                } else {
                    this.user = of(null).pipe(share());
                }
            }
        );
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

        const userRef: AngularFirestoreDocument<any> = this.afs.doc('users/' + user.uid);

        const data: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        }

        userRef.set(data, { merge: true });
        this.fcm.requestPermission(user.uid);
        this.router.navigateForward("/tabs");

    }


    signOut() {
        this.afAuth.auth.signOut().then(() => {
            this.router.navigateRoot('');
        });
    }

}