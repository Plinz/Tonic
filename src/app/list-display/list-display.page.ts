import { Component, OnInit } from '@angular/core';
import { TodoServiceProvider } from '../service/todo-service/todo-service.service';
import { TodoList } from '../domain/todo';
import { AlertController, IonItemSliding, NavController, Platform } from '@ionic/angular';
import { GoogleAuthService } from '../service/google-auth-service/google-auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-display',
  templateUrl: './list-display.page.html',
  styleUrls: ['./list-display.page.scss'],
})
export class ListDisplayPage implements OnInit {

  list: TodoList[];
  user: firebase.User;
  query: '';
  sub: Subscription;

  constructor(private todoServiceProvider: TodoServiceProvider,
    private alertCtrl: AlertController,
    private gAuth: GoogleAuthService,
    private router: NavController) { }

  ngOnInit() {
    this.todoServiceProvider.getMyLists().subscribe(res => { this.list = res; });
    this.gAuth.user.subscribe(res => { this.user = res; });
  }

  seeProfile() {
    this.router.navigateForward('/profile');
  }

  nbNotCompleted(uuid: String): number {
    const listItems = this.list.find(d => d.uuid === uuid).items;
    let nb = 0;
    for (const item of listItems) {
      if (!item.complete) {
        nb++;
      }
    }
    return nb;
  }

  async deleteConfirm(listId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete',
      message: 'Do you want to delete this list?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Delete',
          handler: () => {
            this.todoServiceProvider.deleteList(listId);
          }
        }
      ]
    });
    await alert.present();
  }

  async edit(item: TodoList, slidingItem: IonItemSliding) {
    await slidingItem.close();
    const alert = await this.alertCtrl.create({
      header: 'Edit list : ' + item.name,
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name',
          value: item.name
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.todoServiceProvider.editListName(item.uuid, data.name);
          }
        }
      ]
    });
    await alert.present();

  }

  async add() {
    const alert = await this.alertCtrl.create({
      header: 'Add a new list!',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.todoServiceProvider.addList(data.name);
          }
        }
      ]
    });
    await alert.present();
  }

  async delete(item: TodoList, slidingItem: IonItemSliding) {
    await slidingItem.close();
    this.deleteConfirm(item.uuid);
  }

  callback = (obs) => {
    this.sub.unsubscribe();
    this.sub = obs.subscribe((res) => this.list = [].concat(...res));
  }

  queryByName() {
    this.todoServiceProvider.algolia_search(this.query, this.callback, 'default');
  }

}
