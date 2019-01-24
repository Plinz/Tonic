import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: '../tab1/tab1.module#Tab1PageModule'
          }
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: '../tab2/tab2.module#Tab2PageModule'
          }
        ]
      },
      {
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: '../tab3/tab3.module#Tab3PageModule'
          }
        ]
      },
      {
        path: 'list-display',
        children: [
          {
            path: '',
            loadChildren: '../list-display/list-display.module#ListDisplayPageModule'
          }
        ]
      },
      {
        path: 'display-list-items',
        children: [
          {
            path: ':id',
            loadChildren: '../display-list-items/display-list-items.module#DisplayListItemsPageModule'
          }
        ]
      },
      {
        path: 'display-shared-lists',
        children: [
          {
            path: '',
            loadChildren: '../shared-list-page/shared-list-page.module#SharedListPagePageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
