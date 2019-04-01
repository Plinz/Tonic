import { Component } from '@angular/core';
import { TodoServiceProvider } from 'src/app/service/todo-service/todo-service.service';
import { ModalController, NavParams } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { TodoList, TodoItem } from 'src/app/domain/todo';
import { FullMapModalComponent } from '../full-map-modal/full-map-modal.page';

@Component({
    templateUrl: './popover.html',
    styleUrls: [],
    selector: 'popover'
})
export class PopoverComponent {
    private list: TodoList;
    private todos: TodoItem[];

    constructor(private todoServiceProvider: TodoServiceProvider,
        public modalController: ModalController,
        private navParams: NavParams,
        private barcodeScanner: BarcodeScanner
    ) { }

    ionViewWillEnter() {
        this.list = this.navParams.get('list');
        this.todos = this.navParams.get('todos');
    }

    encodedText() {
        this.list.items = this.todos;
        this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE, this.list.uuid).then((encodedData) => {
        }, (err) => {
        });
    }

    copyList() {
        this.todoServiceProvider.copyListByID(this.list.uuid);
    }

    async seeMap() {
        const modal: HTMLIonModalElement =
            await this.modalController.create({
                component: FullMapModalComponent,
                componentProps: {
                    id: this.list.uuid
                }
            });
        await modal.present();

    }

}