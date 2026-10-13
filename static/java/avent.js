const surprises = {
    1: "🎄 Bienvenue dans l'aventure de Noël 2026 ! Prépare-toi pour 24 surprises.",
    2: "❄️ Le savais-tu ? Aucun flocon de neige n'est identique.",
    3: "🎁 Surprise ! Va voir la page <a href='pays.html'>Pays</a> pour un indice secret.",
    4: "🍪 Moment gourmand : Imagine que je t'offre un cookie virtuel ! 🍪",
    5: "🌟 Blague : Pourquoi les rennes ne vont-ils pas à l'école ? Parce qu'ils sont déjà des 'cerfs'-tifiés !",
    6: "🎄 Défi : Trouve l'image cachée dans la page <a href='menu.html'>Menu</a>.",
    7: "✨ Magie : Ferme les yeux, fais un vœu, et clique encore une fois.",
    8: "❄️ Froid ! Quel est ton plat de Noël préféré ?",
    9: "🎁 Un cadeau virtuel : 🏆 Le trophée du meilleur cousin/cousine !",
    10: "🎅 Le Père Noël a dit : 'L'important c'est de participer !'",
    11: "🌟 Devinette : Je suis blanc, je tombe du ciel et je fonds... Qui suis-je ?",
    12: "🎄 Direction <a href='animal.html'>Animaux</a> pour découvrir un animal festif.",
    13: "❄️ Mi-parcours ! Tu tiens le coup ?",
    14: "🍪 Recette secrète : 1 dose d'amour + 2 doses de chocolat = Bonheur.",
    15: "🎁 Surprise : Tu as gagné un ticket pour un câlin gratuit !",
    16: "🎅 Le saviez-vous ? Le Père Noël utilise des GPS pour ne pas se perdre.",
    17: "🌟 Blague : Qu'est-ce qu'un lutin qui fait du sport ? Un lutin-athlon !",
    18: "🎄 Visite <a href='objet.html'>Objets</a> pour trouver un objet magique.",
    19: "❄️ Température : -10°C... Brrr ! Mets un pull !",
    20: "🎁 Presque arrivé ! Encore un effort.",
    21: "🎅 Le Père Noël prépare son traîneau, es-tu prêt ?",
    22: "🌟 Rêve : Imagine ton cadeau idéal pour Noël...",
    23: "🎄 Demain c'est le grand jour !",
    24: "🎁 JOYEUX NOËL 2026 ! 🎄✨ Que cette journée soit magique !"
};

// MODE DEBUG : change à false pour activer la restriction par date
const DEBUG_MODE = true;

function initCalendar() {
    const calendar = document.getElementById('calendar');
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth(); // 11 pour décembre

    for (let i = 1; i <= 24; i++) {
        const dayCard = document.createElement('div');
        dayCard.classList.add('day-card');
        dayCard.innerText = i;

        // Vérification de la date (uniquement en décembre)
        const isLocked = !DEBUG_MODE && (currentMonth !== 11 || today < i);

        if (isLocked) {
            dayCard.classList.add('locked');
        }

        dayCard.addEventListener('click', () => openDay(i, isLocked));
        calendar.appendChild(dayCard);
    }
}

function openDay(day, isLocked) {
    if (isLocked) {
        alert("Patience ! Cette case ne s'ouvre que le " + day + " décembre.");
        return;
    }

    const modal = document.getElementById('modal');
    const content = document.getElementById('surprise-content');

    content.innerHTML = `<h2>Jour ${day}</h2><p>${surprises[day]}</p>`;
    modal.style.display = 'flex';

    // Marquer la case comme ouverte
    event.target.classList.add('opened');
}

// Fermer la modal
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

// Fermer la modal en cliquant à côté
window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

window.onload = initCalendar;
