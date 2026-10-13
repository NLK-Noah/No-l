function navigateWithSleigh(url) {
    const sleigh = document.createElement('div');
    sleigh.classList.add('sleigh-transition');
    sleigh.innerHTML = '🛷🎅🎁';
    document.body.appendChild(sleigh);

    // Trigger animation
    setTimeout(() => {
        sleigh.classList.add('sleigh-active');
    }, 10);

    // Redirect after animation
    setTimeout(() => {
        window.location.href = url;
    }, 1000);
}

// Override standard link clicks to use sleigh for specific links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
        // We only want the sleigh for certain transitions to avoid annoyance
        // Let's apply it to main menu and letter buttons
        if (link.classList.contains('btn-noel') || link.classList.contains('back')) {
            e.preventDefault();
            navigateWithSleigh(link.getAttribute('href'));
        }
    }
});
