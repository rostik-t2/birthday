import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'kpi-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  public errorMessage: string = '';
  public authForm: FormGroup;
  public displayName: FormControl = new FormControl('');
  constructor(public angularFireAuth: AngularFireAuth, private router: Router) {
    this.angularFireAuth.auth.useDeviceLanguage();
    this.angularFireAuth.user.subscribe((user: User) => {
      if (user && user.displayName) {
        this.navigateToGiftsList();
      }
    });

    this.authForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });

  }
  login() {
    this.errorMessage = '';
    let email = this.authForm.get('email').value;
    let password = this.authForm.get('password').value;
    this.angularFireAuth.auth.signInWithEmailAndPassword(email, password)
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        if (errorCode == 'auth/wrong-password') {
          this.errorMessage = 'Введен неверный пароль. Повторите попытку.';
        } else if (errorCode == 'auth/user-not-found') {
          this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password)
            .catch((error) => {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              if (errorCode == 'auth/weak-password') {
                this.errorMessage = 'Придумайте более надежный пароль';
              } else {
                this.errorMessage = 'Упсс.. Что-то пошло не так. Повторите попытку, пожалуйста';
              }
              console.log(error);
            });
        } else if (errorCode == 'auth/invalid-email') {
          this.errorMessage = 'Неправильный email. Исправьте ошибку и повторите';
        } else {
          this.errorMessage = 'Упсс.. Что-то пошло не так. Повторите попытку, пожалуйста';
        }
        console.log(error);
      });
  }

  setDisplayName(user, displayName) {
    // Updates the user attributes:
    user.updateProfile({
      displayName: displayName
    }).then(() => {
      this.navigateToGiftsList();
    }, function(error) {
      // An error happened.
    });
  }

  navigateToGiftsList() {
    this.router.navigate(['/gifts']);
  }

}
