# Tonic
Application Ionic de Todo List

## Fonctionnalités supplémentaires en bref (en plus de celles imposées):
 * Géolocalisation
 * Copie de listes
 * Notifications
 * Tchat
 * Reconnaissance vocale
 * Utilisation du micro du portable pour envoyer des messages vocaux
 * Utilisation des QRCodes (encodage/décodage)
 * Recherche en utilisant un back-end "Software As A Service" (Algolia)
 * Listes partagées
 * Publicité
 
10 fonctionnalités


## La liste exhaustive des fonctionnalitées implémentées
* SSO Google
* Stockage Firebase
* Liste :
  * Création de listes
  * Créer un QRCode permettant de copier une liste d'un utilisateur à un autre
  * Copier une liste
    * Depuis un QRCode
    * En appuyant sur un bouton dans la liste correspondante
  * Supprimer une liste (Uniquement si on est proriétaire de la liste)
  * Editer une liste (Changer le nom, uniquement si on est proriétaire de la liste)
  * Ajout d'items 
  * Suppression d'item 
  * Edition d'item
      * Changer le nom de l'item 
      * Changer l'état de l'item (Si la liste est publique tout le monde peut changer l'état, sinon uniquement le propriétaire)
  * Ajout/Modification d'une photo (Uniquement si on est proriétaire de la liste)
    * Depuis la gallerie
    * Depuis l'appareil photo
  * Rendre la liste publique (Uniquement si on est proriétaire de la liste)
  * Rendre la liste privée (Uniquement si on est proriétaire de la liste)
  * S'abonner/desabonner à une liste publique
* Utilisateur :
  * Suivre un utilisateur
  * Ne plus suivre un utilisateur
  * Envoyer un message privé à un utilisateur (Tchat) :
    * Reconnaissance vocale du message
    * Message vocal
* Recherche (Algolia) :
  * Recherche de liste par nom 
  * Recherche d'utilisateur par nom et email
* Publicité
* Notification :
  * A la reception d'un nouveau message privé
  * Au changement de nom d'une liste sur laquelle on est abonné
  * Au changement d'état d'un item d'une liste sur laquelle on est abonné
  * Au changement de nom d'un item d'une liste sur laquelle on est abonné
  * Au partage en public d'une liste d'un utilisateur que l'on suit
* Geolocalisation (Leaflet) :
  * Possibilité de géolocaliser un item en utilisant le service de géolocalisation du téléphone
  * Possibilité de mettre une géolocalisation personnalisée sur un item en cliquant sur une carte
  * Affichage sur une carte de la position des items géolocalisés d'une liste
  
  
## Recherche de listes/d'utilisateurs et Algolia

https://www.algolia.com/

Pour effectuer la recherche sur une liste ou des utilisateurs, nous utilisons le service Algolia qui est un "Search As A Service". Nous avons crée des indexs sur Algolia nous permettant d'effectuer une recherche d'utilisateurs en fonction de leur nom ou de leur adresse e-mail (du nom pour les listes), à la manière d'un LIKE avec SQL. Lorsque nous créons une liste ou un utilisateur (suppression / modification aussi), nous créons une nouvelle entrée sur Algolia aussi. Nous aurions pu effectuer une recherche en full front-end (en filtrant les résultats), cependant nous avons trouvé intéressant de nous exercer avec un service tiers (français qui plus est).

## La liste des fonctionnalitées dont l’implémentation a échoué et la cause

Nous avons rencontré un problème au niveau des autorisations, notamment pour la reconnaissance vocale. En effet, nous rencontrons un bug lorsqu'on souhaite envoyer un message vocal : si l'utilisateur n'a pas l'autorisation d'accéder aux fichiers et au microphone, le message enregistré sera invalide. Ainsi, pour pouvoir envoyer un message vocal, l'utilisateur doit impérativement avoir accès à ces deux ressources. Dans le cas où il n'avait pas l'un des deux accès et a quand même essayé d'envoyer un message vocal (et accepté les autorisations), il doit quitter la fenêtre de conversation pour pouvoir finalement envoyer un message vocal. Une fois que ces deux autorisations ont étés acceptées (via la reconnaissance vocale pour le micro, la photo ou l'image picker), plus de problèmes. En général, après avoir redémarré l'application, tout marche. 

Choix du mode de stockage des items dans les listes sur Firestore :

Plusieurs choix se sont proposés à nous : stocker les items dans une collection imbriquée, ou les stocker dans un array dans le document de la liste. Le premier choix a finalement été retenu. La première méthode permet d'avoir une meilleur scalabilité : en effet, la taille des documents étant limitée, la seconde méthode serait inadaptée dans le cas où une liste aurait énormément d'items. Cependant, il a été complexe de récupérer les items stockés sous forme de collection imbriquée dans les listes sans que l'IHM n'en soit impactée. Ce problème a été répété dans plusieurs cas différents : pour gérer les personnes abonnées à une liste ainsi que les followers d'une personne. Par facilité, les followers ainsi que les subscribers d'une liste sont stockés sous forme d'array dans leurs documents (respectivement user/{id} et todolists/{listid}).

Partage de listes privées :

N'a pas été implémenté pour les mêmes raisons qu'au dessus : comment stocker les personnes autorisées à accéder à la liste.

## Le mode opératoire pour la compilation du projet et son déploiement sur mobile

### Compiler et déployer sur mobile

* Cloner le projet
 ```sh
git clone https://github.com/Plinz/Tonic.git
```

* Dans le projet installer les dépendences
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

Cette erreur est dûe au sdk d'android, vérifiez votre variable d'environnement ANDROID_HOME, le dossier pointé doit contenir un dossier 'tools' avec des binaires à l'intérieur.
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

L'appareil mobile n'a pas été détecté. Vérifiez que vous avez bien branché l'appareil avec un cable USB permettant le transfert de données. Vérifiez que vous avez choisi le mode de connexion USB : MTP sur l'appareil mobile et non Charger uniquement. Vérifiez que vous avez activé l'option Débogage USB. Vérifiez que vous avez bien accepté l'empreinte numérique de l'ordinateur.

#### adb: Command failed with exit code 1 Error output:

 ```sh
adb: Command failed with exit code 1 Error output:
error: protocol fault (couldn't read status): Connection reset by peer
```

Vérifiez que vous avez choisi le mode de connedion USB : MTP sur l'appareil mobile et non Charger uniquement. Vérifiez que vous avez activé l'option Débogage USB.

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
