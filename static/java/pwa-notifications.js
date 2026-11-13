/**
 * PWA Installation Helper & Real-Time Christmas Notifications System
 * Support complet iOS (iPhone/iPad PWA & iOS 16.4+ Web Push), Android & Desktop
 * Alertes en direct pour :
 * 1. Discussion générale (rapporte.html)
 * 2. Discussion avec le Père Noël secret (aup.html)
 * 3. Discussion avec le Lutin secret (auf.html)
 * 4. Rappels quotidiens du Calendrier de l'Avent
 */

(function () {
  'use strict';

  // 1. Enregistrement du Service Worker
  let swRegistration = null;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swPath = window.location.pathname.includes('/static/') ? '../../sw.js' : './sw.js';
      navigator.serviceWorker.register(swPath)
        .then(reg => {
          swRegistration = reg;
          console.log('[PWA] Service Worker enregistré avec succès :', reg.scope);
        })
        .catch(err => {
          console.warn('[PWA] Échec enregistrement Service Worker :', err);
        });
    });
  }

  // 2. Détection de l'environnement iOS & Standalone
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isStandalone = window.navigator.standalone === true || 
    window.matchMedia('(display-mode: standalone)').matches;

  const firebaseConfig = {
    apiKey: "AIzaSyBVQh_y9U1D5gA7BmCCFJgOlEPlUAogxV8",
    authDomain: "santa-secret-3c1f4.firebaseapp.com",
    projectId: "santa-secret-3c1f4",
    storageBucket: "santa-secret-3c1f4.firebasestorage.app",
    messagingSenderId: "238129661360",
    appId: "1:238129661360:web:d6ccb73539dc67d9f68275"
  };
  const FCM_VAPID_KEY = 'BP-4pla1fRxMG6tQNqk3iD7kNt6K2aKCD-j4w7tQdymme8JkzeXjqwUpJAVpcuGbKvaMC-HsRu77dxcnx3P0mF4';

  async function getFirebaseApp() {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js");
    return getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }

  async function registerFcmToken() {
    if (FCM_VAPID_KEY.startsWith('REPLACE_')) {
      throw new Error('La clé VAPID FCM doit être configurée.');
    }

    const currentUser = localStorage.getItem('username');
    if (!currentUser) throw new Error('Aucun utilisateur connecté.');

    const [messagingSdk, firestoreSdk] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js"),
      import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js")
    ]);

    if (!(await messagingSdk.isSupported())) {
      throw new Error('FCM n’est pas pris en charge par ce navigateur.');
    }

    const app = await getFirebaseApp();
    const registration = await navigator.serviceWorker.ready;
    const messaging = messagingSdk.getMessaging(app);
    const token = await messagingSdk.getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) throw new Error('Firebase n’a pas fourni de jeton FCM.');

    const tokenDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const tokenId = Array.from(new Uint8Array(tokenDigest), byte => byte.toString(16).padStart(2, '0')).join('');
    const username = currentUser.trim();
    const usernameNormalized = username.toUpperCase();
    const lastTokenId = localStorage.getItem('fcmTokenId');
    const lastUsername = localStorage.getItem('fcmTokenUsername');

    if (tokenId !== lastTokenId || usernameNormalized !== lastUsername) {
      const { doc, getFirestore, serverTimestamp, setDoc } = firestoreSdk;
      await setDoc(doc(getFirestore(app), 'notificationTokens', tokenId), {
        token,
        username,
        usernameNormalized,
        updatedAt: serverTimestamp()
      });
      localStorage.setItem('fcmTokenId', tokenId);
      localStorage.setItem('fcmTokenUsername', usernameNormalized);
    }
  }

  const isInAppBrowser = isIOS && !window.navigator.standalone && 
    (/FBAN|FBAV|Instagram|Line|Twitter|Snapchat|WhatsApp/i.test(navigator.userAgent) || 
     (!/Safari/i.test(navigator.userAgent) && /CriOS|FxiOS/i.test(navigator.userAgent)));

  // 3. Gestionnaire des Notifications
  class ChristmasNotificationManager {
    constructor() {
      this.isSupported = ('Notification' in window);
      this.permission = this.isSupported ? Notification.permission : 'denied';
    }

    async requestPermission() {
      if (!this.isSupported) {
        alert("Les notifications ne sont pas supportées par ce navigateur.");
        return 'unsupported';
      }

      if (isIOS && !isStandalone) {
        alert("📲 Pour activer les notifications sur iPhone/iPad :\n\n1. Ajoute d'abord l'application à ton écran d'accueil (Bouton Partager ⎋ -> 'Sur l'écran d'accueil' ➕)\n2. Ouvre l'app depuis ton écran d'accueil pour autoriser les notifications !");
        return 'ios-not-standalone';
      }

      try {
        const perm = await Notification.requestPermission();
        this.permission = perm;
        localStorage.setItem('christmas_notifications', perm);

        if (perm === 'granted') {
          try {
            await registerFcmToken();
          } catch (err) {
            console.error('[FCM] Inscription des notifications impossible :', err);
            alert("Les notifications sont autorisées, mais l’inscription Firebase n’a pas abouti. Vérifie la configuration FCM de l’application.");
            return 'fcm-error';
          }
          this.sendTestNotification();
          this.updateUiState();
          return 'granted';
        } else {
          alert("Les notifications sont refusées. Tu peux les réactiver dans les Réglages de ton appareil.");
          return 'denied';
        }
      } catch (err) {
        console.error("Erreur demande permission :", err);
        return 'error';
      }
    }

    async sendNotification(title, body, url = './menu.html', tag) {
      if (!this.isSupported || Notification.permission !== 'granted') return;

      const options = {
        body: body,
        icon: './static/png/apple-touch-icon.png',
        badge: './static/png/apple-touch-icon.png',
        vibrate: [200, 100, 200, 100, 200],
        data: { url: url },
        tag
      };

      if (swRegistration && 'showNotification' in swRegistration) {
        try {
          await swRegistration.showNotification(title, options);
          return;
        } catch (e) {
          console.warn("Échec showNotification SW, fallback Notification :", e);
        }
      }

      try {
        new Notification(title, options);
      } catch (e) {
        console.warn("Échec constructeur Notification :", e);
      }
    }

    sendTestNotification() {
      this.sendNotification(
        "🎅 Ho Ho Ho ! Félicitations ✨",
        "Les notifications du Festin d'Hiver sont bien activées sur ton téléphone ! 🎄🎁",
        './menu.html'
      );
    }

    checkDailyAdventReminder() {
      const now = new Date();
      const month = now.getMonth(); // 11 = Décembre
      const day = now.getDate();

      if (month === 11 && day >= 1 && day <= 24) {
        const lastNotifiedDay = localStorage.getItem('last_advent_notified_day');
        if (lastNotifiedDay !== String(day)) {
          localStorage.setItem('last_advent_notified_day', String(day));
          setTimeout(() => {
            this.sendNotification(
              `📅 Case du jour n°${day} ouverte !`,
              `Le défi de Noël d'aujourd'hui est prêt dans ton Calendrier de l'Avent ! 🎮✨`,
              './avent.html'
            );
          }, 3000);
        }
      }
    }

    updateUiState() {
      const bellBtn = document.getElementById('notifBellBtn');
      if (bellBtn) {
        if (this.permission === 'granted') {
          bellBtn.classList.remove('has-badge');
          bellBtn.title = 'Notifications activées ✅';
        } else {
          bellBtn.classList.add('has-badge');
          bellBtn.title = 'Activer les notifications 🔔';
        }
      }
    }
  }

  const notifManager = new ChristmasNotificationManager();
  window.ChristmasNotifications = notifManager;

  // 4. Alertes Sonores et Visuelles In-App
  function playChristmasChime() {
    try {
      if (typeof window.playSound === 'function') {
        window.playSound('bell');
      } else {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        audio.play().catch(() => {});
      }
    } catch (e) {}
  }

  function showInAppToast(icon, title, body, url) {
    const oldToast = document.querySelector('.christmas-chat-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'christmas-chat-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const iconElement = document.createElement('div');
    iconElement.className = 'christmas-toast-icon';
    iconElement.textContent = icon;

    const content = document.createElement('div');
    content.className = 'christmas-toast-content';

    const titleElement = document.createElement('div');
    titleElement.className = 'christmas-toast-title';
    titleElement.textContent = title;

    const bodyElement = document.createElement('div');
    bodyElement.className = 'christmas-toast-body';
    bodyElement.textContent = body || 'Nouveau message';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'christmas-toast-close';
    closeButton.title = 'Fermer';
    closeButton.setAttribute('aria-label', 'Fermer la notification');
    closeButton.textContent = '✕';

    content.append(titleElement, bodyElement);
    toast.append(iconElement, content, closeButton);

    toast.onclick = (e) => {
      if (e.target === closeButton) {
        e.stopPropagation();
        toast.remove();
        return;
      }
      window.location.href = url;
    };

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -40px)';
        setTimeout(() => toast.remove(), 400);
      }
    }, 6000);
  }

  function triggerMessageAlert({ icon, title, body, url, tag }) {
    if (document.visibilityState === 'visible') {
      playChristmasChime();
      showInAppToast(icon, title, body, url);
    }
    notifManager.sendNotification(title, body, url, tag);
  }

  // 5. Écouteurs en Temps Réel pour les Discussions (Firebase)
  async function initChatAlerts() {
    const currentUser = localStorage.getItem("username");
    if (!currentUser) return; // Non connecté

    try {
      const { getFirestore, collection, query, orderBy, limit, onSnapshot, getDocs } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");
      const db = getFirestore(await getFirebaseApp());

      const userUpper = currentUser.trim().toUpperCase();

      // A. Écoute de la Discussion générale (rapporte.html)
      listenGeneralChat(db, userUpper, query, collection, orderBy, limit, onSnapshot);

      // B. Écoute des chats secrets (aup.html et auf.html)
      listenSecretChats(db, currentUser, userUpper, query, collection, orderBy, limit, onSnapshot, getDocs);

    } catch (err) {
      console.warn("[PWA] Impossible d'initialiser les alertes chat :", err);
    }
  }

  function listenGeneralChat(db, userUpper, query, collection, orderBy, limit, onSnapshot) {
    let initialLoaded = false;
    const knownMsgIds = new Set();
    const isDiscussionPage = window.location.pathname.includes('rapporte.html');

    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(15));

    onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      if (!initialLoaded) {
        if (snapshot.metadata.fromCache) return;
        snapshot.forEach(docSnap => knownMsgIds.add(docSnap.id));
        initialLoaded = true;
        return;
      }

      snapshot.docChanges().forEach(change => {
        if (change.type === "added" && !knownMsgIds.has(change.doc.id)) {
          knownMsgIds.add(change.doc.id);
          const msg = change.doc.data();
          const sender = String(msg.sender || "Membre");
          const senderUpper = sender.trim().toUpperCase();

          if (senderUpper === userUpper) return; // Ne pas s'alerter soi-même

          let bodyText = String(msg.content || "");
          let iconType = "💬";

          if (msg.type === "poll") {
            iconType = "📊";
            bodyText = `Nouveau sondage : "${msg.poll?.question || 'Sondage de Noël'}"`;
          } else if (msg.photo) {
            iconType = "📷";
            bodyText = msg.content ? `📷 Photo : ${msg.content}` : "A partagé une photo 📷";
          } else if (msg.gif) {
            iconType = "🎬";
            bodyText = "A envoyé un GIF festif 🎬";
          }

          const isTabHidden = document.visibilityState !== 'visible';
          if (!isDiscussionPage || isTabHidden) {
            triggerMessageAlert({
              icon: iconType,
              title: `💬 ${sender} (Discussion)`,
              body: bodyText,
              url: './rapporte.html',
              tag: change.doc.id
            });
          }
        }
      });
    }, err => {
      console.warn("[PWA] Erreur écoute discussion :", err);
    });
  }

  async function listenSecretChats(db, currentUser, userUpper, query, collection, orderBy, limit, onSnapshot, getDocs) {
    try {
      const resultsSnap = await getDocs(collection(db, "results"));
      let santaPlayer = null; // Mon Père Noël secret (personne qui m'offre)
      let lutinPicked = null; // Mon Lutin secret (personne à qui j'offre)

      resultsSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        const pUpper = (data.player || "").trim().toUpperCase();
        const pickedUpper = (data.picked || "").trim().toUpperCase();

        if (pickedUpper === userUpper) {
          santaPlayer = data.player;
        }
        if (pUpper === userUpper) {
          lutinPicked = data.picked;
        }
      });

      // Écoute du Père Noël secret (aup.html)
      if (santaPlayer) {
        const santaChatId = [currentUser, santaPlayer].sort().join('_');
        listenSpecificChat({
          db,
          chatId: santaChatId,
          otherUserUpper: santaPlayer.trim().toUpperCase(),
          icon: '🎅',
          title: "🎅 Ton Père Noël secret",
          targetPage: './aup.html',
          currentPage: 'aup.html',
          query, collection, orderBy, limit, onSnapshot
        });
      }

      // Écoute du Lutin secret (auf.html)
      if (lutinPicked) {
        const lutinChatId = [currentUser, lutinPicked].sort().join('_');
        listenSpecificChat({
          db,
          chatId: lutinChatId,
          otherUserUpper: lutinPicked.trim().toUpperCase(),
          icon: '🧝',
          title: `🧝 Ton lutin secret (${lutinPicked})`,
          targetPage: './auf.html',
          currentPage: 'auf.html',
          query, collection, orderBy, limit, onSnapshot
        });
      }

    } catch (err) {
      console.warn("[PWA] Erreur recherche chats secrets :", err);
    }
  }

  function listenSpecificChat({ db, chatId, otherUserUpper, icon, title, targetPage, currentPage, query, collection, orderBy, limit, onSnapshot }) {
    let initialLoaded = false;
    const knownMsgIds = new Set();
    const isCurrentChatPage = window.location.pathname.includes(currentPage);

    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "desc"), limit(10));

    onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      if (!initialLoaded) {
        if (snapshot.metadata.fromCache) return;
        snapshot.forEach(docSnap => knownMsgIds.add(docSnap.id));
        initialLoaded = true;
        return;
      }

      snapshot.docChanges().forEach(change => {
        if (change.type === "added" && !knownMsgIds.has(change.doc.id)) {
          knownMsgIds.add(change.doc.id);
          const msg = change.doc.data();
          const sender = String(msg.sender || "");
          const senderUpper = sender.trim().toUpperCase();

          if (senderUpper === otherUserUpper) {
            let bodyText = String(msg.content || "");
            if (msg.photo) {
              bodyText = msg.content ? `📷 Photo : ${msg.content}` : "T'a envoyé une photo 📷";
            }

            const isTabHidden = document.visibilityState !== 'visible';
            if (!isCurrentChatPage || isTabHidden) {
              triggerMessageAlert({
                icon: icon,
                title: title,
                body: bodyText,
                url: targetPage,
                tag: change.doc.id
              });
            }
          }
        }
      });
    }, err => {
      console.warn(`[PWA] Erreur écoute chat ${chatId} :`, err);
    });
  }

  // 6. Interface Utilisateur & Modales
  function initPwaUi() {
    const installDismissed = localStorage.getItem('ios_install_dismissed');
    if (isIOS && !isStandalone && !installDismissed) {
      createIosInstallBanner();
    }

    const isMenuOrAvent = window.location.pathname.includes('menu.html') || 
                          window.location.pathname.includes('avent.html');
    if (isMenuOrAvent) {
      createNotificationBell();
    }

    if (notifManager.isSupported && Notification.permission === 'granted') {
      notifManager.checkDailyAdventReminder();
      if (!FCM_VAPID_KEY.startsWith('REPLACE_')) {
        registerFcmToken().catch(err => {
          console.error('[FCM] Actualisation du jeton impossible :', err);
        });
      }
    }

    // Démarrer les alertes de messages en direct
    initChatAlerts();
  }

  function createIosInstallBanner() {
    if (document.getElementById('iosInstallBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'iosInstallBanner';
    banner.className = 'ios-install-banner';

    if (isInAppBrowser) {
      banner.innerHTML = `
        <div class="ios-install-header">
          <div class="ios-install-title">🍎 Ouvrir dans Safari</div>
          <button class="ios-install-close" id="closeIosBannerBtn">✕</button>
        </div>
        <div class="ios-install-body">
          Tu utilises un navigateur intégré. Pour installer l'application et profiter du plein écran et des alertes :
          <div style="margin-top: 6px; font-weight: 600; color: #ffd700;">
            1. Appuie sur les <strong>•••</strong> en haut à droite<br>
            2. Choisis <strong>"Ouvrir dans Safari" 🧭</strong>
          </div>
        </div>
      `;
    } else {
      banner.innerHTML = `
        <div class="ios-install-header">
          <div class="ios-install-title">📲 Installer sur ton iPhone</div>
          <button class="ios-install-close" id="closeIosBannerBtn">✕</button>
        </div>
        <div class="ios-install-body">
          Pour installer l'application de Noël sur ton écran d'accueil :
          <ol class="ios-install-steps">
            <li>Appuie sur le bouton <strong>Partager</strong> en bas de Safari <span class="ios-install-icon-share">⎋</span></li>
            <li>Fais défiler et sélectionne <strong>"Sur l'écran d'accueil" ➕</strong></li>
            <li>Valide en haut à droite sur <strong>"Ajouter"</strong> ✨</li>
          </ol>
        </div>
      `;
    }

    document.body.appendChild(banner);

    document.getElementById('closeIosBannerBtn').onclick = () => {
      banner.style.display = 'none';
      localStorage.setItem('ios_install_dismissed', Date.now());
    };
  }

  function createNotificationBell() {
    if (document.getElementById('notifBellBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'notifBellBtn';
    btn.className = `notif-floating-btn ${notifManager.permission !== 'granted' ? 'has-badge' : ''}`;
    btn.type = 'button';
    btn.title = 'Gérer les notifications de Noël 🔔';
    btn.innerHTML = '🔔';
    btn.onclick = openNotificationModal;

    document.body.appendChild(btn);
  }

  function openNotificationModal() {
    let modal = document.getElementById('notifModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'notifModal';
      modal.className = 'notif-modal-overlay';
      modal.innerHTML = `
        <div class="notif-modal-card">
          <button class="notif-modal-close" id="closeNotifModalBtn">✕</button>
          <div class="notif-modal-icon">🔔</div>
          <h3 class="notif-modal-title">Notifications de Noël</h3>
          <p class="notif-modal-desc">
            Ne manque rien du réveillon ! Reçois les alertes de nouveaux messages dans la <strong>Discussion</strong>, avec ton <strong>Père Noël</strong> ou ton <strong>Lutin</strong> secret, et les rappels du Calendrier de l'Avent.
          </p>

          ${isIOS && !isStandalone ? `
            <div class="notif-ios-warning">
              ℹ️ <strong>Règle iOS Apple :</strong> Les notifications sur iPhone fonctionnent dès que l'application est ajoutée à l'écran d'accueil via le bouton Partager ⎋ de Safari !
            </div>
          ` : ''}

          <button type="button" class="notif-modal-btn notif-btn-enable" id="enableNotifBtn">
            ${notifManager.permission === 'granted' ? 'Notifications déjà activées ✅' : 'Activer les notifications 🔔'}
          </button>
          <button type="button" class="notif-modal-btn notif-btn-test" id="testNotifBtn">
            Envoyer un test 🎅
          </button>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('closeNotifModalBtn').onclick = () => {
        modal.style.display = 'none';
      };
      modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
      };

      document.getElementById('enableNotifBtn').onclick = async () => {
        const res = await notifManager.requestPermission();
        if (res === 'granted') {
          document.getElementById('enableNotifBtn').textContent = 'Notifications activées ✅';
        }
      };

      document.getElementById('testNotifBtn').onclick = async () => {
        if (notifManager.permission !== 'granted') {
          const res = await notifManager.requestPermission();
          if (res !== 'granted') return;
        }
        notifManager.sendTestNotification();
      };
    }

    modal.style.display = 'flex';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredInstallPrompt = e;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPwaUi);
  } else {
    initPwaUi();
  }

})();
