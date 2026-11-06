/**
 * ChristmasCamera - Module d'Appareil Photo & Filtres de Noël Festifs
 * Permet de prendre des photos avec filtres ou d'appliquer des filtres à des photos de la bibliothèque.
 */
(function(window) {
    'use strict';

    const FILTERS = [
        { id: 'none', label: 'Naturel', emoji: '✨', svg: null },
        {
            id: 'santa_hat',
            label: 'Bonnet',
            emoji: '🎅',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <path d="M 120 160 Q 200 40 310 110 Q 320 180 290 190 Q 220 160 120 160 Z" fill="#d90429" stroke="#8b0000" stroke-width="4"/>
                <circle cx="325" cy="115" r="28" fill="#ffffff" stroke="#ddd" stroke-width="3"/>
                <rect x="90" y="150" width="220" height="42" rx="21" fill="#ffffff" stroke="#ddd" stroke-width="3"/>
            </svg>`
        },
        {
            id: 'reindeer',
            label: 'Renne',
            emoji: '🦌',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <path d="M 130 140 C 120 90 90 70 70 50 M 90 85 C 60 90 50 110 40 120 M 110 110 C 80 125 70 145 60 155" stroke="#795548" stroke-width="12" stroke-linecap="round" fill="none"/>
                <path d="M 270 140 C 280 90 310 70 330 50 M 310 85 C 340 90 350 110 360 120 M 290 110 C 320 125 330 145 340 155" stroke="#795548" stroke-width="12" stroke-linecap="round" fill="none"/>
                <circle cx="200" cy="240" r="22" fill="#ff1744" stroke="#d50000" stroke-width="4"/>
                <circle cx="193" cy="233" r="6" fill="#ffffff" opacity="0.8"/>
            </svg>`
        },
        {
            id: 'beard',
            label: 'Barbe',
            emoji: '🧔',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <path d="M 200 240 C 160 215 130 250 110 240 C 140 260 170 260 200 250 C 230 260 260 260 290 240 C 270 250 240 215 200 240 Z" fill="#ffffff" stroke="#e0e0e0" stroke-width="3"/>
                <path d="M 120 250 C 90 300 130 380 200 385 C 270 380 310 300 280 250 C 260 300 220 330 200 330 C 180 330 140 300 120 250 Z" fill="#ffffff" stroke="#e0e0e0" stroke-width="4"/>
            </svg>`
        },
        {
            id: 'frame',
            label: 'Cadre',
            emoji: '🎄',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <rect x="8" y="8" width="384" height="384" rx="20" fill="none" stroke="#ffd700" stroke-width="6"/>
                <path d="M 8 70 L 40 40 L 70 8 L 8 8 Z" fill="#2e7d32"/>
                <path d="M 392 70 L 360 40 L 330 8 L 392 8 Z" fill="#2e7d32"/>
                <path d="M 8 330 L 40 360 L 70 392 L 8 392 Z" fill="#2e7d32"/>
                <path d="M 392 330 L 360 360 L 330 392 L 392 392 Z" fill="#2e7d32"/>
                <circle cx="45" cy="45" r="16" fill="#d50000" stroke="#ffd700" stroke-width="2"/>
                <circle cx="355" cy="45" r="16" fill="#ffd700" stroke="#ff6f00" stroke-width="2"/>
                <circle cx="45" cy="355" r="16" fill="#ffd700" stroke="#ff6f00" stroke-width="2"/>
                <circle cx="355" cy="355" r="16" fill="#d50000" stroke="#ffd700" stroke-width="2"/>
                <text x="200" y="34" font-size="28" text-anchor="middle">⭐</text>
                <text x="20" y="200" font-size="22">❄️</text>
                <text x="360" y="200" font-size="22">❄️</text>
                <text x="200" y="388" font-size="22" text-anchor="middle">🎁</text>
            </svg>`
        },
        {
            id: 'snow',
            label: 'Neige',
            emoji: '❄️',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <text x="40" y="70" font-size="34" opacity="0.9">❄️</text>
                <text x="320" y="90" font-size="40" opacity="0.85">❄️</text>
                <text x="180" y="140" font-size="26" opacity="0.75">❄️</text>
                <text x="70" y="220" font-size="28" opacity="0.8">❄️</text>
                <text x="310" y="260" font-size="36" opacity="0.9">❄️</text>
                <text x="140" y="320" font-size="30" opacity="0.85">❄️</text>
                <text x="250" y="360" font-size="34" opacity="0.8">❄️</text>
            </svg>`
        }
    ];

    let currentStream = null;
    let currentFacingMode = 'user';
    let selectedFilterId = 'santa_hat';
    let capturedDataUrl = null;
    let customUploadedImage = null;

    /**
     * Ouvre le modal de l'appareil photo avec filtres
     * @param {Object} options
     * @param {Function} options.onCapture - Callback recevant le base64 JPEG
     * @param {number} [options.maxDim=500] - Taille maximale de l'image de sortie
     * @param {string} [options.title="Photo de Noël 🎄"] - Titre du modal
     */
    function open(options = {}) {
        const onCapture = options.onCapture || function() {};
        const maxDim = options.maxDim || 500;
        const title = options.title || 'Photo de Noël 🎄';

        // Supprimer un ancien modal s'il traîne
        close();

        const modal = document.createElement('div');
        modal.id = 'noelCameraModal';
        modal.className = 'noel-camera-modal';

        modal.innerHTML = `
            <div class="noel-camera-header">
                <div class="noel-camera-title">🎅 ${title}</div>
                <button type="button" class="noel-camera-close" id="noelCamClose">✕</button>
            </div>

            <div class="noel-camera-viewport" id="noelCamViewport">
                <video id="noelCamVideo" autoplay playsinline muted></video>
                <div class="noel-filter-overlay" id="noelFilterOverlay"></div>
                <button type="button" class="noel-flip-btn" id="noelFlipBtn" title="Changer de caméra">🔄</button>
                <input type="file" id="noelGalleryInput" accept="image/*" style="display: none;">
            </div>

            <div class="noel-filters-bar" id="noelFiltersBar">
                ${FILTERS.map(f => `
                    <button type="button" class="noel-filter-btn ${f.id === selectedFilterId ? 'active' : ''}" data-filter="${f.id}">
                        <span class="filter-emoji">${f.emoji}</span>
                        <span>${f.label}</span>
                    </button>
                `).join('')}
            </div>

            <div class="noel-camera-controls" id="noelControlsLive">
                <button type="button" class="noel-gallery-btn" id="noelPickGallery">
                    📁 Bibliothèque
                </button>
                <button type="button" class="noel-snap-btn" id="noelSnapBtn" title="Prendre la photo">
                    📸
                </button>
                <div style="width: 80px;"></div>
            </div>

            <div class="noel-camera-controls" id="noelControlsPreview" style="display: none;">
                <button type="button" class="noel-retake-btn" id="noelRetakeBtn">
                    🔄 Reprendre
                </button>
                <button type="button" class="noel-confirm-btn" id="noelConfirmBtn">
                    ✅ Valider
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        const video = document.getElementById('noelCamVideo');
        const overlay = document.getElementById('noelFilterOverlay');
        const galleryInput = document.getElementById('noelGalleryInput');

        // Mettre à jour l'overlay du filtre
        updateFilterOverlay();

        // Événements
        document.getElementById('noelCamClose').onclick = close;
        document.getElementById('noelFlipBtn').onclick = () => {
            currentFacingMode = (currentFacingMode === 'user' ? 'environment' : 'user');
            customUploadedImage = null;
            startCamera(video);
        };

        // Choix du filtre
        modal.querySelectorAll('.noel-filter-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.noel-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedFilterId = btn.dataset.filter;
                updateFilterOverlay();
                // Si on est en mode prévisualisation d'image importée, régénérer l'aperçu
                if (capturedDataUrl && customUploadedImage) {
                    renderImageWithFilter(customUploadedImage, maxDim, (dataUrl) => {
                        capturedDataUrl = dataUrl;
                        showPreviewImage(dataUrl);
                    });
                }
            };
        });

        // Importer une photo de la bibliothèque
        document.getElementById('noelPickGallery').onclick = () => galleryInput.click();
        galleryInput.onchange = (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    customUploadedImage = img;
                    stopCamera();
                    renderImageWithFilter(img, maxDim, (dataUrl) => {
                        capturedDataUrl = dataUrl;
                        showPreviewImage(dataUrl);
                    });
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        };

        // Prendre la photo en direct
        document.getElementById('noelSnapBtn').onclick = () => {
            if (customUploadedImage) {
                renderImageWithFilter(customUploadedImage, maxDim, (dataUrl) => {
                    capturedDataUrl = dataUrl;
                    showPreviewImage(dataUrl);
                });
            } else if (video && video.videoWidth) {
                renderVideoWithFilter(video, maxDim, (dataUrl) => {
                    capturedDataUrl = dataUrl;
                    stopCamera();
                    showPreviewImage(dataUrl);
                });
            } else {
                galleryInput.click();
            }
        };

        // Reprendre la photo
        document.getElementById('noelRetakeBtn').onclick = () => {
            capturedDataUrl = null;
            customUploadedImage = null;
            document.getElementById('noelControlsLive').style.display = 'flex';
            document.getElementById('noelControlsPreview').style.display = 'none';

            // Réafficher la vidéo
            const vp = document.getElementById('noelCamViewport');
            const previewCanvas = vp.querySelector('canvas.snap-preview');
            if (previewCanvas) previewCanvas.remove();
            video.style.display = 'block';
            overlay.style.display = 'block';
            document.getElementById('noelFlipBtn').style.display = 'flex';

            startCamera(video);
        };

        // Valider la photo
        document.getElementById('noelConfirmBtn').onclick = () => {
            if (capturedDataUrl) {
                onCapture(capturedDataUrl);
                close();
            }
        };

        // Démarrer la caméra
        startCamera(video);
    }

    function updateFilterOverlay() {
        const overlay = document.getElementById('noelFilterOverlay');
        if (!overlay) return;
        const filter = FILTERS.find(f => f.id === selectedFilterId);
        if (filter && filter.svg) {
            overlay.innerHTML = filter.svg;
        } else {
            overlay.innerHTML = '';
        }
    }

    function showPreviewImage(dataUrl) {
        const vp = document.getElementById('noelCamViewport');
        const video = document.getElementById('noelCamVideo');
        const overlay = document.getElementById('noelFilterOverlay');

        video.style.display = 'none';
        overlay.style.display = 'none';
        document.getElementById('noelFlipBtn').style.display = 'none';

        let previewCanvas = vp.querySelector('canvas.snap-preview');
        if (!previewCanvas) {
            previewCanvas = document.createElement('canvas');
            previewCanvas.className = 'snap-preview';
            vp.appendChild(previewCanvas);
        }

        const img = new Image();
        img.onload = () => {
            previewCanvas.width = img.width;
            previewCanvas.height = img.height;
            const ctx = previewCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;

        document.getElementById('noelControlsLive').style.display = 'none';
        document.getElementById('noelControlsPreview').style.display = 'flex';
    }

    function startCamera(video) {
        stopCamera();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log("getUserMedia non supporté sur ce navigateur");
            return;
        }

        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 720 },
                height: { ideal: 720 }
            },
            audio: false
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                currentStream = stream;
                video.srcObject = stream;
            })
            .catch(err => {
                console.warn("Impossible d'accéder à la caméra :", err);
                // Fallback gracieux si caméra refusée
                const overlay = document.getElementById('noelFilterOverlay');
                if (overlay) {
                    overlay.innerHTML = `<div style="padding: 20px; text-align: center; color: white; background: rgba(0,0,0,0.7); border-radius: 15px; margin: 20px;">
                        📷 Caméra non disponible.<br>Clique sur <b>📁 Bibliothèque</b> pour choisir une photo !
                    </div>`;
                }
            });
    }

    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
    }

    function close() {
        stopCamera();
        const modal = document.getElementById('noelCameraModal');
        if (modal) modal.remove();
        capturedDataUrl = null;
        customUploadedImage = null;
    }

    /**
     * Dessine la frame vidéo + le filtre sur canvas carré
     */
    function renderVideoWithFilter(video, maxDim, callback) {
        const canvas = document.createElement('canvas');
        const vW = video.videoWidth || 640;
        const vH = video.videoHeight || 640;
        const size = Math.min(vW, vH);

        const outSize = Math.min(size, maxDim);
        canvas.width = outSize;
        canvas.height = outSize;
        const ctx = canvas.getContext('2d');

        // Découpe carrée centrée
        const sx = (vW - size) / 2;
        const sy = (vH - size) / 2;

        // Si caméra selfie, miroir horizontal naturel
        if (currentFacingMode === 'user') {
            ctx.translate(outSize, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, sx, sy, size, size, 0, 0, outSize, outSize);

        if (currentFacingMode === 'user') {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        applyFilterToCanvas(ctx, outSize, outSize, () => {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            callback(dataUrl);
        });
    }

    /**
     * Dessine une image importée + le filtre sur canvas carré
     */
    function renderImageWithFilter(img, maxDim, callback) {
        const canvas = document.createElement('canvas');
        const iW = img.width;
        const iH = img.height;
        const size = Math.min(iW, iH);

        const outSize = Math.min(size, maxDim);
        canvas.width = outSize;
        canvas.height = outSize;
        const ctx = canvas.getContext('2d');

        // Découpe carrée centrée
        const sx = (iW - size) / 2;
        const sy = (iH - size) / 2;

        ctx.drawImage(img, sx, sy, size, size, 0, 0, outSize, outSize);

        applyFilterToCanvas(ctx, outSize, outSize, () => {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            callback(dataUrl);
        });
    }

    /**
     * Applique l'overlay SVG du filtre sur le canvas
     */
    function applyFilterToCanvas(ctx, w, h, done) {
        const filter = FILTERS.find(f => f.id === selectedFilterId);
        if (!filter || !filter.svg) {
            done();
            return;
        }

        const filterImg = new Image();
        const svgBlob = new Blob([filter.svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        filterImg.onload = () => {
            ctx.drawImage(filterImg, 0, 0, w, h);
            URL.revokeObjectURL(url);
            done();
        };
        filterImg.onerror = () => {
            URL.revokeObjectURL(url);
            done();
        };
        filterImg.src = url;
    }

    /**
     * Ouvre une lightbox pour agrandir une image du chat
     */
    function openLightbox(src) {
        const existing = document.querySelector('.noel-lightbox');
        if (existing) existing.remove();

        const box = document.createElement('div');
        box.className = 'noel-lightbox';
        box.innerHTML = `<img src="${src}" alt="Zoom photo">`;
        box.onclick = () => box.remove();
        document.body.appendChild(box);
    }

    // Export global
    window.ChristmasCamera = {
        open: open,
        close: close,
        openLightbox: openLightbox
    };

})(window);
