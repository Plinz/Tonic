import { Component } from '@angular/core';
import { TodoServiceProvider } from 'src/app/service/todo-service/todo-service.service';
import { ModalController, NavParams } from '@ionic/angular';
import { TodoItem, TodoList } from 'src/app/domain/todo';

@Component({
    templateUrl: './modal-list-item.html',
    styleUrls: [],
    selector: 'modal-list-item'
})
export class ModalListItemComponent {

    list: TodoList;
    itemName: string;
    itemDescription: string;
    mode: string;
    itemToEdit : TodoItem;

    constructor(private todoServiceProvider: TodoServiceProvider,
        public modalController: ModalController,
        private navParams: NavParams) { }

    ionViewWillEnter() {
        this.list = this.navParams.get('list');
        this.itemName = this.navParams.get('itemName');
        this.itemDescription = this.navParams.get('itemDescription');
        this.mode = this.navParams.get('mode');
        this.itemToEdit = this.navParams.get('item');
    }

    add() {
        if(this.mode === 'add'){
            this.todoServiceProvider.addTodo(this.list,this.itemName,this.itemDescription);
        } else {
            this.itemToEdit.name = this.itemName;
            this.itemToEdit.desc = this.itemDescription;
            this.todoServiceProvider.editTodo(this.list.uuid,this.itemToEdit);
        }
        this.modalController.dismiss();
    }

    async myDismiss() {
        await this.modalController.dismiss();
    }
}