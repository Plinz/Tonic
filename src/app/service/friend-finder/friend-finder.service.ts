import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import { combineLatest } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { GoogleAuthService } from '../google-auth-service/google-auth-service';
import * as algoliasearch from 'algoliasearch';
import { MessageTonic } from 'src/app/domain/message-tonic';

@Injectable({
    providedIn: 'root',
})
export class FriendFinderService {
    public user: firebase.User;
    private ALGOLIA_APP_ID = 'LLHP7Z6FT9';     // Required - your Algolia app ID
    private ALGOLIA_SEARCH_KEY = '4d8446bfb7181e9d71d8ff1c350270ae'; // Optional - Only used for unauthenticated search

    constructor(private afs: AngularFirestore,
        private gAuth: GoogleAuthService) {
        this.gAuth.user.subscribe((res) => this.user = res);
    }

    public findOneFriend(uid: string) {
        return this.afs.collection('users').doc(uid).valueChanges();
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
            callback(combineLatest(...zipO));
        });
    }

    public sendMessage(friendId: string, content: string) {
        let conversationID = this.user.uid + friendId;
        if (this.user.uid > friendId) {
            conversationID = friendId + this.user.uid;
        }
        const message: MessageTonic = {
            uid: this.afs.createId(),
            sender: this.user.uid,
            receivers: [friendId],
            photoURL: this.user.photoURL,
            content,
            date: Date.now()
        };
        this.afs.collection('conversations')
            .doc(conversationID)
            .collection('messages')
            .doc(message.uid)
            .set(message);
    }

    public retrieveConversation(friendId: string): Observable<any[]> {
        let conversationID = this.user.uid + friendId;
        if (this.user.uid > friendId) {
            conversationID = friendId + this.user.uid;
        }
        return this.afs.collection('conversations').doc(conversationID).collection('messages', ref => ref.orderBy('date', 'desc').limit(40)).valueChanges();

    }

    public retrieveFollowers() {
        return this.afs.collection('users', ref => ref.where('followers', 'array-contains', this.user.uid).orderBy('displayName')).valueChanges();
    }

    public follow(id: string) {
        this.afs.collection('users').doc(id).update(
            {
                followers: firebase.firestore.FieldValue.arrayUnion(this.user.uid),
            }
        );
    }

    public unfollow(id: string) {
        this.afs.collection('users').doc(id).update(
            {
                followers: firebase.firestore.FieldValue.arrayRemove(this.user.uid),
            }
        );
    }
}
