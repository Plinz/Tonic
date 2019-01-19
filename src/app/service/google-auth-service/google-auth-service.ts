import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform } from '@ionic/angular';
import {Observable} from "rxjs/Observable";
import * as firebase from 'firebase/app';

@Injectable({
    providedIn: 'root',
})
export class GoogleAuthService {

    user: Observable<firebase.User>;

    constructor(private loadingController: LoadingController,
        private nativeStorage: NativeStorage,
        private router: Router,
        private gplus: GooglePlus,
        private afAuth: AngularFireAuth,
        private platform: Platform) {
        this.user = this.afAuth.authState;

    }

    getUser () : Observable<firebase.User> {
        return this.user;
    }

    async nativeGoogleLogin(): Promise<any> {
        try {

            const gplusUser = await this.gplus.login({
                'webClientId': '1036845890573-j59mac31rt2ubbc96pfrbrv0gekju6er.apps.googleusercontent.com',
                'offline': true,
                'scopes': 'profile email'
            })
            let p = await this.afAuth.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken))
            this.router.navigate(["/tabs"]);
            return p;

        } catch (err) {
            console.log(err)
        }
    }

    async webGoogleLogin(): Promise<void> {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const credential = await this.afAuth.auth.signInWithPopup(provider);
            this.router.navigate(["/tabs"]);
        } catch (err) {
            console.log(err)
        }
    }

    googleLogin() {
        if (this.platform.is('cordova')) {
            this.nativeGoogleLogin();
        } else {
            this.webGoogleLogin();
        }
    }

    signOut() {
        this.afAuth.auth.signOut();
    }

}