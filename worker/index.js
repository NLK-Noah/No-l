'use strict';

const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

const workerDir = __dirname;
dotenv.config({ path: path.join(workerDir, '.env') });

const credentialPath = path.resolve(
  workerDir,
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json'
);

if (!fs.existsSync(credentialPath)) {
  throw new Error(
    `Compte de service introuvable : ${credentialPath}. ` +
    'Définissez FIREBASE_SERVICE_ACCOUNT_PATH dans worker/.env.'
  );
}

const serviceAccount = require(credentialPath);
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const messaging = getMessaging(app);
let initialSnapshotReceived = false;

function normalize(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function getMessageBody(message) {
  if (message.type === 'poll') {
    return `Nouveau sondage : ${message.poll?.question || 'Sondage de Noël'}`.slice(0, 180);
  }
  if (message.photo) {
    return (message.content ? `📷 Photo : ${message.content}` : 'A partagé une photo 📷').slice(0, 180);
  }
  if (message.gif) return 'A envoyé un GIF festif 🎬';
  return String(message.content || 'Nouveau message').slice(0, 180);
}

async function notifySubscribers(messageId, message) {
  const sender = normalize(message.sender);
  if (!sender) {
    console.warn(`[worker] Message ${messageId} ignoré : auteur absent.`);
    return;
  }

  const tokenSnapshot = await db.collection('fcm_tokens').get();
  const subscribers = tokenSnapshot.docs
    .map(document => ({ document, token: document.get('token') }))
    .filter(entry =>
      typeof entry.token === 'string' &&
      entry.token.length > 0 &&
      normalize(entry.document.get('usernameNormalized') || entry.document.get('username')) !== sender
    );

  const body = getMessageBody(message);
  let successCount = 0;
  let failureCount = 0;

  for (let offset = 0; offset < subscribers.length; offset += 500) {
    const batch = subscribers.slice(offset, offset + 500);
    const result = await messaging.sendEachForMulticast({
      tokens: batch.map(entry => entry.token),
      data: {
        title: `💬 ${message.sender} (Discussion)`,
        body,
        url: './rapporte.html',
        tag: messageId
      }
    });

    successCount += result.successCount;
    failureCount += result.failureCount;

    const staleTokenDeletes = [];
    result.responses.forEach((response, index) => {
      const code = response.error?.code;
      if (
        code === 'messaging/invalid-registration-token' ||
        code === 'messaging/registration-token-not-registered'
      ) {
        staleTokenDeletes.push(batch[index].document.ref.delete());
      } else if (response.error) {
        console.error(`[worker] Envoi impossible (${code || 'erreur inconnue'}).`);
      }
    });
    await Promise.all(staleTokenDeletes);
  }

  console.log(
    `[worker] Message ${messageId} : ${successCount} envoyé(s), ${failureCount} échec(s), ` +
    `${subscribers.length} jeton(s) ciblé(s).`
  );
}

console.log(`[worker] Écoute de Firestore démarrée pour ${serviceAccount.project_id}.`);

db.collection('messages').onSnapshot(
  snapshot => {
    if (!initialSnapshotReceived) {
      initialSnapshotReceived = true;
      console.log(`[worker] Démarrage terminé ; ${snapshot.size} message(s) existant(s) ignoré(s).`);
      return;
    }

    for (const change of snapshot.docChanges()) {
      if (change.type !== 'added') continue;
      notifySubscribers(change.doc.id, change.doc.data()).catch(error => {
        console.error(`[worker] Notification du message ${change.doc.id} impossible :`, error);
      });
    }
  },
  error => {
    console.error('[worker] Écoute Firestore interrompue :', error);
  }
);
