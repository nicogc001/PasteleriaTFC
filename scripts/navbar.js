document.addEventListener("DOMContentLoaded", () => {
    const userToken = localStorage.getItem("token");
    const userRole = localStorage.getItem("rol");

    const profileLink = document.querySelector(".dropdown-menu .dropdown-item:nth-child(1)");
    const logoutLink = document.querySelector(".dropdown-menu .dropdown-item:nth-child(3)");

    if (userToken) {
        // Redirigir a la página correspondiente según el rol
        if (userRole === "admin") {
            profileLink.href = "admin_dashboard.html";
        } else if (userRole === "empleado") {
            profileLink.href = "empleado_dashboard.html";
        } else {
            profileLink.href = "perfil.html";
        }
        
        // Habilitar el botón de logout
        logoutLink.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("rol");
            window.location.href = "login.html";
        });
    } else {
        // Si no hay sesión, redirigir a login
        profileLink.href = "login.html";
        logoutLink.style.display = "none"; // Oculta Logout si no hay sesión activa
    }
});