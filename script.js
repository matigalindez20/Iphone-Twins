// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DEL ACORDEÓN ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Cierra todos los items excepto el actual
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this) {
                    otherHeader.parentElement.classList.remove('active');
                }
            });

            // Abre o cierra el item actual
            this.parentElement.classList.toggle('active');
        });
    });


    // --- LÓGICA PARA MOSTRAR PRODUCTOS ---
    const subModelLinks = document.querySelectorAll('.sub-model-link');
    const productGrids = document.querySelectorAll('.product-grid');

    subModelLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Evita que la página salte al hacer clic

            // 1. Quitar la clase 'active' de todos los enlaces
            subModelLinks.forEach(otherLink => otherLink.classList.remove('active'));
            // 2. Añadir la clase 'active' al enlace clickeado
            this.classList.add('active');

            // 3. Ocultar todos los grids de productos
            productGrids.forEach(grid => grid.classList.remove('active'));

            // 4. Mostrar el grid de producto correspondiente
            const targetId = this.getAttribute('data-target');
            const targetGrid = document.getElementById(targetId);
            if (targetGrid) {
                targetGrid.classList.add('active');
            }
        });
    });
});