import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FcmService } from './service/fcm-service/fcm.service';
import { AdMobPro } from '@ionic-native/admob-pro/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private fcm: FcmService,
    private admob: AdMobPro
  ) {
    this.initializeApp();
  }

  initAd() {
    let adId;
    if (this.platform.is('cordova')) {
      //adId = 'ca-app-pub-4190464662297983/2949320520'; 
      adId = 'ca-app-pub-3940256099942544/6300978111';
    } else if (this.platform.is('ios')) {
      adId = 'YOUR_ADID_IOS';
    }
    this.admob.createBanner({ adId: adId, autoShow: true });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.fcm.showMessages();
      this.splashScreen.hide();
      this.initAd();

    });
  }
}
