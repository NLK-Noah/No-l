function createGuirlande() {
    const guirlande = document.createElement('div');
    guirlande.classList.add('guirlande');
    
    // Créer 20 bulbes colorés
    for (let i = 0; i < 20; i++) {
        const bulbe = document.createElement('div');
        bulbe.classList.add('bulbe');
        guirlande.appendChild(bulbe);
    }
    
    document.body.prepend(guirlande);
}

function apply3DStyles() {
    // Transformer les h1 en style 3D
    const headers = document.querySelectorAll('h1');
    headers.forEach(h1 => {
        h1.style.fontFamily = "'Comic Sans MS', 'Arial', sans-serif";
        h1.style.fontSize = "4rem";
        h1.style.color = "#ff0000";
        h1.style.textShadow = "0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)";
    });

    // Envelopper le contenu principal dans un container-3d si possible
    const mainContent = document.body.querySelector('main') || document.body;
    // On ne wrap pas si c'est déjà le body pour éviter les bugs de layout
    if(mainContent !== document.body) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('container-3d');
        mainContent.parentNode.insertBefore(wrapper, mainContent);
        wrapper.appendChild(mainContent);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    createGuirlande();
    apply3DStyles();
});
