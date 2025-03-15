async function cargarCliente() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("No estás autenticado. Redirigiendo...");
        window.location.href = "/login.html";
        return;
    }

    try {
        const response = await fetch("https://pasteleriatfc-back.onrender.com/api/cliente/perfil", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        
        // Mostrar perfil
        document.getElementById('welcome').innerText = `Bienvenido, ${data.perfil.username}`;
        document.getElementById('username').innerText = data.perfil.username;
        document.getElementById('email').innerText = data.perfil.email;

        // Mostrar direcciones
        const contenedorDirecciones = document.getElementById('direcciones');
        contenedorDirecciones.innerHTML = "";
        data.direcciones.forEach(dir => {
            contenedorDirecciones.innerHTML += `<p>${dir.calle}, ${dir.ciudad}, ${dir.codigo_postal}, ${dir.pais}</p>`;
        });

        // Mostrar pedidos
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

        // Mostrar cupones
        const contenedorCupones = document.getElementById('cupones');
        contenedorCupones.innerHTML = "";
        data.cupones.forEach(cupon => {
            contenedorCupones.innerHTML += `<p><strong>Código:</strong> ${cupon.codigo} - <strong>Descuento:</strong> ${cupon.descuento}€ (Expira: ${cupon.fecha_expiracion})</p>`;
        });

    } catch (error) {
        console.error("❌ Error al obtener datos:", error);
    }
}

cargarCliente();
