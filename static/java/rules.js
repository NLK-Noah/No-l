import { db } from "./firebase-init.js";
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "index.html";
} else {
  initRules();
}

async function initRules() {
  const rulesEl = document.getElementById("rules");
  const startBtn = document.getElementById("start");

  try {
    const userUpper = username.trim().toUpperCase();
    const snapshot = await getDocs(collection(db, "results"));
    const alreadyDone = snapshot.docs.some(d => {
      const p = (d.data().player || "").trim().toUpperCase();
      return p === userUpper;
    });

    if (alreadyDone) {
      // Déjà tiré → aller directement au résultat
      window.location.href = "resultat.html";
      return;
    }

    // Sinon, afficher les règles
    if (rulesEl) rulesEl.style.display = "block";
  } catch (err) {
    console.error("Erreur vérification tirage :", err);
    if (rulesEl) rulesEl.style.display = "block";
  }

  if (startBtn) {
    startBtn.onclick = () => {
      window.location.href = "tirage.html";
    };
  }
}
