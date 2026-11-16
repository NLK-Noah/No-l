'use strict';

const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

const workerDir = __dirname;
dotenv.config({ path: path.join(workerDir, '.env') });

let credential;
let projectId = 'inconnu';

if (process.env.FIREBASE_CONFIG) {
    const serviceAccountConfig = JSON.parse(process.env.FIREBASE_CONFIG);
    credential = cert(serviceAccountConfig);
    projectId = serviceAccountConfig.project_id || 'projet-firebase';
} else {
    const credentialPath = path.resolve(
        workerDir,
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json'
    );
    if (!fs.existsSync(credentialPath)) {
        throw new Error(
            `Compte de service introuvable : ${credentialPath}. Définissez FIREBASE_SERVICE_ACCOUNT_PATH ou le secret FIREBASE_CONFIG.`
        );
    }
    const serviceAccount = require(credentialPath);
    credential = cert(serviceAccount);
    projectId = serviceAccount.project_id || 'projet-firebase';
}

const app = initializeApp({ credential });
const db = getFirestore(app);
const messaging = getMessaging(app);

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

  if (subscribers.length === 0) {
    console.log(`[worker] Aucun abonné à notifier pour le message ${messageId}.`);
    return;
  }

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

async function runWorker() {
  console.log(`[worker] Démarrage de la vérification des messages pour ${projectId}...`);

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const snapshot = await db.collection('messages')
    .where('createdAt', '>=', Timestamp.fromDate(fifteenMinutesAgo))
    .get();

  if (snapshot.empty) {
    console.log('[worker] Aucun nouveau message récent trouvé.');
    process.exit(0);
  }

  console.log(`[worker] ${snapshot.size} message(s) récent(s) trouvé(s). Traitement en cours...`);

  for (const doc of snapshot.docs) {
    await notifySubscribers(doc.id, doc.data());
  }

  console.log('[worker] Traitement terminé avec succès.');
  process.exit(0);
}

runWorker().catch(error => {
  console.error('[worker] Erreur critique :', error);
  process.exit(1);
});
