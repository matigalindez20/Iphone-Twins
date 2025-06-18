document.addEventListener('DOMContentLoaded', function() {
    // --- 1. CONFIGURACIÓN DE FIREBASE ---
    const firebaseConfig = {
    apiKey: "AIzaSyC2ExfcMoNalNb2QYgf18shpXlnVZ5xca8",
    authDomain: "iphonetwins-6de4e.firebaseapp.com",
    projectId: "iphonetwins-6de4e",
    storageBucket: "iphonetwins-6de4e.firebasestorage.app",
    messagingSenderId: "747124126962",
    appId: "1:747124126962:web:7cc9d0f551c59f06bc8c6b",
    measurementId: "G-6F51332BQK"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // --- 2. REFERENCIAS A ELEMENTOS DEL DOM ---
    const productGrid = document.getElementById('product-grid-container');
    const modal = document.getElementById('product-modal');
    // ... (El resto de los elementos del modal se obtendrán cuando se necesiten)

    // --- 3. FUNCIÓN PARA CARGAR PRODUCTOS ---
    async function loadProducts(collectionName) {
        if (!productGrid) return;
        productGrid.innerHTML = '<p style="color: white; text-align: center; width: 100%;">Cargando...</p>';

        try {
            const querySnapshot = await db.collection(collectionName).get();
            productGrid.innerHTML = ''; // Limpiar

            if (querySnapshot.empty) {
                productGrid.innerHTML = '<p style="color: white;">No hay productos disponibles.</p>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const productData = doc.data();
                
                const staticSpecsString = JSON.stringify(productData.staticSpecs || {});
                const optionsString = JSON.stringify(productData.options || []);
                const imagesString = (productData.images || []).join(',');

                const productCardHTML = `
                    <div class="product-card" 
                        data-images='${imagesString}'                      
                        data-title='${productData.title || ""}'
                        data-static-specs='${staticSpecsString}'
                        data-options='${optionsString}'>
                        <img src="${(productData.images && productData.images[0]) || ''}" alt="${productData.title || ''}">
                        <h3>${productData.title || "Sin Título"}</h3>
                        <p class="price">${productData.pricePreview || ''}</p>
                        <button class="buy-button">Ver Detalles</button>
                    </div>
                `;
                productGrid.innerHTML += productCardHTML;
            });
        } catch (error) {
            console.error("Error al cargar productos:", error);
            productGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
        }
    }

    // --- 4. DELEGACIÓN DE EVENTOS PARA ABRIR EL MODAL ---
    // Escuchamos clics en el CONTENEDOR de las tarjetas.
    productGrid.addEventListener('click', function(event) {
        // Verificamos si el elemento clickeado es (o está dentro de) un botón de "Ver Detalles".
        const button = event.target.closest('.buy-button');

        // Si no se hizo clic en un botón, no hacemos nada.
        if (!button) {
            return;
        }

        const card = button.closest('.product-card');
        if (!card) return;
        
        // --- Si llegamos aquí, significa que se hizo clic en un botón. ---
        // AHORA SÍ, abrimos y poblamos el modal.
        
        // Obtenemos los elementos del modal
        const modalTitle = modal.querySelector('#modal-title');
        const modalPrice = modal.querySelector('#modal-price');
        const staticSpecsContainer = modal.querySelector('#modal-static-specs');
        const batterySelect = modal.querySelector('#modal-battery-select');
        const track = modal.querySelector('.carousel-track');
        const nav = modal.querySelector('.carousel-nav');

        // Poblar contenido (título, specs, opciones)
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
        } catch(e) {}
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
        } catch(e) {}
        
        // Construir el carrusel
        track.innerHTML = '';
        nav.innerHTML = '';
        const imageUrls = card.dataset.images.split(',');
        imageUrls.forEach((url, index) => {
            const slide = document.createElement('li');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="${url.trim()}" alt="Imagen ${index + 1}">`;
            track.appendChild(slide);
            const dot = document.createElement('button');
            dot.className = 'carousel-indicator';
            nav.appendChild(dot);
        });

        // Posicionar el carrusel (con la demora de seguridad)
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

        // Mostrar el modal
        modal.classList.add('active');
    });

    // --- 5. LISTENERS DEL MODAL (Cerrar, carrusel, etc.) ---
    // Estos listeners sí pueden estar fuera porque el modal siempre existe.
    if(modal) {
        const closeModalButton = modal.querySelector('.modal-close');
        closeModalButton.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
        
        // Aquí iría el resto de la lógica del carrusel (botones next/prev, etc.)
        // y el listener para el select de la batería.
    }

    // --- 6. EJECUCIÓN INICIAL ---
    loadProducts('iphones');
});