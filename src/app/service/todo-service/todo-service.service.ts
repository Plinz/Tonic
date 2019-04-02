import { Injectable } from '@angular/core';
import { TodoItem, TodoList } from "./../../domain/todo";
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import { combineLatest } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { GoogleAuthService } from '../google-auth-service/google-auth-service';
import { LoadingController } from '@ionic/angular';
import * as algoliasearch from 'algoliasearch';

@Injectable({
  providedIn: 'root',
})
export class TodoServiceProvider {
  itemsCollection: AngularFirestoreCollection<TodoList>;
  user: firebase.User;
  ALGOLIA_APP_ID = 'LLHP7Z6FT9';     // Required - your Algolia app ID
  ALGOLIA_SEARCH_KEY = '4d8446bfb7181e9d71d8ff1c350270ae'; // Optional - Only used for unauthenticated search

  constructor(private afs: AngularFirestore,
    private gAuth: GoogleAuthService,
    private loadingController: LoadingController) {
    this.itemsCollection = afs.collection<TodoList>('todolists');
    this.gAuth.user.subscribe((res) => this.user = res);
  }

  private requestList(collection: AngularFirestoreCollection<TodoList>): Observable<TodoList[]> {
    return collection.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as TodoList;
        const id = action.payload.doc.id;
        const items = [];
        this.getTodos(data.uuid).subscribe((res) => {
          items.length = 0;
          res.forEach((item) => {
            items.push(item);
          });
        });
        return { id, ...data, items };
      });
    });
  }

  public algolia_search(query, callback, type: string) {

    // [START search_index_unsecure]
    const client = algoliasearch(this.ALGOLIA_APP_ID, this.ALGOLIA_SEARCH_KEY);
    const index = client.initIndex('shared-lists');
    const afsCopy = this.afs;
    let initialObservable = afsCopy.collection("todolists", ref => ref.where("name", "==", "")).valueChanges();
    const zipO: Observable<any>[] = [];
    zipO.push(initialObservable);

    return index.search(query, (err, content) => {
      const nameFound = [];
      for (const item of content.hits) {
        if (nameFound.findIndex(val => val === item.name) == -1) {
          let newObs;
          if (type === 'shared') {
            newObs = this.requestList(afsCopy.collection("todolists", ref => ref.where("name", "==", item.name).where("shared", "==", true)));
          }
          else {
            newObs = this.requestList(afsCopy.collection("todolists", ref => ref.where("name", "==", item.name).where("owner", "==", this.user.uid)));
          }
          zipO.push(newObs);
          nameFound.push(item.name);
        }
      }
      callback(combineLatest(...zipO));
    });
  }

  public getMyLists(): Observable<TodoList[]> {
    //const lists = this.afs.collection<TodoList>('todolists', ref => ref.where('shared', '==', true).where('uuid','<',this.user.uid).where('uuid','>',this.user.uid));
    const lists = this.afs.collection<TodoList>('todolists', ref => ref.where('owner', '==', this.user.uid));
    return this.requestList(lists);
  }

  public getSharedLists(): Observable<TodoList[]> {
    //const lists = this.afs.collection<TodoList>('todolists', ref => ref.where('shared', '==', true).where('uuid','<',this.user.uid).where('uuid','>',this.user.uid));
    const lists = this.afs.collection<TodoList>('todolists', ref => ref.where('shared', '==', true));
    return this.requestList(lists);
  }

  public getTodos(listUuid: string): Observable<TodoItem[]> {
    return this.itemsCollection.doc(listUuid).collection<TodoItem>('todoitems').valueChanges();
  }

  public getList(): Observable<TodoList[]> {
    return this.requestList(this.itemsCollection);
  }

  public getUniqueList(uuid: string): Observable<TodoList> {
    return this.afs.collection<TodoList>('todolists', ref => ref.where('uuid', '==', uuid).limit(1)).valueChanges().map(vendors => vendors[0]);
  }

  public deleteList(listId: string) {
    this.itemsCollection.doc(listId).delete();
  }

  public subscribeToList(list: TodoList) {
    this.itemsCollection.doc(list.uuid).update({
      subscribers: firebase.firestore.FieldValue.arrayUnion(this.user.uid)
    });
  }

  public editDownloadURL(listID: string, url: string) {
    this.itemsCollection.doc(listID).update({
      photoURL: url
    });
  }

  public unsubscribeFromList(list: TodoList) {
    this.itemsCollection.doc(list.uuid).update({
      subscribers: firebase.firestore.FieldValue.arrayRemove(this.user.uid)
    });
  }

  public addList(listName: string) {
    const newList: TodoList = { uuid: this.afs.createId(), name: listName, nbNotFinished: 0, shared: false, owner: this.user.uid, items: [], subscribers: [] };
    this.itemsCollection.doc(newList.uuid).set(newList);
  }

  public addTodo(list: TodoList, itemName: string, itemDescription: string, geoloc: number[]) {
    let newTodo: TodoItem = { uuid: this.afs.createId(), name: itemName, desc: itemDescription, complete: false };
    if (geoloc) {
      newTodo.geoloc = geoloc;
    }
    this.itemsCollection.doc(list.uuid).collection('todoitems').doc(newTodo.uuid).set(newTodo);
  }

  public changeSharedStatus(listUuid: string, value: boolean) {
    this.itemsCollection.doc(listUuid).update({
      shared: value
    });
  }

  public changeCheck(list: TodoList, editedItem: TodoItem) {
    this.itemsCollection.doc(list.uuid).collection('todoitems').doc(editedItem.uuid).update(
      { complete: editedItem.complete }
    );
  }

  public editTodo(listUuid: string, editedItem: TodoItem) {
    this.itemsCollection.doc(listUuid).collection('todoitems').doc(editedItem.uuid).set(editedItem);
  }

  public editListName(listUuid: string, name: string) {
    this.itemsCollection.doc(listUuid).update({ name: name });
  }

  public deleteTodo(list: TodoList, oldTodo: TodoItem) {
    this.itemsCollection.doc(list.uuid).collection('todoitems').doc(oldTodo.uuid).delete();
  }

  public async copyListByID(listID: string) {
    const loading = await this.loadingController.create({ message: 'Copying your list !' });
    await loading.present();
    try {
      const list = await this.afs.collection<TodoList>('todolists', ref => ref.where('uuid', '==', listID).limit(1)).valueChanges().map(vendors => vendors[0]).first().toPromise();
      if (list) {
        const items = await this.itemsCollection.doc(listID).collection<TodoItem>('todoitems').valueChanges().first().toPromise();
        const newList: TodoList = {
          uuid: this.afs.createId(),
          name: list.name,
          nbNotFinished: 0,
          shared: false,
          owner: this.user.uid,
          items: [],
          subscribers: []
        };
        const baseRef = this.afs.collection('todolists');
        const batch = this.afs.firestore.batch();
        batch.set(baseRef.doc(newList.uuid).ref, newList);
        for (const item of items) {
          batch.set(baseRef.doc(newList.uuid).collection('todoitems').doc(item.uuid).ref, item);
        }
        await batch.commit();
      }
    }
    catch (error) {
      alert('Error during copy !');
    }
    finally {
      await loading.dismiss();
    }
  }
} 