function enterSite() {
    const name = document.getElementById('username').value.trim();
    if (!name) {
        alert('Merci d\'entrer un prénom !');
        return;
}
localStorage.setItem('username', name);
window.location.href = 'menu.html';
}