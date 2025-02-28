document.addEventListener('DOMContentLoaded', () => {
    const pedido = JSON.parse(localStorage.getItem('pedido'));
    const pedidoInfo = document.getElementById('pedido-info');
    
    if (pedido && pedidoInfo) {
        pedidoInfo.innerHTML = 
            `Pedido: <strong>${pedido.tipo}</strong> para el <strong>${pedido.fecha}</strong>`;
    }
});
