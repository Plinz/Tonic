import { Component } from '@angular/core';
import { TodoServiceProvider } from 'src/app/service/todo-service/todo-service.service';
import { ModalController, NavParams } from '@ionic/angular';
import { TodoItem } from 'src/app/domain/todo';
import * as leaflet from 'leaflet';

@Component({
  templateUrl: './full-map-modal.html',
  styleUrls: [],
  selector: 'full-map-modal'
})
export class FullMapModalComponent {

  items: TodoItem[];
  map;
  dicoMarker = {};

  firefoxIcon = leaflet.icon({
    iconUrl: '../../assets/location-marker-svgrepo-com.svg',
    iconSize: [38, 95], // size of the icon
  });

  constructor(private todoServiceProvider: TodoServiceProvider,
    public modalController: ModalController,
    private navParams: NavParams,
  ) { }

  ionViewWillEnter() {
    const id = this.navParams.get('id');
    this.loadmap();
    this.todoServiceProvider.getTodos(id).subscribe((val) => {
      this.items = val;
      this.loadMarkers();
    });
  }

  loadMarkers() {
    if (this.map) {
      const initialKeys = Object.keys(this.dicoMarker);
      const markerFounds = [];
      for (const item of this.items) {
        if (item.geoloc) {
          markerFounds.push(item.uuid);
          if (this.dicoMarker[item.uuid]) {
            this.dicoMarker[item.uuid].setLatLng(new leaflet.LatLng(item.geoloc[0], item.geoloc[1]));
          } else {
            this.dicoMarker[item.uuid] = leaflet.marker([item.geoloc[0], item.geoloc[1]], { icon: this.firefoxIcon });;
            this.dicoMarker[item.uuid].addTo(this.map);
          }
        }
      }
      for (const itemNotFound of (initialKeys.filter(item => markerFounds.indexOf(item) < 0))) {
        this.map.removeLayer(this.dicoMarker[itemNotFound]);
        delete this.dicoMarker[itemNotFound];
      }
    }
  }

  async myDismiss() {
    await this.modalController.dismiss();
  }

  loadmap() {
    setTimeout(() => {
      this.map = leaflet.map('map').fitWorld();
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // tslint:disable-next-line
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 20
      }).addTo(this.map);
      this.loadMarkers();
    }, 50);
  }
}
