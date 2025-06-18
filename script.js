document.addEventListener('DOMContentLoaded', function() {
    console.log("Scipt iniciado. DOM cargado.");

    // ---- LÓGICA DEL ACORDEÓN ----
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const currentItem = this.parentElement;
            const isActive = currentItem.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(item => item.classList.remove('active'));
            if (!isActive) currentItem.classList.add('active');
        });
    });

    // ---- LÓGICA DE NAVEGACIÓN DE PRODUCTOS ----
    const subModelLinks = document.querySelectorAll('.sub-model-link');
    const productGrids = document.querySelectorAll('.product-grid');
    subModelLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            subModelLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            productGrids.forEach(grid => grid.classList.remove('active'));
            const targetGrid = document.getElementById(this.dataset.target);
            if (targetGrid) targetGrid.classList.add('active');
        });
    });

    // ---- LÓGICA DEL MODAL ----
    const modal = document.getElementById('product-modal');
    if (!modal) {
        console.error("Error Crítico: El elemento del modal con id 'product-modal' no se encontró.");
        return;
    }

    // Elementos del Modal
    const detailButtons = document.querySelectorAll('.product-card .buy-button');
    const closeModalButton = modal.querySelector('.modal-close');
    const modalTitle = modal.querySelector('#modal-title');
    const modalPrice = modal.querySelector('#modal-price');
    const staticSpecsContainer = modal.querySelector('#modal-static-specs');
    const batterySelect = modal.querySelector('#modal-battery-select');
    
    // Elementos del Carrusel
    const track = modal.querySelector('.carousel-track');
    const nav = modal.querySelector('.carousel-nav');
    const nextButton = modal.querySelector('.carousel-button--right');
    const prevButton = modal.querySelector('.carousel-button--left');

    if (!track || !nav || !nextButton || !prevButton || !batterySelect) {
        console.error("Error Crítico: Faltan elementos esenciales dentro del modal (carrusel o select de batería). Revisa el HTML del modal.");
        return;
    }

    // --- EVENTO PRINCIPAL AL HACER CLIC EN "VER DETALLES" ---
    detailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.product-card');

            // 1. Poblar título, specs, y opciones de batería
            modalTitle.innerText = card.dataset.title;
            staticSpecsContainer.innerHTML = '';
            try {
                const staticSpecs = JSON.parse(card.dataset.staticSpecs);
                for (const key in staticSpecs) {
                    const specElement = document.createElement('div');
                    specElement.className = 'spec-item';
                    specElement.innerHTML = `<span class="spec-label">${key}:</span> <span>${staticSpecs[key]}</span>`;
                    staticSpecsContainer.appendChild(specElement);
                }
            } catch(e) { console.error("Error al parsear data-static-specs:", e); }
            
            try {
                const options = JSON.parse(card.dataset.options);
                batterySelect.innerHTML = '';
                options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.price;
                    optionElement.textContent = option.battery;
                    batterySelect.appendChild(optionElement);
                });
                if (options.length > 0) modalPrice.innerText = options[0].price;
            } catch(e) { console.error("Error al parsear data-options:", e); }
            
            // 2. CONSTRUIR EL CARRUSEL
            track.innerHTML = '';
            nav.innerHTML = '';
            const imageUrls = card.dataset.images.split(',');
            imageUrls.forEach((url, index) => {
                const slide = document.createElement('li');
                slide.className = 'carousel-slide';
                slide.innerHTML = `<img src="${url.trim()}" alt="Imagen ${index + 1}" onerror="this.style.display='none'">`;
                track.appendChild(slide);
                
                const dot = document.createElement('button');
                dot.className = 'carousel-indicator';
                nav.appendChild(dot);
            });
            
            // 3. Posicionar el carrusel DESPUÉS de que el modal sea visible
            setTimeout(() => {
                const slides = Array.from(track.children);
                if (slides.length > 0) {
                    const slideWidth = slides[0].getBoundingClientRect().width;
                    slides.forEach((slide, index) => {
                        slide.style.left = slideWidth * index + 'px';
                    });
                    slides[0].classList.add('current-slide');
                    const dots = Array.from(nav.children);
                    if (dots.length > 0) dots[0].classList.add('current-slide');
                }
            }, 50);

            // 4. Mostrar el modal
            modal.classList.add('active');
        });
    });

    // --- EVENTOS DE INTERACCIÓN DEL MODAL ---
    batterySelect.addEventListener('change', function() { modalPrice.innerText = this.value; });

    const moveToSlide = (currentSlide, targetSlide) => {
        if (!targetSlide || !currentSlide) return;
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    };

    const updateDots = (currentDot, targetDot) => {
        if (!targetDot || !currentDot) return;
        currentDot.classList.remove('current-slide');
        targetDot.classList.add('current-slide');
    };
    
    nextButton.addEventListener('click', () => {
        const currentSlide = track.querySelector('.current-slide');
        const nextSlide = currentSlide ? currentSlide.nextElementSibling : null;
        if (nextSlide) {
            const currentDot = nav.querySelector('.current-slide');
            const nextDot = currentDot ? currentDot.nextElementSibling : null;
            moveToSlide(currentSlide, nextSlide);
            updateDots(currentDot, nextDot);
        }
    });

    prevButton.addEventListener('click', () => {
        const currentSlide = track.querySelector('.current-slide');
        const prevSlide = currentSlide ? currentSlide.previousElementSibling : null;
        if (prevSlide) {
            const currentDot = nav.querySelector('.current-slide');
            const prevDot = currentDot ? currentDot.previousElementSibling : null;
            moveToSlide(currentSlide, prevSlide);
            updateDots(currentDot, prevDot);
        }
    });
    
    nav.addEventListener('click', e => {
        const targetDot = e.target.closest('button.carousel-indicator');
        if (!targetDot) return;
        const currentSlide = track.querySelector('.current-slide');
        const currentDot = nav.querySelector('.current-slide');
        const dots = Array.from(nav.children);
        const slides = Array.from(track.children);
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        const targetSlide = slides[targetIndex];
        moveToSlide(currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
    });

    closeModalButton.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
});



