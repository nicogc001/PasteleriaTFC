document.addEventListener("DOMContentLoaded", () => {
    const userToken = localStorage.getItem("token");
    const userRole = localStorage.getItem("rol");

    const profileLink = document.querySelector(".dropdown-menu .dropdown-item:nth-child(1)");
    const settingsLink = document.querySelector(".dropdown-menu .dropdown-item:nth-child(2)");
    const logoutLink = document.querySelector(".dropdown-menu .dropdown-item:nth-child(3)");

    if (profileLink && settingsLink && logoutLink) {
        if (userToken) {
            // Redirigir a la página correspondiente según el rol
            if (userRole === "administrador") {
                profileLink.href = "admin_dashboard.html";
            } else if (userRole === "empleado") {
                profileLink.href = "empleado_dashboard.html";
            } else {
                profileLink.href = "perfil.html";
            }
            
            settingsLink.href = "settings.html"; // Redirige a una página de configuración si la hay

            // Habilitar el botón de logout
            logoutLink.addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("rol");
                window.location.href = "login.html";
            });
        } else {
            // Si no hay sesión, redirigir a login
            profileLink.href = "login.html";
            settingsLink.style.display = "none"; // Oculta configuración si no hay sesión
            logoutLink.style.display = "none"; // Oculta Logout si no hay sesión activa
        }
    }

    // Corrección en el loginForm
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('form2Example17').value;
            const password = document.getElementById('form2Example27').value;
            const API_URL = "https://pasteleria-backend.vercel.app/api/usuarios";
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('rol', data.user.rol);
                    alert('Inicio de sesión exitoso');
                    if (data.user.rol === 'admin') {
                        window.location.href = 'admin_dashboard.html';
                    } else if (data.user.rol === 'empleado') {
                        window.location.href = 'empleado_dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Error en el servidor');
            }
        });
    }
});
