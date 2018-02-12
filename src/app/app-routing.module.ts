import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NotFoundComponent} from './shared/not-found/not-found.component';
import {NotAuthenticatedComponent} from "./shared/not-authenticated/not-authenticated.component";


const routes: Routes = [


  {path: 'notAuthenticated', component: NotAuthenticatedComponent},
  {path: '**', component: NotFoundComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
