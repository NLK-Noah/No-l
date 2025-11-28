import { db } from "./firebase-init.js";
import { collection, query, where, getDocs, addDoc } 
from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "index.html";
}

// Vérifier si cette personne a déjà tiré quelqu'un
const q = query(
  collection(db, "results"),
  where("player", "==", username)
);

const snapshot = await getDocs(q);

if (snapshot.size > 0) {
  // Déjà tiré → aller directement au résultat
  window.location.href = "resultat.html";
}

// Sinon, afficher les règles et le bouton
document.getElementById("rules").style.display = "block";

// Lancer le tirage
document.getElementById("start").addEventListener("click", () => {
  window.location.href = "tirage.html";
});