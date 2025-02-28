document.addEventListener("DOMContentLoaded", function () {
    // Cargar la barra de navegación
    fetch('components/navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar navbar: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
        })
        .catch(error => console.error(error));

    // Cargar el pie de página
    fetch('components/footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar footer: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error(error));
});
