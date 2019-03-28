import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FriendFinderService } from '../service/friend-finder/friend-finder.service';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx'
import { ImageUploaderService } from '../service/image-uploader/image-uploader-service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
})
export class ConversationPage implements OnInit {
  private friend;
  private content = '';
  private messages;
  private mediaObject: MediaObject;
  private conversationID;
  private recording: boolean;
  @ViewChild('msgInput') msgInput;
  @ViewChild('contentIon') contentIon: IonContent;

  constructor(private route: ActivatedRoute,
    private friendFinder: FriendFinderService,
    private speechRecognition: SpeechRecognition,
    private media: Media,
    private file: File,
    private imageUploader: ImageUploaderService) {
    const friendID = this.route.snapshot.paramMap.get('id');
    this.recording = false;
    this.friendFinder.findOneFriend(friendID)
      .subscribe((res) => {
        this.friend = res;
      });
    this.friendFinder.retrieveConversation(friendID).subscribe((res) => {
      this.messages = res.reverse();
      let that = this;
      setTimeout(() => { that.contentIon.scrollToBottom(); }, 200);
    });
    this.conversationID = this.friendFinder.retrieveConversationID(friendID);
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

  startRecording(event) {
    const filePath = this.file.externalDataDirectory + 'record.aac';
    console.log(filePath);
    this.mediaObject = this.media.create(filePath);
    this.mediaObject.onSuccess.subscribe(async res => {
      this.mediaObject.release();
    });
    this.mediaObject.startRecord();
    this.recording = true;
  }

  async endRecording(event) {
    if (this.recording) {
      this.mediaObject.stopRecord();
      this.recording = false;
      this.imageUploader.uploadAudio((await this.file.readAsDataURL(this.file.externalDataDirectory, 'record.aac')), this.conversationID, Date.now().toString() + '.aac', this.friend.uid);
    }
  }

  isAudio(message: string): boolean {
    return message.indexOf('vocal-message-header//') != -1;
  }

  playAudio(message: string) {
    const obj = this.media.create(message.replace('vocal-message-header//', ''));
    obj.onSuccess.subscribe(res => {
      obj.release();
    });
    obj.play({ numberOfLoops: 1, playAudioWhenScreenIsLocked: false });
  }

}
