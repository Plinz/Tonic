import { Injectable } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage'




@Injectable({
    providedIn: 'root',
})
export class ImageUploaderService {

    constructor(private imagePicker: ImagePicker,
        private camera: Camera,
        private afs: AngularFireStorage
    ) {
    }

    findPic() {
        return this.imagePicker.getPictures({ maximumImagesCount: 1 });
    }

    useCam() {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            cameraDirection: this.camera.Direction.FRONT
        }
        return this.camera.getPicture(options);
    }

    encodeImageUri(imageUri, callback) {
        var c = document.createElement('canvas');
        var ctx = c.getContext("2d");
        var img = new Image();
        img.onload = function () {
            var aux: any = this;
            c.width = aux.width;
            c.height = aux.height;
            ctx.drawImage(img, 0, 0);
            var dataURL = c.toDataURL("image/jpeg");
            callback(dataURL);
        };
        img.src = imageUri;
    };

    uploadImage(imageURI, listID) {
        return new Promise<any>((resolve, reject) => {
            let storageRef = this.afs.storage.ref();
            let imageRef = storageRef.child('image').child(listID).child('mainImage');
            this.encodeImageUri(imageURI, function (image64) {
                let messageSplit = this.imgUri.split('data:image/*;charset=utf-8;base64,')[1];
                let message64 = 'data:image/jpg;base64,' + messageSplit;
                imageRef.putString(message64, 'data_url')
                    .then(snapshot => {
                        resolve(snapshot.downloadURL);
                    }, err => {
                        reject(err);
                    })
            })
        })
    }
}