const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function enterSite() {
const nameInput = document.getElementById('username');
const name = nameInput.value.trim();

```
if (!name) {  
    alert("Merci d'entrer un prénom !");  
    return;  
}  

// Vérifie si le prénom existe dans la collection participants  
try {  
    const participantsQuery = query(  
        collection(db, "participants"),  
        where("name", "==", name)  
    );  

    const snapshot = await getDocs(participantsQuery);  

    if (snapshot.empty) {  
        alert("Désolé, tu n'es pas inscrit pour jouer !");  
        return; // bloque l’accès  
    }  

    // Sinon, tout est bon  
    localStorage.setItem('username', name);  
    window.location.href = 'menu.html';  
} catch (error) {  
    console.error("Erreur lors de la vérification des participants :", error);  
    alert("Une erreur est survenue. Merci de réessayer.");  
}  
```

}

// Ajouter l'écouteur d'événement sur le bouton
document.addEventListener("DOMContentLoaded", () => {
const enterBtn = document.getElementById("username-btn");
enterBtn.addEventListener("click", enterSite);
});
