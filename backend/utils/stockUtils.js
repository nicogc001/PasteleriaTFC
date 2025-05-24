const { Productos, HistorialStock } = require('../models');

/**
 * Actualiza el stock de un producto y guarda un registro en HistorialStock si hay un cambio.
 * @param {number} productoId - ID del producto a actualizar.
 * @param {number} nuevoStock - Nuevo valor del stock.
 */
async function actualizarStockConHistorial(productoId, nuevoStock) {
  try {
    const producto = await Productos.findByPk(productoId);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    const stockAnterior = producto.stock;
    const diferencia = nuevoStock - stockAnterior;

    // Solo registrar si hay cambio de stock
    if (diferencia !== 0) {
      await producto.update({ stock: nuevoStock });

      await HistorialStock.create({
        productoId: producto.id,
        stockAnterior,
        stockNuevo: nuevoStock,
        diferencia,
        // La fecha se guarda automáticamente gracias al defaultValue en el modelo
      });

      console.log('Stock actualizado y registrado en historial');
    } else {
      console.log('El stock no cambió, no se registró historial');
    }
  } catch (error) {
    console.error('Error al actualizar stock con historial:', error.message);
    throw error;
  }
}

module.exports = {
  actualizarStockConHistorial
};
