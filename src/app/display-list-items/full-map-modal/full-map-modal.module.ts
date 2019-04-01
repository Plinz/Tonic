import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

// The modal's component of the previous chapter
import { FullMapModalComponent} from './full-map-modal.page';

@NgModule({
     declarations: [
       FullMapModalComponent
     ],
     imports: [
       IonicModule,
       CommonModule,
       FormsModule
     ],
     entryComponents: [
       FullMapModalComponent
     ]
})
export class FullMapModalModule {}