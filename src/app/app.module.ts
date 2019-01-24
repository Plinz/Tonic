import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AuthGuard } from './service/guard/auth.guard';
import { Firebase } from '@ionic-native/firebase/ngx';
import { FcmService } from './service/fcm-service/fcm.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { GoogleAuthService } from './service/google-auth-service/google-auth-service';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

const firebase = {
  apiKey: "AIzaSyChQEXVRCoovLUSEJWSVdugP6N_Soq74ps",
  authDomain: "tonic0.firebaseapp.com",
  databaseURL: "https://tonic0.firebaseio.com",
  projectId: "tonic0",
  storageBucket: "tonic0.appspot.com",
  messagingSenderId: "1036845890573"
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    AngularFireModule.initializeApp(firebase), // <-- firebase here
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireMessagingModule,
    AngularFireFunctionsModule
    ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthGuard,
    Firebase,
    FcmService,
    GooglePlus,
    GoogleAuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}