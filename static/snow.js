const container = document.getElementById('snow-container');

function createFlake() {
  const flake = document.createElement('div');
  flake.classList.add('snowflake');
  flake.textContent = '❄';

  flake.style.left = Math.random() * 100 + 'vw';
  flake.style.fontSize = (Math.random() * 20 + 10) + 'px';
  flake.style.animationDuration = (Math.random() * 3 + 2) + 's';

  container.appendChild(flake);

  setTimeout(() => flake.remove(), 5000);
}

setInterval(createFlake, 120);
