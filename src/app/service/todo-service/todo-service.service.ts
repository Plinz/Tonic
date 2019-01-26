import { Injectable } from '@angular/core';
import { TodoItem, TodoList } from "./../../domain/todo";
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { GoogleAuthService } from '../google-auth-service/google-auth-service';
import { FcmService } from '../fcm-service/fcm.service';

@Injectable({
  providedIn: 'root',
})
export class TodoServiceProvider {
  itemsCollection: AngularFirestoreCollection<TodoList>;
  items: Observable<TodoList[]>;
  user: firebase.User;

  constructor(private afs: AngularFirestore,
    private gAuth: GoogleAuthService,
    private fcm: FcmService) {
    this.itemsCollection = afs.collection<TodoList>('todolists');
    this.items = this.itemsCollection.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as TodoList;
        const id = action.payload.doc.id;
        return { id, ...data };
      });
    });
    this.gAuth.user.subscribe((res) => this.user = res);
  }

  public getMyLists(): Observable<TodoList[]> {
    //const lists = this.afs.collection<TodoList>('todolists', ref => ref.where('shared', '==', true).where('uuid','<',this.user.uid).where('uuid','>',this.user.uid));
    const lists = this.afs.collection<TodoList>('todolists', ref => ref.where('owner', '==', this.user.uid));
    return lists.valueChanges().map(vendors => vendors);
  }

  public getSharedLists(): Observable<TodoList[]> {
    //const lists = this.afs.collection<TodoList>('todolists', ref => ref.where('shared', '==', true).where('uuid','<',this.user.uid).where('uuid','>',this.user.uid));
    const lists = this.afs.collection<TodoList>('todolists', ref => ref.where('shared', '==', true));
    return lists.valueChanges().map(vendors => vendors);
  }

  public getTodos(listUuid: string): Observable<TodoItem[]> {
    return this.itemsCollection.doc(listUuid).collection<TodoItem>('todoitems').valueChanges().map(vendors => vendors);
  }

  public getList(): Observable<TodoList[]> {
    return this.items;
  }

  public getUniqueList(uuid: string): Observable<TodoList> {
    return this.afs.collection<TodoList>('todolists', ref => ref.where('uuid', '==', uuid).limit(1))
      .valueChanges().map(vendors => vendors[0]);
  }

  public deleteList(listId: string) {
    this.itemsCollection.doc(listId).delete();
  }

  public subscribeToList(list: TodoList) {
    this.itemsCollection.doc(list.uuid).update({
      subscribers: firebase.firestore.FieldValue.arrayUnion(this.user.uid)
    });
    this.afs.collection<TodoList>('users', ref => ref.where('uuid', '==', this.user.uid))
      .doc(this.user.uid).update({
        topics: firebase.firestore.FieldValue.arrayUnion('todolists-' + list.uuid)
      });
    this.fcm.sub('todolists-' + list.uuid, this.user.uid);
  }

  public unsubscribeFromList(list: TodoList) {
    this.itemsCollection.doc(list.uuid).update({
      subscribers: firebase.firestore.FieldValue.arrayRemove(this.user.uid)
    });
    this.afs.collection<TodoList>('users', ref => ref.where('uuid', '==', this.user.uid))
      .doc(this.user.uid).update({
        topics: firebase.firestore.FieldValue.arrayRemove('todolists-' + list.uuid)
      });
    this.fcm.unsub('todolists-' + list.uuid, this.user.uid);
  }

  public addList(listName: string) {
    const newList: TodoList = { uuid: this.afs.createId(), name: listName, nbNotFinished: 0, shared: false, owner: this.user.uid, items: [], subscribers: [] };
    this.itemsCollection.doc(newList.uuid).set(newList);
  }

  public addTodo(list: TodoList, itemName: string, itemDescription: string) {
    const newTodo: TodoItem = { uuid: this.afs.createId(), name: itemName, desc: itemDescription, complete: false };
    this.itemsCollection.doc(list.uuid).update({
      nbNotFinished: list.nbNotFinished + 1
    });
    this.itemsCollection.doc(list.uuid).collection('todoitems').doc(newTodo.uuid).set(newTodo);
  }

  public changeSharedStatus(listUuid: string, value: boolean) {
    this.itemsCollection.doc(listUuid).update({
      shared: value
    });
  }

  public changeCheck(list: TodoList, editedItem: TodoItem) {
    if (editedItem.complete === true) {
      this.itemsCollection.doc(list.uuid).update({
        nbNotFinished: list.nbNotFinished - 1
      });
    } else {
      this.itemsCollection.doc(list.uuid).update({
        nbNotFinished: list.nbNotFinished + 1
      });
    }
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
    if (!oldTodo.complete) {
      this.itemsCollection.doc(list.uuid).update({
        nbNotFinished: list.nbNotFinished - 1
      });
    }
    this.itemsCollection.doc(list.uuid).collection('todoitems').doc(oldTodo.uuid).delete();
  }
} 