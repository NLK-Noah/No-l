"use strict";

const functions = require("firebase-functions/v1");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

const db = getFirestore();

function normalize(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function chatIdFor(player, picked) {
  return [player, picked].sort().join("_");
}

function messageBody(message) {
  if (message.type === "poll") {
    return `Nouveau sondage : ${message.poll?.question || "Sondage de Noël"}`.slice(0, 180);
  }
  if (message.photo) {
    return (message.content
      ? `📷 Photo : ${message.content}`
      : "A partagé une photo 📷").slice(0, 180);
  }
  if (message.gif) return "A envoyé un GIF festif 🎬";
  return String(message.content || "Nouveau message").slice(0, 180);
}

async function sendToTokenDocuments(tokenDocuments, title, body, url, tag) {
  const usableTokens = tokenDocuments
    .map((document) => ({
      document,
      token: document.get("token"),
    }))
    .filter((entry) => typeof entry.token === "string" && entry.token.length > 0);

  if (process.env.FCM_DRY_RUN === "1") {
    console.log(`[FCM dry-run] ${title} — ${usableTokens.length} jeton(s), destination ${url}.`);
    return;
  }

  for (let offset = 0; offset < usableTokens.length; offset += 500) {
    const batch = usableTokens.slice(offset, offset + 500);
    const result = await getMessaging().sendEachForMulticast({
      tokens: batch.map((entry) => entry.token),
      data: { title, body, url, tag },
    });
    const staleTokenDeletes = [];

    result.responses.forEach((response, index) => {
      const code = response.error?.code;
      if (
        code === "messaging/invalid-registration-token" ||
        code === "messaging/registration-token-not-registered"
      ) {
        staleTokenDeletes.push(batch[index].document.ref.delete());
      } else if (response.error) {
        console.error(`[FCM] Échec d'envoi (${code || "erreur inconnue"}).`);
      }
    });

    await Promise.all(staleTokenDeletes);
    console.log(
      `[FCM] ${result.successCount} envoyé(s), ${result.failureCount} échec(s).`
    );
  }
}

async function getTokenDocuments(excludedUser = "") {
  const snapshot = await db.collection("fcm_tokens").get();
  return snapshot.docs.filter((document) => {
    const username = normalize(
      document.get("usernameNormalized") || document.get("username")
    );
    return !excludedUser || username !== excludedUser;
  });
}

exports.notifyGeneralDiscussion = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const message = snapshot.data();
    const sender = normalize(message?.sender);
    if (!message || !sender) {
      console.warn(`[Firestore] Message ${context.params.messageId} ignoré : auteur absent.`);
      return null;
    }

    const tokens = await getTokenDocuments(sender);
    await sendToTokenDocuments(
      tokens,
      `💬 ${message.sender} (Discussion)`,
      messageBody(message),
      "./rapporte.html",
      context.params.messageId
    );
    return null;
  });

exports.notifySecretDiscussion = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const message = snapshot.data();
    const sender = normalize(message?.sender);
    if (!message || !sender) return null;

    const resultsSnapshot = await db.collection("results").get();
    let notification = null;

    for (const result of resultsSnapshot.docs) {
      const { player, picked } = result.data();
      if (typeof player !== "string" || typeof picked !== "string") continue;
      if (chatIdFor(player, picked) !== context.params.chatId) continue;

      if (sender === normalize(player)) {
        notification = {
          recipient: normalize(picked),
          title: "🎅 Ton Père Noël secret",
          url: "./aup.html",
        };
      } else if (sender === normalize(picked)) {
        notification = {
          recipient: normalize(player),
          title: `🧝 Ton lutin secret (${picked})`,
          url: "./auf.html",
        };
      }
      break;
    }

    if (!notification) return null;

    const tokenDocuments = await getTokenDocuments();
    const tokens = tokenDocuments.filter((document) => {
      const username = normalize(
        document.get("usernameNormalized") || document.get("username")
      );
      return username === notification.recipient;
    });
    await sendToTokenDocuments(
      tokens,
      notification.title,
      messageBody(message),
      notification.url,
      context.params.messageId
    );
    return null;
  });
