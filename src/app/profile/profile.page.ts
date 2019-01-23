import { Component, OnInit} from '@angular/core';
import { GoogleAuthService } from '../service/google-auth-service/google-auth-service';
import { User } from '../domain/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: firebase.User;
  constructor(private gAuth: GoogleAuthService) {
  }

  ngOnInit() {
     this.gAuth.user.subscribe(res => { this.user = res;});
  }

  logOut() {
    this.gAuth.signOut();
  }
}
