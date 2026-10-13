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
    if (window.location.href.includes('menu.html')) {
        const scene = document.createElement('div');
        scene.classList.add('noel-scene');
        
        // Using high-quality PNG assets instead of emojis
        scene.innerHTML = `
            <img src="static/png/sapin.png" class="scene-element sapin" alt="Sapin">
            <img src="static/png/back.png" class="scene-element chalet" alt="Chalet">
            <img src="static/png/naima.png" class="scene-element pere-noel" alt="Pere Noel">
        `;
        
        document.body.appendChild(scene);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    createGuirlande('top');
    createGuirlande('bottom');
    setupMenuScene();
});
