import { Component } from '@angular/core';
import { TodoServiceProvider } from 'src/app/service/todo-service/todo-service.service';
import { ModalController, NavParams } from '@ionic/angular';
import { TodoItem, TodoList } from 'src/app/domain/todo';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as leaflet from 'leaflet';

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
    itemToEdit: TodoItem;
    geoloc: number[];
    map: any;

    constructor(private todoServiceProvider: TodoServiceProvider,
        public modalController: ModalController,
        private navParams: NavParams,
        private geolocation: Geolocation
    ) { }

    ionViewWillEnter() {
        this.list = this.navParams.get('list');
        this.itemName = this.navParams.get('itemName');
        this.itemDescription = this.navParams.get('itemDescription');
        this.mode = this.navParams.get('mode');
        this.itemToEdit = this.navParams.get('item');
        this.geoloc = this.navParams.get('geoloc');
        if (this.geoloc)
          this.loadmap(this.geoloc[0], this.geoloc[1]);
    }

    add() {
        if (this.mode === 'add') {
            this.todoServiceProvider.addTodo(this.list, this.itemName, this.itemDescription, this.geoloc);
        } else {
            this.itemToEdit.name = this.itemName;
            this.itemToEdit.desc = this.itemDescription;
            if (this.geoloc) {
                this.itemToEdit.geoloc = this.geoloc;
            }
            this.todoServiceProvider.editTodo(this.list.uuid, this.itemToEdit);
        }
        this.modalController.dismiss();
    }

    async myDismiss() {
        await this.modalController.dismiss();
    }

    getGeoloc() {
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          };
        this.geolocation.getCurrentPosition(options).then((resp) => {
            this.geoloc = [resp.coords.latitude, resp.coords.longitude];
            this.loadmap(this.geoloc[0], this.geoloc[1]);
        }).catch((error) => {
            alert('Error getting location');
        });
    }

    loadmap(lat, lng) {
      setTimeout(() => {
        this.map = leaflet.map('map').fitWorld();
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          // tslint:disable-next-line
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 20
        }).addTo(this.map);
        var m = leaflet.marker([lat, lng]);
        m.addTo(this.map);
        this.map.flyTo([lat, lng], 16);
  }, 50);
}

}
