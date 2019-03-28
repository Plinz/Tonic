import { Injectable } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage'
import { TodoServiceProvider } from '../todo-service/todo-service.service';
import { FriendFinderService } from '../friend-finder/friend-finder.service';

@Injectable({
    providedIn: 'root',
})
export class ImageUploaderService {

    constructor(private imagePicker: ImagePicker,
        private camera: Camera,
        private afs: AngularFireStorage,
        private todoService: TodoServiceProvider,
        private friendFinder: FriendFinderService
    ) {
    }

    findPic(listID) {
        this.imagePicker.getPictures({ maximumImagesCount: 1, outputType: 1, quality: 50 }).then((res) => {
            if (res && res[0]) {
                this.uploadImage(res[0].replace("data:image/jpeg;base64,", ""), listID);
            }
        });
    }

    useCam(listID) {
        const options: CameraOptions = {
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            cameraDirection: this.camera.Direction.FRONT
        }
        this.camera.getPicture(options).then((imageData) => {
            let base64Image = imageData;
            this.uploadImage(base64Image, listID);
        }, (err) => {
        });
    }

    async uploadImage(image: string, listID) {
        const storageRef = this.afs.storage.ref();
        const imageRef = storageRef.child('image').child(listID).child('mainImage.jpeg');
        const metadata = {
            contentType: 'image/jpeg',
        };
        imageRef.putString(image, 'base64', metadata).then(async (res) => {
            this.todoService.editDownloadURL(listID, await imageRef.getDownloadURL());
        });
    }

    async uploadAudio(audioFile: string, conversationID, fileName, friendID){
        const storageRef = this.afs.storage.ref();
        const audioRef = storageRef.child('audio').child(conversationID).child(fileName);
        const metadata = {
            contentType: 'audio/aac',
        };
        audioRef.putString(audioFile,'data_url').then(async (res) => {
            this.friendFinder.sendMessage(friendID,'vocal-message-header//'+ (await audioRef.getDownloadURL()));
        });

    }

    getImage(listID): any {
        let storageRef = this.afs.storage.ref();
        let imageRef = storageRef.child('image').child(listID).child('mainImage.jpeg');
        return imageRef.getDownloadURL();
    }

}