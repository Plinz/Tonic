import { Component, OnInit } from '@angular/core';
import { TodoServiceProvider } from '../service/todo-service/todo-service.service';
import { TodoItem, TodoList } from "../domain/todo";
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, IonItemSliding } from '@ionic/angular';
import { ModalListItemComponent } from './modal/modal-list-item.page';

@Component({
  selector: 'app-display-list-items',
  templateUrl: './display-list-items.page.html',
  styleUrls: ['./display-list-items.page.scss'],
})
export class DisplayListItemsPage implements OnInit {

  list: TodoList;
  uuid: string;

  constructor(private todoServiceProvider: TodoServiceProvider,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    public modalController: ModalController) { }

  ngOnInit() {
    this.uuid = this.route.snapshot.paramMap.get('id');
    this.todoServiceProvider.getUniqueList(this.uuid).subscribe(res => { this.list = res });
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
            this.todoServiceProvider.deleteTodo(this.uuid, todo);
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
            listUuid: this.uuid,
            itemName: '',
            itemDescription: '',
            mode: 'add'
          }
    });
    await modal.present();
}

async edit(itemChosen: TodoItem,slidingItem: IonItemSliding) {
  await slidingItem.close();
  const modal: HTMLIonModalElement =
     await this.modalController.create({
        component: ModalListItemComponent,
        componentProps: {
          listUuid: this.uuid,
          itemName: itemChosen.name,
          itemDescription: itemChosen.desc,
          mode: 'edit',
          item: itemChosen
        }
  });
  await modal.present();
}

  async delete(item: TodoItem,slidingItem: IonItemSliding) {
    await slidingItem.close();
    this.deleteConfirm(item);
  }
}
