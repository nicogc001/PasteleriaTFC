async function cargarCliente() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("No estás autenticado. Redirigiendo...");
        window.location.href = "/login.html";
        return;
    }

    // Cargar navbar en todas las páginas
    fetch("navbar.html")
        .then(response => response.text())
        .then(html => document.getElementById("navbar-container").innerHTML = html);

    try {
        const response = await fetch("https://pasteleriatfc-back.onrender.com/api/cliente/perfil", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (document.getElementById('username')) {
            document.getElementById('username').innerText = data.perfil.username;
            document.getElementById('email').innerText = data.perfil.email;
        }

        if (document.getElementById('direcciones')) {
            document.getElementById('direcciones').innerHTML = data.direcciones.map(dir =>
                `<p>${dir.calle}, ${dir.ciudad}, ${dir.codigo_postal}, ${dir.pais}</p>`
            ).join("");
        }

        if (document.getElementById('pedidos-lista')) {
            const tablaPedidos = document.getElementById('pedidos-lista');
            tablaPedidos.innerHTML = "";
            data.pedidos.forEach(pedido => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${pedido.id}</td>
                    <td>${pedido.fecha_pedido}</td>
                    <td>${pedido.estado}</td>
                    <td>${pedido.total}€</td>
                `;
                tablaPedidos.appendChild(fila);
            });
        }

        if (document.getElementById('cupones')) {
            document.getElementById('cupones').innerHTML = data.cupones.map(cupon =>
                `<p><strong>Código:</strong> ${cupon.codigo} - <strong>Descuento:</strong> ${cupon.descuento}€ (Expira: ${cupon.fecha_expiracion})</p>`
            ).join("");
        }

    } catch (error) {
        console.error("❌ Error al obtener datos:", error);
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = "/login.html";
}

cargarCliente();
