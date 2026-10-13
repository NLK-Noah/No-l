document.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        
        const dx = (Math.random() - 0.5) * 50 + 'px';
        const dy = (Math.random() - 0.5) * 50 + 'px';
        
        sparkle.style.setProperty('--dx', dx);
        sparkle.style.setProperty('--dy', dy);
        sparkle.style.left = e.pageX + 'px';
        sparkle.style.top = e.pageY + 'px';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 600);
    }
});
