import { Component, OnInit } from '@angular/core';
import { FriendFinderService } from '../service/friend-finder/friend-finder.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {

  user;
  friends = [];
  friendsToSearch = [];
  query = '';
  sub: Subscription;

  constructor(private friendFinder: FriendFinderService) { }

  ngOnInit() {
    this.friendFinder.retrieveFollowers().subscribe(res => this.friends = res);
    this.user = this.friendFinder.user;
  }

  callback = (obs) => {
    if(this.sub){
      this.sub.unsubscribe();
    }
    this.sub = obs.subscribe((res) => this.friendsToSearch = [].concat(...res));
  }

  queryByName() {
    if(this.query !== ''){
      this.friendFinder.algolia_search_users(this.query, this.callback);
    } else{
      this.friendsToSearch = [];
    }
  }

  follow(id: string) {
    this.friendFinder.follow(id);
  }

  unfollow(id: string) {
    this.friendFinder.unfollow(id);
  }

}
