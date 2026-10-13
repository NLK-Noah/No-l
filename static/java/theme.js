function updateTheme() {
    const hour = new Date().getHours();
    const body = document.body;
    
    // Mode Nuit: between 6pm (18h) and 6am (6h)
    if (hour >= 18 || hour < 6) {
        body.setAttribute('data-theme', 'night');
        console.log("Ambiance cosy activée 🕯️");
    } else {
        body.setAttribute('data-theme', 'day');
        console.log("Ambiance neige éclatante activée ❄️");
    }
}

// Execute on load
window.addEventListener('DOMContentLoaded', updateTheme);
