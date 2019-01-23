import { Component, OnInit } from '@angular/core';
import { GoogleAuthService } from '../service/google-auth-service/google-auth-service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: User;
  constructor(private authService: GoogleAuthService, private router: NavController) { }

  ngOnInit() {
    this.authService.user.subscribe((user) => this.user = user);
  }

  logOut(){
    this.authService.signOut();
  }

}
