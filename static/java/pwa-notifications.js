/**
 * PWA Installation Helper & Notifications System
 * Support complet iOS (iPhone/iPad PWA & iOS 16.4+ Web Push), Android & Desktop
 */

(function () {
  'use strict';

  // 1. Enregistrement du Service Worker
  let swRegistration = null;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Calculer le chemin relatif vers sw.js selon la profondeur
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

      // Spécificité iOS : Si sur iOS et PAS en mode PWA installée
      if (isIOS && !isStandalone) {
        alert("📲 Pour activer les notifications sur iPhone/iPad :\n\n1. Ajoute d'abord l'application à ton écran d'accueil (Bouton Partager ⎋ -> 'Sur l'écran d'accueil' ➕)\n2. Ouvre l'app depuis ton écran d'accueil pour autoriser les notifications !");
        return 'ios-not-standalone';
      }

      try {
        const perm = await Notification.requestPermission();
        this.permission = perm;
        localStorage.setItem('christmas_notifications', perm);

        if (perm === 'granted') {
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

    async sendNotification(title, body, url = './menu.html') {
      if (!this.isSupported || Notification.permission !== 'granted') return;

      const options = {
        body: body,
        icon: './static/png/apple-touch-icon.png',
        badge: './static/png/apple-touch-icon.png',
        vibrate: [200, 100, 200],
        data: { url: url }
      };

      if (swRegistration && 'showNotification' in swRegistration) {
        try {
          await swRegistration.showNotification(title, options);
          return;
        } catch (e) {
          console.warn("Échec showNotification SW, fallback classique :", e);
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
      // Rappel quotidien de l'Avent en décembre
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

  // 4. Interface Utilisateur & Modales
  function initPwaUi() {
    // A. Bannière d'installation iOS (si non installé et sur iOS)
    const installDismissed = localStorage.getItem('ios_install_dismissed');
    if (isIOS && !isStandalone && !installDismissed) {
      createIosInstallBanner();
    }

    // B. Bouton flottant de notification (présent sur menu.html et avent.html)
    const isMenuOrAvent = window.location.pathname.includes('menu.html') || 
                          window.location.pathname.includes('avent.html');
    if (isMenuOrAvent) {
      createNotificationBell();
    }

    // C. Vérifier les rappels de l'Avent
    if (Notification.permission === 'granted') {
      notifManager.checkDailyAdventReminder();
    }
  }

  // Création du bandeau d'installation iOS
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
          Tu utilises un navigateur intégré. Pour installer l'application et profiter du plein écran et des notifications :
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
      // Ne plus afficher pendant 48 heures
      localStorage.setItem('ios_install_dismissed', Date.now());
    };
  }

  // Création du bouton cloche de notification
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

  // Modale de gestion des notifications
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
            Ne manque rien du réveillon ! Reçois les rappels du Calendrier de l'Avent, les alertes Secret Santa et les messages de fête en direct.
          </p>

          ${isIOS && !isStandalone ? `
            <div class="notif-ios-warning">
              ℹ️ <strong>Règle iOS Apple :</strong> Les notifications push sur iPhone fonctionnent uniquement une fois l'application ajoutée à l'écran d'accueil via le bouton Partager ⎋ de Safari !
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

  // Écouteur avant installation pour Android / Chrome desktop
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredInstallPrompt = e;
  });

  // Initialisation dès que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPwaUi);
  } else {
    initPwaUi();
  }

})();
