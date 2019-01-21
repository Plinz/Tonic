import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { TodoItem, TodoList } from "./../../domain/todo";
import { Observable } from "rxjs/Observable";
import { of } from 'rxjs';
import 'rxjs/Rx';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class TodoServiceProvider {
  itemsCollection: AngularFirestoreCollection<TodoList>;
  items: Observable<TodoList[]>;

  constructor(private afs: AngularFirestore) {
    this.itemsCollection = afs.collection<TodoList>('todolists');
    this.items = this.itemsCollection.snapshotChanges().map(actions => {
      return actions.map(action => {
        let data = action.payload.doc.data() as TodoList;
        const id = action.payload.doc.id;
        return { id, ...data };
      });
    });
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

  public addList(listName: string) {
    const newList: TodoList = { uuid: this.afs.createId(),name: listName, items: [] };
    this.itemsCollection.doc(newList.uuid).set(newList);
  }

  public addTodo(listUuid: string, itemName: string, itemDescription: string) {
    const newTodo: TodoItem = { uuid: this.afs.createId(), name: itemName, desc: itemDescription, complete: false };
    this.itemsCollection.doc(listUuid).update({
      items: firebase.firestore.FieldValue.arrayUnion(newTodo)
    });
  }

  public editTodo(listUuid: string, oldItem: TodoItem, editedItem: TodoItem) {
    editedItem.uuid = this.afs.createId();
    this.itemsCollection.doc(listUuid).update({
      items: firebase.firestore.FieldValue.arrayRemove(oldItem)
    });
    this.itemsCollection.doc(listUuid).update({
      items: firebase.firestore.FieldValue.arrayUnion(editedItem)
    });
  }

  public editListName(listUuid: string, name: string) {
    this.itemsCollection.doc(listUuid).update({ name: name });
  }

  public deleteTodo(listUuid: string, oldTodo: TodoItem) {
    this.itemsCollection.doc(listUuid).update({
      items: firebase.firestore.FieldValue.arrayRemove(oldTodo)
    });
  }
} 