import { Injectable } from '@angular/core';
import { TodoItem, TodoList } from "./../../domain/todo";
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import { zip } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { GoogleAuthService } from '../google-auth-service/google-auth-service';
import { LoadingController } from '@ionic/angular';
import * as algoliasearch from 'algoliasearch';

@Injectable({
    providedIn: 'root',
})
export class FriendFinderService {
    user: firebase.User;
    ALGOLIA_APP_ID = 'LLHP7Z6FT9';     // Required - your Algolia app ID
    ALGOLIA_SEARCH_KEY = '4d8446bfb7181e9d71d8ff1c350270ae'; // Optional - Only used for unauthenticated search

    constructor(private afs: AngularFirestore,
        private gAuth: GoogleAuthService,
        private loadingController: LoadingController) {
        this.gAuth.user.subscribe((res) => this.user = res);
    }


    public algolia_search_users(query, callback) {

        // [START search_index_unsecure]
        const client = algoliasearch(this.ALGOLIA_APP_ID, this.ALGOLIA_SEARCH_KEY);
        const index = client.initIndex('users');
        const afsCopy = this.afs;
        let initialObservable = afsCopy.collection("users", ref => ref.where("displayName", "==", "")).valueChanges();
        const zipO: Observable<any>[] = [];
        zipO.push(initialObservable);

        return index.search(query, (err, content) => {
            const nameFound = [];
            for (const item of content.hits) {
                if (nameFound.findIndex(val => val === item.displayName) == -1) {
                    const newObs = afsCopy.collection("users", ref => ref.where("displayName", "==", item.displayName)).valueChanges();
                    zipO.push(newObs);
                    nameFound.push(item.displayName);
                }
            }
            callback(zip(...zipO));
        });
    }
} 