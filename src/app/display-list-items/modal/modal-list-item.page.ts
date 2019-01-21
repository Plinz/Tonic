import { Component } from '@angular/core';
import { TodoServiceProvider } from 'src/app/service/todo-service/todo-service.service';
import { ModalController, NavParams } from '@ionic/angular';
import { TodoItem } from 'src/app/domain/todo';

@Component({
    templateUrl: './modal-list-item.html',
    styleUrls: [],
    selector: 'modal-list-item'
})
export class ModalListItemComponent {

    listUuid: string;
    itemName: string;
    itemDescription: string;
    mode: string;
    itemToEdit : TodoItem;

    constructor(private todoServiceProvider: TodoServiceProvider,
        public modalController: ModalController,
        private navParams: NavParams) { }

    ionViewWillEnter() {
        this.listUuid = this.navParams.get('listUuid');
        this.itemName = this.navParams.get('itemName');
        this.itemDescription = this.navParams.get('itemDescription');
        this.mode = this.navParams.get('mode');
        this.itemToEdit = this.navParams.get('item');
    }

    add() {
        if(this.mode === 'add'){
            this.todoServiceProvider.addTodo(this.listUuid,this.itemName,this.itemDescription);
        } else {
            const newTodo: TodoItem = {name: this.itemName, desc: this.itemDescription, complete: false };
            this.todoServiceProvider.editTodo(this.listUuid,this.itemToEdit, newTodo);
        }
        this.modalController.dismiss();
    }

    async myDismiss() {
        await this.modalController.dismiss();
    }
}