import { Component, OnInit } from '@angular/core';
import { GoogleAuthService } from '../service/google-auth-service/google-auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private img = '../../assets/drop-2023258_1280.png';

  constructor(private googleAuth: GoogleAuthService) { }

  ngOnInit() {
  }

  googleLogin() {
    this.googleAuth.googleLogin();
  }

}
