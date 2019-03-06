import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FriendFinderService } from '../service/friend-finder/friend-finder.service';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
})
export class ConversationPage implements OnInit {
  private friend;
  private content = '';
  private messages;
  @ViewChild('msgInput') msgInput;
  @ViewChild('contentIon') contentIon: IonContent;

  constructor(private route: ActivatedRoute,
    private friendFinder: FriendFinderService,
    private speechRecognition: SpeechRecognition) {
    const friendID = this.route.snapshot.paramMap.get('id');
    this.friendFinder.findOneFriend(friendID)
      .subscribe((res) => {
        this.friend = res;
      });
    this.friendFinder.retrieveConversation(friendID).subscribe((res) => {
      this.messages = res.reverse();
      let that = this;
      setTimeout(() => { that.contentIon.scrollToBottom(); }, 200);
    });
  }

  ngOnInit() {
    this.contentIon.scrollToBottom();
  }

  recognition() {
    var options = {
      lang: "fr-FR",
      showPopup: true
    };
    // Start the recognition process
    this.speechRecognition.startListening(options)
      .subscribe(
        (matches: string[]) => {
          this.content = matches[0]
          this.msgInput.setFocus()
        },
        (onerror) => console.log('error:', onerror)
      )
  }

  startMic() {
    // Check feature available
    this.speechRecognition.isRecognitionAvailable()
      .then((available: boolean) => {
        if (available) {
          // Check permission
          this.speechRecognition.hasPermission()
            .then((hasPermission: boolean) => {
              if (hasPermission) {
                this.recognition();
              } else {
                // Request permissions
                this.speechRecognition.requestPermission().then(
                  () => this.recognition(),
                  () => console.log('Access Denied')
                )
              }
            })
        } else {
          console.log('Feature non available')
        }
      })
  }

  sendMessage() {
    if (this.content !== '') {
      this.friendFinder.sendMessage(this.friend.uid, this.content);
      this.content = '';
    }
  }

}
