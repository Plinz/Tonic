import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DisplayListItemsPage } from './display-list-items.page';
import { ModalListItemModule } from './modal/modal-list-page.module';

const routes: Routes = [
  {
    path: '',
    component: DisplayListItemsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ModalListItemModule
  ],
  declarations: [DisplayListItemsPage]
})
export class DisplayListItemsPageModule {}
