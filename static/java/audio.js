const sounds = {
    bell: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'), // Son de clochette
    paper: new Audio('https://assets.mixkit.co/active_storage/sfx/25 la/25-preview.mp3') // Son de papier
};

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log("Audio playback blocked by browser"));
    }
}

window.playSound = playSound;
