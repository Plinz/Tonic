import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// The modal's component of the previous chapter
import { PopoverComponent } from './popover.component';
import { FullMapModalModule } from '../full-map-modal/full-map-modal.module';

@NgModule({
    declarations: [
        PopoverComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        FullMapModalModule
    ],
    entryComponents: [
        PopoverComponent
    ]
})
export class PopoverItemModule { }