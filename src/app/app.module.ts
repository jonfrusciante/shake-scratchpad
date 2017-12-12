import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularFireModule} from 'angularfire2';
import {environment} from '../environments/environment';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AppComponent} from './app.component';
import {CoreModule} from './core/core.module';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {OrganizationModule} from './views/organization/organization.module';
import {NotFoundComponent} from './shared/not-found/not-found.component';


import { ToastrModule } from 'ngx-toastr';

import {TranslateModule} from '@ngx-translate/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader} from '@ngx-translate/core';
import {MyMaterialModule} from './material-module/my--material.module';
import {QuillModule} from 'ngx-quill';
import {SpinnerComponent} from './shared/spinner/spinner.component';
import {LoginComponent} from './shared/login/login.component';
import { SignupComponent } from './shared/signup/signup.component';
import {HomeModule} from './views/home/home.module';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    SpinnerComponent,
    LoginComponent,
    SignupComponent
  ],
  imports: [
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    BrowserModule,
    RouterModule,
    HttpClientModule,
    QuillModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MyMaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    CoreModule,
    HomeModule,
    OrganizationModule,
    AppRoutingModule    // <==== allways last !
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
