import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { AppComponent } from './app.component';
import {AngularFireModule} from "angularfire2";
import { environment } from '../environments/environment';
import {AngularFirestoreModule} from "angularfire2/firestore";
import {AngularFireAuthModule} from "angularfire2/auth";
import {AngularFireStorageModule} from "angularfire2/storage";
import {AuthComponent} from "./auth/auth.component";
import {RouterModule, Routes} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { GiftsComponent } from './gifts/gifts.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgbAlertModule} from '@ng-bootstrap/ng-bootstrap';

const appRoutes: Routes = [
  { path: 'gifts', component: GiftsComponent },
  {
    path: 'auth',
    component: AuthComponent,
  },
  // {
  //   path: 'admin',
  //   component: UploadGiftComponent,
  // },
  { path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  { path: '**', redirectTo: '/auth' }
];

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    GiftsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MDBBootstrapModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    RouterModule.forRoot(
      appRoutes
    ),
    NgbAlertModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class AppModule { }
