// ============================================================
// #0001: THE ARCHITECT — MAIN APPLICATION
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // STATE
    // ============================================================
    let currentPage = 1;
    let totalPages = 12;
    let currentLanguage = 'en'; // 'en' or 'hi'
    let zoomLevel = 100;
    let isFullscreen = false;
    let isAutoScroll = false;
    let autoScrollInterval = null;
    let isInfoModalOpen = false;

    // ============================================================
    // DOM REFERENCES
    // ============================================================
    const container = document.getElementById('comicContainer');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const currentDisplay = document.getElementById('currentPageDisplay');
    const totalDisplay = document.getElementById('totalPagesDisplay');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomLevelDisplay = document.getElementById('zoomLevel');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const langToggle = document.getElementById('langToggle');
    const langLabel = document.getElementById('langLabel');
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeInfoModal = document.getElementById('closeInfoModal');
    const viewModeBtn = document.getElementById('viewModeBtn');
    const autoScrollBtn = document.getElementById('autoScrollBtn');
    const issueTitle = document.getElementById('issueTitle');

    // Modal elements
    const modalTitle = document.getElementById('modalTitle');
    const modalSeries = document.getElementById('modalSeries');
    const modalWriter = document.getElementById('modalWriter');
    const modalArtist = document.getElementById('modalArtist');
    const modalRelease = document.getElementById('modalRelease');
    const modalPages = document.getElementById('modalPages');
    const modalSynopsis = document.getElementById('modalSynopsis');

    // ============================================================
    // DATA LOADER
    // ============================================================
    function getComicData() {
        return currentLanguage === 'en' ? COMIC_DATA_EN : COMIC_DATA_HI;
    }

    // ============================================================
    // RENDER PAGES
    // ============================================================
    function renderPages() {
        const data = getComicData();
        totalPages = data.totalPages;
        totalDisplay.textContent = totalPages;

        // Clear container
        container.innerHTML = '';

        // Create page elements
        data.pages.forEach((pageData, index) => {
            const pageNum = index + 1;
            const pageDiv = document.createElement('div');
            pageDiv.className = 'comic-page';
            if (pageNum === currentPage) {
                pageDiv.classList.add('active');
            }
            pageDiv.dataset.page = pageNum;

            // Page wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'page-wrapper';

            // Page Header
            const header = document.createElement('div');
            header.className = 'page-header';
            header.innerHTML = `
                <span class="page-number-display">PAGE ${pageNum}</span>
                <span class="page-title-display">${pageData.title || ''}</span>
            `;
            wrapper.appendChild(header);

            // Panels
            pageData.panels.forEach((panel, panelIndex) => {
                const panelDiv = document.createElement('div');
                panelDiv.className = 'panel';
                
                const speakerSpan = document.createElement('div');
                speakerSpan.className = 'panel-speaker';
                speakerSpan.textContent = panel.speaker || 'Narrator';
                
                const textSpan = document.createElement('div');
                textSpan.className = 'panel-text';
                // Highlight any text with **
                let text = panel.text || '';
                text = text.replace(/\*\*(.*?)\*\*/g, '<span class="highlight-text">$1</span>');
                textSpan.innerHTML = text;
                
                panelDiv.appendChild(speakerSpan);
                panelDiv.appendChild(textSpan);
                wrapper.appendChild(panelDiv);
            });

            // Page number
            const pageNumSpan = document.createElement('div');
            pageNumSpan.className = 'page-number';
            pageNumSpan.textContent = pageNum;
            wrapper.appendChild(pageNumSpan);

            pageDiv.appendChild(wrapper);
            container.appendChild(pageDiv);
        });

        updatePageDisplay();
        updateTitle();
        updateModalInfo();
    }

    // ============================================================
    // NAVIGATION
    // ============================================================
    function goToPage(pageNum) {
        const data = getComicData();
        if (pageNum < 1 || pageNum > data.totalPages) return;
        if (pageNum === currentPage) return;

        const pages = container.querySelectorAll('.comic-page');
        const oldPage = container.querySelector('.comic-page.active');
        const newPage = container.querySelector(`.comic-page[data-page="${pageNum}"]`);

        if (!newPage) return;

        // Animate exit
        if (oldPage) {
            oldPage.classList.remove('active');
            oldPage.classList.add('exit');
            setTimeout(() => {
                oldPage.classList.remove('exit');
            }, 500);
        }

        // Animate enter
        newPage.classList.add('active');
        currentPage = pageNum;
        updatePageDisplay();
    }

    function nextPage() {
        const data = getComicData();
        if (currentPage < data.totalPages) {
            goToPage(currentPage + 1);
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    }

    function updatePageDisplay() {
        const data = getComicData();
        currentDisplay.textContent = currentPage;
        totalDisplay.textContent = data.totalPages;
    }

    function updateTitle() {
        const data = getComicData();
        const lang = currentLanguage === 'en' ? 'EN' : 'हिंदी';
        issueTitle.innerHTML = `${data.issue}: <span class="highlight">${data.title}</span> <span style="font-size:12px;color:var(--text-muted);font-family:'Orbitron',monospace;">[${lang}]</span>`;
    }

    // ============================================================
    // ZOOM
    // ============================================================
    function zoomIn() {
        if (zoomLevel < 200) {
            zoomLevel += 10;
            applyZoom();
        }
    }

    function zoomOut() {
        if (zoomLevel > 50) {
            zoomLevel -= 10;
            applyZoom();
        }
    }

    function applyZoom() {
        const wrapper = container.querySelector('.comic-page.active .page-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${zoomLevel / 100})`;
            wrapper.style.transformOrigin = 'center center';
        }
        zoomLevelDisplay.textContent = zoomLevel + '%';
    }

    // ============================================================
    // FULLSCREEN
    // ============================================================
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported');
            });
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    }

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });

    // ============================================================
    // LANGUAGE TOGGLE
    // ============================================================
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
        langLabel.textContent = currentLanguage.toUpperCase();
        
        // Store current page
        const currentPageNum = currentPage;
        
        // Re-render
        renderPages();
        
        // Go to current page
        setTimeout(() => {
            goToPage(currentPageNum);
        }, 50);
    }

    // ============================================================
    // MODAL
    // ============================================================
    function updateModalInfo() {
        const data = getComicData();
        modalTitle.textContent = `${data.issue}: ${data.title}`;
        modalSeries.textContent = data.series;
        modalWriter.textContent = data.writer;
        modalArtist.textContent = data.artist;
        modalRelease.textContent = data.release;
        modalPages.textContent = data.totalPages;
    }

    function openModal() {
        isInfoModalOpen = true;
        infoModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        isInfoModalOpen = false;
        infoModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ============================================================
    // AUTO SCROLL
    // ============================================================
    function toggleAutoScroll() {
        isAutoScroll = !isAutoScroll;
        if (isAutoScroll) {
            autoScrollBtn.classList.add('active');
            autoScrollBtn.innerHTML = '<i class="fas fa-pause"></i><span class="tool-label">Stop</span>';
            startAutoScroll();
        } else {
            autoScrollBtn.classList.remove('active');
            autoScrollBtn.innerHTML = '<i class="fas fa-play"></i><span class="tool-label">Auto</span>';
            stopAutoScroll();
        }
    }

    function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            const data = getComicData();
            if (currentPage < data.totalPages) {
                nextPage();
            } else {
                // Loop back to start
                goToPage(1);
            }
        }, 4000);
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    // ============================================================
    // KEYBOARD SHORTCUTS
    // ============================================================
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextPage();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevPage();
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
            case 'Escape':
                if (isInfoModalOpen) closeModal();
                break;
            case 'l':
            case 'L':
                toggleLanguage();
                break;
            case 'z':
            case 'Z':
                zoomIn();
                break;
        }
    });

    // ============================================================
    // KEYBOARD NAVIGATION FOR MODAL
    // ============================================================
    infoModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // ============================================================
    // TOUCH SUPPORT
    // ============================================================
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                prevPage();
            } else {
                nextPage();
            }
        }
    });

    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    prevBtn.addEventListener('click', prevPage);
    nextBtn.addEventListener('click', nextPage);
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    langToggle.addEventListener('click', toggleLanguage);
    infoBtn.addEventListener('click', openModal);
    closeInfoModal.addEventListener('click', closeModal);
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) closeModal();
    });
    autoScrollBtn.addEventListener('click', toggleAutoScroll);

    // View Mode toggle (Single/Double page - simplified)
    viewModeBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        const icon = this.querySelector('i');
        const label = this.querySelector('.tool-label');
        if (this.classList.contains('active')) {
            icon.className = 'fas fa-columns';
            label.textContent = 'Single';
        } else {
            icon.className = 'fas fa-book-open';
            label.textContent = 'Double';
        }
    });

    // ============================================================
    // INITIALIZE
    // ============================================================
    renderPages();
    updatePageDisplay();
    updateTitle();
    updateModalInfo();

    console.log('📖 #0001: The Architect — Comic Reader Loaded');
    console.log(`📄 Total Pages: ${totalPages}`);
    console.log(`🌐 Language: ${currentLanguage.toUpperCase()}`);
    console.log('⌨️  Shortcuts: Arrow Keys (Nav), F (Fullscreen), L (Language), Z (Zoom)');

})();