import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FriendFinderService } from '../service/friend-finder/friend-finder.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
})
export class ConversationPage implements OnInit {
  private friend;
  private content = '';
  private messages;

  constructor(private route: ActivatedRoute,
    private friendFinder: FriendFinderService) {
    const friendID = this.route.snapshot.paramMap.get('id');
    this.friendFinder.findOneFriend(friendID)
      .subscribe((res) => {
        this.friend = res;
      });
    this.friendFinder.retrieveConversation(friendID).subscribe((res) => {
      this.messages = res.reverse();
    });
  }

  ngOnInit() {
  }

  sendMessage() {
    this.friendFinder.sendMessage(this.friend.uid, this.content);
  }

}
