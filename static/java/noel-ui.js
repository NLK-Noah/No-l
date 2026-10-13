function createGuirlande(position) {
    const guirlande = document.createElement('div');
    guirlande.classList.add('guirlande');
    guirlande.classList.add(position === 'top' ? 'guirlande-top' : 'guirlande-bottom');
    
    for (let i = 0; i < 20; i++) {
        const bulbe = document.createElement('div');
        bulbe.classList.add('bulbe');
        guirlande.appendChild(bulbe);
    }
    
    document.body.appendChild(guirlande);
}

function setupMenuScene() {
    if (window.location.pathname.includes('menu.html')) {
        const scene = document.createElement('div');
        scene.classList.add('noel-scene');
        
        // On utilise des emojis géants ou des images si elles existent, 
        // mais pour l'effet immédiat, on crée des éléments visuels stylisés
        scene.innerHTML = `
            <div class="scene-element sapin">🎄</div>
            <div class="scene-element chalet">🏡</div>
            <div class="scene-element pere-noel">🎅</div>
        `;
        
        // On stylise les emojis pour qu'ils soient énormes
        const elements = scene.querySelectorAll('.scene-element');
        elements.forEach(el => {
            el.style.fontSize = "200px";
            el.style.textAlign = "center";
        });
        
        document.body.appendChild(scene);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    createGuirlande('top');
    createGuirlande('bottom');
    setupMenuScene();
});
