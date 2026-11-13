const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

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
    .map(document => ({ document, token: document.get("token") }))
    .filter(entry => typeof entry.token === "string" && entry.token.length > 0);

  for (let offset = 0; offset < usableTokens.length; offset += 500) {
    const batch = usableTokens.slice(offset, offset + 500);
    const result = await getMessaging().sendEachForMulticast({
      tokens: batch.map(entry => entry.token),
      data: { title, body, url, tag }
    });
    const staleDocuments = [];

    result.responses.forEach((response, index) => {
      const code = response.error?.code;
      if (code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered") {
        staleDocuments.push(batch[index].document.ref.delete());
      }
    });

    await Promise.all(staleDocuments);
  }
}

exports.notifyGeneralDiscussion = onDocumentCreated("messages/{messageId}", async event => {
  const message = event.data?.data();
  const sender = normalize(message?.sender);
  if (!message || !sender) return;

  const tokenSnapshot = await db.collection("notificationTokens")
    .where("usernameNormalized", "!=", sender)
    .get();
  await sendToTokenDocuments(
    tokenSnapshot.docs,
    `💬 ${message.sender} (Discussion)`,
    messageBody(message),
    "./rapporte.html",
    event.params.messageId
  );
});

exports.notifySecretDiscussion = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async event => {
    const message = event.data?.data();
    const sender = normalize(message?.sender);
    if (!message || !sender) return;

    const resultsSnapshot = await db.collection("results").get();
    let notification = null;

    for (const result of resultsSnapshot.docs) {
      const { player, picked } = result.data();
      if (typeof player !== "string" || typeof picked !== "string") continue;
      if (chatIdFor(player, picked) !== event.params.chatId) continue;

      if (sender === normalize(player)) {
        notification = {
          recipient: picked,
          title: "🎅 Ton Père Noël secret",
          url: "./aup.html"
        };
      } else if (sender === normalize(picked)) {
        notification = {
          recipient: player,
          title: `🧝 Ton lutin secret (${picked})`,
          url: "./auf.html"
        };
      }
      break;
    }

    if (!notification) return;

    const tokenSnapshot = await db.collection("notificationTokens")
      .where("usernameNormalized", "==", normalize(notification.recipient))
      .get();
    await sendToTokenDocuments(
      tokenSnapshot.docs,
      notification.title,
      messageBody(message),
      notification.url,
      event.params.messageId
    );
  }
);
