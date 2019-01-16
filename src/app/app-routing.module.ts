import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'list-display', loadChildren: './list-display/list-display.module#ListDisplayPageModule' },
  { path: 'display-list-items/:id', loadChildren: './display-list-items/display-list-items.module#DisplayListItemsPageModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
