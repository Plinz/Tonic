# Tonic
Application Ionic de Todo List

## Générer l'APK signé : 

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




