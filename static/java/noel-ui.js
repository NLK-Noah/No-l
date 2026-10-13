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
        
        const sapinLayer = document.createElement('div');
        sapinLayer.classList.add('parallax-layer');
        sapinLayer.dataset.speed = "0.05";
        
        // On ajuste la quantité de sapins selon la largeur de l'écran
        const isMobile = window.innerWidth < 768;
        const sapinConfigs = isMobile 
            ? [ // Moins de sapins et plus espacés pour mobile
                { left: '5%', size: '100px', opacity: '0.7' },
                { left: '30%', size: '120px', opacity: '0.9' },
                { left: '60%', size: '110px', opacity: '0.8' },
                { left: '85%', size: '130px', opacity: '1' },
              ]
            : [ // Forêt complète pour desktop
                { left: '5%', size: '250px', opacity: '0.8' },
                { left: '20%', size: '350px', opacity: '1' },
                { left: '35%', size: '200px', opacity: '0.7' },
                { left: '55%', size: '300px', opacity: '0.9' },
                { left: '70%', size: '220px', opacity: '0.6' },
                { left: '85%', size: '400px', opacity: '1' },
              ];

        sapinConfigs.forEach(cfg => {
            const sapin = document.createElement('img');
            sapin.src = 'static/png/sapin.png';
            sapin.classList.add('scene-element');
            sapin.style.position = 'absolute';
            sapin.style.bottom = '10%';
            sapin.style.left = cfg.left;
            sapin.style.width = cfg.size;
            sapin.style.opacity = cfg.opacity;
            sapin.style.filter = 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))';
            sapinLayer.appendChild(sapin);
        });
        
        scene.appendChild(sapinLayer);
        
        const snowFloor = document.createElement('div');
        snowFloor.classList.add('snow-floor');
        snowFloor.innerHTML = '<div class="snow-layer"></div>';
        
        document.body.appendChild(scene);
        document.body.appendChild(snowFloor);

        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            const layers = scene.querySelectorAll('.parallax-layer');
            layers.forEach(layer => {
                const speed = parseFloat(layer.dataset.speed);
                const moveX = (x - 0.5) * speed * 100;
                const moveY = (y - 0.5) * speed * 100;
                layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    createGuirlande('top');
    createGuirlande('bottom');
    setupMenuScene();
});
