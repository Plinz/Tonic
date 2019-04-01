import { Component } from '@angular/core';
import { TodoServiceProvider } from 'src/app/service/todo-service/todo-service.service';
import { ModalController, NavParams, LoadingController } from '@ionic/angular';
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
  marker: any;

  constructor(private todoServiceProvider: TodoServiceProvider,
    public modalController: ModalController,
    private navParams: NavParams,
    private geolocation: Geolocation,
    private loading: LoadingController
  ) { }

  ionViewWillEnter() {
    this.list = this.navParams.get('list');
    this.itemName = this.navParams.get('itemName');
    this.itemDescription = this.navParams.get('itemDescription');
    this.mode = this.navParams.get('mode');
    this.itemToEdit = this.navParams.get('item');
    this.geoloc = this.navParams.get('geoloc');
    this.loadmap();
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

  async getGeoloc() {
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    const loader = await this.loading.create({message: 'Retrieving your location !'});
    await loader.present();
    this.geolocation.getCurrentPosition(options).then(async (resp) => {
      this.geoloc = [resp.coords.latitude, resp.coords.longitude];
      if (this.marker)
        this.marker.setLatLng(new leaflet.LatLng(this.geoloc[0], this.geoloc[1]));
      else {
        this.marker = leaflet.marker([this.geoloc[0], this.geoloc[1]]);
        this.marker.addTo(this.map).addTo(this.map);
      }
      await loader.dismiss();
      this.map.flyTo([this.geoloc[0], this.geoloc[1]], 16);

    }).catch(async (error) => {
      await loader.dismiss();
      alert('Error getting location');
    });
  }

  onMapClick = (e) => {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    this.geoloc = [lat, lng];
    if (this.marker)
      this.marker.setLatLng(new leaflet.LatLng(lat, lng));
    else {
      const firefoxIcon = leaflet.icon({
        iconUrl: '../../assets/location-marker-svgrepo-com.svg',
        iconSize: [38, 95], // size of the icon
      });
      this.marker = leaflet.marker([lat, lng], { icon: firefoxIcon });
      this.marker.addTo(this.map);
    }
    this.marker.setLatLng(new leaflet.LatLng(lat, lng));
  }

  loadmap() {
    setTimeout(() => {
      this.map = leaflet.map('map').fitWorld();
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // tslint:disable-next-line
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 20
      }).addTo(this.map);
      if (this.geoloc) {
        const firefoxIcon = leaflet.icon({
          iconUrl: '../../assets/location-marker-svgrepo-com.svg',
          iconSize: [38, 95], // size of the icon
        });
        this.marker = leaflet.marker([this.geoloc[0], this.geoloc[1]], { icon: firefoxIcon });
        this.marker.addTo(this.map);
        this.map.flyTo([this.geoloc[0], this.geoloc[1]], 16);
      }
      this.map.on('click', this.onMapClick);
    }, 50);
  }



}
