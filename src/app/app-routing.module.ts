import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TdipmAppHoqComponent} from './tdipm-apps/tdipm-app-hoq/tdipm-app-hoq.component'
import {TdipmAppTrizComponent} from './tdipm-apps/tdipm-app-triz/tdipm-app-triz.component'

const appRoutes: Routes = [
  { path: '', redirectTo: '/hoq', pathMatch: 'full' },
  { path: 'hoq', component: TdipmAppHoqComponent },
  { path: 'triz', component: TdipmAppTrizComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
