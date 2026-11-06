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

window.addEventListener('DOMContentLoaded', () => {
    createGuirlande('top');
    createGuirlande('bottom');
});
