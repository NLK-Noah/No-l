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
    // We use window.location.href to be more robust than pathname
    if (window.location.href.includes('menu.html')) {
        const scene = document.createElement('div');
        scene.classList.add('noel-scene');
        
        scene.innerHTML = `
            <div class="scene-element sapin">🎄</div>
            <div class="scene-element chalet">🏡</div>
            <div class="scene-element pere-noel">🎅</div>
        `;
        
        document.body.appendChild(scene);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    createGuirlande('top');
    createGuirlande('bottom');
    setupMenuScene();
});
