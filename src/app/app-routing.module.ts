import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './service/guard/auth.guard';

const routes: Routes = [
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule', canActivate: [AuthGuard] },
  { path: '', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule', canActivate: [AuthGuard] }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
