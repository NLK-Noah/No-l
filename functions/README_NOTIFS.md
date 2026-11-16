# Notifications FCM avec Cloud Functions

## Plan Firebase

Le code ci-dessous peut être testé localement sur le plan Spark avec les émulateurs. **Le déploiement Cloud Functions n'est pas disponible sur Spark** : Firebase exige le plan Blaze et un compte de facturation associé. Les quotas gratuits des fonctions sont inclus sur Blaze, mais cela ne supprime pas l'obligation de facturation. FCM reste sans frais.

## Structure utilisée

```text
firebase.json
.firebaserc
functions/
  index.js
  package.json
  package-lock.json
```

Le projet configure le dossier `functions/` comme codebase `default`. Aucun `serviceAccountKey.json` n'est nécessaire dans une fonction déployée : l'Admin SDK utilise son compte de service d'exécution.

## Test local

1. Installer la CLI Firebase si besoin : `npm install -g firebase-tools`.
2. À la racine du dépôt, installer les dépendances : `npm --prefix functions ci`.
3. Démarrer Firestore et les Functions Emulator avec `FCM_DRY_RUN=1 firebase emulators:start --only firestore,functions`.
4. Créer un document de test dans la collection `messages` via l'interface Firestore Emulator (`http://127.0.0.1:4000`) et vérifier les logs `FCM dry-run`. Le mode dry-run empêche tout envoi réel à FCM.

## Déploiement

Après avoir associé le projet à un compte de facturation dans Firebase Console, s'authentifier avec `firebase login`, puis déployer le codebase concerné depuis la racine :

```sh
firebase deploy --only functions:default
```

`firebase deploy --only functions` déploie toutes les codebases déclarées dans `firebase.json`. Le filtre `functions:default` limite le déploiement à `functions/`.

Les déclencheurs écoutent la création de documents sous `messages/{messageId}` et `chats/{chatId}/messages/{messageId}`. Les jetons sont lus depuis `fcm_tokens`; l'auteur de la discussion générale est exclu et les jetons FCM invalides sont supprimés.
