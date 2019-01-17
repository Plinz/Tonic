import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

// The modal's component of the previous chapter
import {ModalListItemComponent} from './modal-list-item.page';

@NgModule({
     declarations: [
       ModalListItemComponent
     ],
     imports: [
       IonicModule,
       CommonModule,
       FormsModule
     ],
     entryComponents: [
       ModalListItemComponent
     ]
})
export class ModalListItemModule {}