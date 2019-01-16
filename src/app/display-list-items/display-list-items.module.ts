import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DisplayListItemsPage } from './display-list-items.page';

const routes: Routes = [
  {
    path: 'display-list-item/:id',
    component: DisplayListItemsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DisplayListItemsPage]
})
export class DisplayListItemsPageModule {}
