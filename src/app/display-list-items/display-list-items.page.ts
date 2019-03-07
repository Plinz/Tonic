import { Component, OnInit } from '@angular/core';
import { TodoServiceProvider } from '../service/todo-service/todo-service.service';
import { TodoItem, TodoList } from "../domain/todo";
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, IonItemSliding, ToastController } from '@ionic/angular';
import { ModalListItemComponent } from './modal/modal-list-item.page';
import { GoogleAuthService } from '../service/google-auth-service/google-auth-service';
import { ImageUploaderService } from '../service/image-uploader/image-uploader-service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-display-list-items',
  templateUrl: './display-list-items.page.html',
  styleUrls: ['./display-list-items.page.scss'],
})
export class DisplayListItemsPage implements OnInit {

  list: TodoList;
  todos: TodoItem[];
  uuid: string;
  user: firebase.User;


  constructor(private todoServiceProvider: TodoServiceProvider,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private modalController: ModalController,
    private gAuth: GoogleAuthService,
    private imageService: ImageUploaderService,
    private barcodeScanner: BarcodeScanner) { }

  ngOnInit() {
    this.uuid = this.route.snapshot.paramMap.get('id');
    this.todoServiceProvider.getUniqueList(this.uuid).subscribe(res => {
      this.list = res;
    });
    this.todoServiceProvider.getTodos(this.uuid).subscribe(res => this.todos = res);
    this.gAuth.user.subscribe((res) => this.user = res);
  }

  async deleteConfirm(todo: TodoItem) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Do you want to delete this item?',
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
            this.todoServiceProvider.deleteTodo(this.list, todo);
          }
        }
      ]
    });
    await alert.present();
  }

  async add() {
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: ModalListItemComponent,
        componentProps: {
          list: this.list,
          itemName: '',
          itemDescription: '',
          mode: 'add'
        }
      });
    await modal.present();
  }

  changeCheck(item) {
    this.todoServiceProvider.changeCheck(this.list, item);
  }

  subscribeToList() {
    this.todoServiceProvider.subscribeToList(this.list);
  }

  unsubscribeFromList() {
    this.todoServiceProvider.unsubscribeFromList(this.list);
  }

  changeShared() {
    this.todoServiceProvider.changeSharedStatus(this.list.uuid, this.list.shared);
  }

  async edit(itemChosen: TodoItem, slidingItem: IonItemSliding) {
    await slidingItem.close();
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: ModalListItemComponent,
        componentProps: {
          list: this.list,
          itemName: itemChosen.name,
          itemDescription: itemChosen.desc,
          mode: 'edit',
          item: itemChosen
        }
      });
    await modal.present();
  }

  async delete(item: TodoItem, slidingItem: IonItemSliding) {
    await slidingItem.close();
    this.deleteConfirm(item);
  }


  isSubscriber() {
    return this.list.subscribers.findIndex(val => val === this.user.uid) !== -1;
  }

  copyList() {
    this.todoServiceProvider.copyList(this.list, this.todos);
  }

  async uploadImage() {
    const alert = await this.alertCtrl.create({
      buttons: [
        {
          text: 'Photo',
          handler: async (blah) => {
            await this.imageService.useCam(this.list.uuid);
          }
        }, {
          text: 'Gallery',
          handler: async () => {
            this.imageService.findPic(this.list.uuid);
          }
        }
      ]
    });
    await alert.present();
  }

  encodedText() {
    this.list.items = this.todos;
    this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE, JSON.stringify(this.list)).then((encodedData) => {
    }, (err) => {
    });
  }

}
