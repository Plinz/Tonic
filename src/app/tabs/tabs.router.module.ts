import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'friends',
        children: [
          {
            path: '',
            loadChildren: '../friends/friends.module#FriendsPageModule'
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
        redirectTo: '/tabs/friends',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/friends',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
