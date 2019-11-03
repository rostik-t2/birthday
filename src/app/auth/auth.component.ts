import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from "../auth.service";

@Component({
  selector: 'kpi-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  public authForm: FormGroup;
  public displayName: FormControl = new FormControl('');
  public errorMessage = '';
  constructor(private router: Router) {
    if (AuthService.getAuthInfo()) {
      this.router.navigate(['/gifts']);
    }

    this.authForm = new FormGroup({
      name: new FormControl(''),
      surname: new FormControl(''),
    });

  }
  login() {
    this.errorMessage = '';
    let name = this.authForm.get('name').value;
    let surname = this.authForm.get('surname').value;
    if (name && surname) {
      AuthService.setAuthInfo(name, surname);
      this.navigateToGiftsList();
    } else {
      this.errorMessage = 'Пожалуйста, введите имя и фамилию';
    }
  }

  navigateToGiftsList() {
    this.router.navigate(['/gifts']);
  }



}
