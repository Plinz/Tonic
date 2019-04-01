# Tonic
Application Ionic de Todo List

## La liste exhaustive des fonctionnalitées implémentées
* SSO Google
* Stockage Firebase
* Liste :
  * Créer un QRCode permettant de copier une liste d'un utilisateur à un autre
  * Créer une nouvelle liste
    * Depuis un QRCode
  * Supprimer une liste (Uniquement si on est proriétaire de la liste)
  * Editer une liste (Changer le nom, uniquement si on est proriétaire de la liste)
  * Ajout d'items (Uniquement si on est proriétaire de la liste)
  
  * Suppression d'item (Uniquement si on est proriétaire de la liste)
  * Edition d'item
      * Changer le nom de l'item (Uniquement si on est proriétaire de la liste)
      * Changer l'état de l'item (Si la liste est public tout le monde peut changer l'état, sinon uniquement le propriétaire)
  * Ajout/Modification d'une photo (Uniquement si on est proriétaire de la liste)
    * Depuis la gallerie
    * Depuis l'appareil photo
  * Rendre la liste publique (Uniquement si on est proriétaire de la liste)
  * Rendre la liste privé (Uniquement si on est proriétaire de la liste)
  * S'abonner/desabonner à une liste publique
 * Utilisateur :
  * Suivre un utilisateur
  * Ne plus suivre un utilisateur
  * Envoyer un message privé à un utilisateur :
    * Reconnaissance vocale du message
 * Recherche (Algolia):
  * Recherche de liste par nom 
  * Recherche d'utilisateur par nom et email
* Publicité
* Notification :
  * A la reception d'un nouveau message privé
  * Au changement de nom d'une liste sur laquelle on est abonné
  * Au changement d'état d'un item d'une liste sur laquelle on est abonné
  * Au changement de nom d'un item d'une liste sur laquelle on est abonné
  * A la suppression d'un item d'une liste sur laquelle on est abonné
  * Au partage en public d'une liste d'un utilisateur que l'on suit
## La liste des fonctionnalitées dont l’implémentation a échoué et la cause
Partage de listes privée
Cause : 
## Le mode opératoire pour la compilation du projet et son déploiement sur mobile

### Compiler et déployer sur mobile

* Cloner le projet
 ```sh
git clone https://github.com/Plinz/Tonic.git
```

* Dans le projet installer les dépendances
 ```sh
cd Tonic
npm install
```

* Ajouter la plateforme
 ```sh
ionic cordova platform add android
```

* Modification des versions
Changez ces lignes du fichier platforms/android/project.properties 
 ```sh
cordova.system.library.2=com.google.android.gms:play-services-auth:+
cordova.system.library.3=com.google.android.gms:play-services-identity:+
[...]
cordova.system.library.10=com.android.support:appcompat-v7:26.+
[...]
cordova.system.library.11=com.android.support:support-v13:26.+
```

Et supprimer tout les autre lignes avec com.android.support:support-v[...]


* Compilation et déploiement sur mobile
 ```sh
ionic cordova run android --device
```

### Problèmes rencontrés

#### No installed build tools found

 ```sh
FAILURE: Build failed with an exception.
[...]
* What went wrong:
A problem occurred evaluating project ':CordovaLib'.
> No installed build tools found. Install the Android build tools version 19.1.0 or higher.
[...]
BUILD FAILED in 17s
[ERROR] An error occurred while running subprocess cordova.
```

Cette erreur est dû au sdk d'android, vérifiez votre variable d'environnement ANDROID_HOME, le dossier pointé doit contenir un dossier 'tools' avec des binaires à l'intérieur.
Pour moi j'ai du changer ANDROID_HOME de /usr/lib/android_sdk/ à ~/Android/Sdk.

#### Login impossible (le bouton ne fait rien)

Vous n'avez pas changé le fichier de configuration project.properties comme indiqué plus haut.

#### java.lang.IllegalStateException: Dex archives: setting .DEX extension only for .CLASS files

Relancer la commande :
 ```sh
cordova clean
ionic cordova run android --device
```

#### Failed to deploy to device, no devices found.

Le l'appareil mobile n'a pas été détecté. Vérifier que vous avez bien branché l'appareil avec un cable USB permettant le transfert de données. Vérifier que vous avez choisi le mode de conneion USB : MTP sur l'appareil mobile et non Charger uniquement. Vérifiez que vous avez activer l'option Débogage USB. Vérifier que vous avez bien accepter l'empreinte numérique de n'ordinateur.

#### adb: Command failed with exit code 1 Error output:

 ```sh
adb: Command failed with exit code 1 Error output:
error: protocol fault (couldn't read status): Connection reset by peer
```

Vérifier que vous avez choisi le mode de conneion USB : MTP sur l'appareil mobile et non Charger uniquement. Vérifiez que vous avez activer l'option Débogage USB.

#### Crash de l'appli si on choisit d'ajouter une photo de la gallery dans une liste

Modifiez ces lignes du fichier de configuration platforms/android/project.properties 

 ```sh
cordova.system.library.10=com.android.support:appcompat-v7:26.+
cordova.system.library.11=com.android.support:support-v13:26.+
```

Et supprimer tout les autre lignes avec com.android.support:support-v[...]

### Générer l'APK signé : 

-Générer l'APK non signé

ionic cordova build --release android

-Aller dans le répoire où a été généré le JAR

cd .\platforms\android\app\build\outputs\apk\release

-Générer la clé RSA pour le déploiement (le keystore doit être crée au préalable/alias_name est le nom de la clé)

keytool -list -v -keystore .\my-release-key.keystore  -alias alias_name 

--Ajouter la clé sur cette page (Ajouter une empreinte)

https://console.firebase.google.com/project/tonic0/settings/general/android:com.tonicteam.tonic

-Signer l'apk

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore .\app-release-unsigned.apk alias_name

-Optimiser l'APK (zipalign se trouve dans le dossier Android/sdk/build-tools/...)

zipalign -v 4 .\app-release-unsigned.apk Tonic.apk
## L’export des règles sécurité de Firebase
