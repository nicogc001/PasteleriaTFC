// backend/routes/pedidosRoutes.js
const express = require('express');
const router = express.Router();
const { Pedidos, ProductosPedidos, Productos, Usuario } = require('../models');
const { Direccion } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const generarFacturaPDF = require('../utils/generarFacturaPDF');
const enviarFacturaEmail = require('../utils/enviarFacturaEmail');
const buscarEmpleadoDisponible = require('../utils/buscarEmpleadoDisponible');
const { Op } = require('sequelize');

// ✉️ Servicio de notificaciones por cambio de estado
const { notifyPedidoEstado } = require('../services/pedidosNotifications');

// Obtener pedidos asignados al empleado autenticado
const RegistroHorarios = require('../models/RegistroHorarios'); 

router.get('/asignados', authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== 'empleado') {
      return res.status(403).json({ error: 'Acceso denegado: solo empleados' });
    }

    const hoy = new Date();
    const dentroDe7Dias = new Date();
    dentroDe7Dias.setDate(hoy.getDate() + 7);

    const desde = hoy.toISOString().split('T')[0];
    const hasta = dentroDe7Dias.toISOString().split('T')[0];

    const horarios = await RegistroHorarios.findAll({
      where: {
        empleadoId: req.user.id,
        fecha: { [Op.between]: [desde, hasta] }
      }
    });

    const fechasTiendas = horarios.map(h => ({ fecha: h.fecha, tienda: h.tienda }));
    if (!fechasTiendas.length) return res.json([]);

    const pedidos = await Pedidos.findAll({
      where: {
        [Op.or]: fechasTiendas.map(({ fecha, tienda }) => ({
          fechaEntrega: fecha,
          tienda: tienda
        }))
      },
      include: [
        { model: ProductosPedidos, include: [Productos] },
        { model: Usuario, as: 'cliente', attributes: ['nombre', 'telefono'] }
      ],
      order: [['fechaEntrega', 'ASC']]
    });

    const resultado = pedidos.map(p => ({
      id: p.id,
      nombreCliente: p.cliente?.nombre || 'Cliente',
      telefonoCliente: p.cliente?.telefono || 'N/D',
      productos: p.ProductosPedidos.map(pp => ({
        nombre: pp.Producto?.nombre || 'Desconocido',
        cantidad: pp.cantidad,
        precio: pp.Producto?.precio || 0,
        subtotal: pp.cantidad * (pp.Producto?.precio || 0)
      })),
      estado: p.estado,
      fechaEntrega: p.fechaEntrega,
      total: p.total
    }));      

    res.json(resultado);
  } catch (err) {
    console.error('Error en /asignados:', err);
    res.status(500).json({ error: 'Error al obtener pedidos asignados por tienda y semana' });
  }
});

// Pedidos pendientes de aprobación (solo admins)
router.get('/pendientes-aprobacion', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const pedidos = await Pedidos.findAll({
      where: {
        estado: 'pendiente',
        [Op.or]: [
          { aprobadorId: req.user.id },
          { segundoAprobadorId: req.user.id }
        ]
      },
      include: [{ model: Usuario, as: 'cliente', attributes: ['nombre', 'email'] }]
    });

    res.json(pedidos);
  } catch (err) {
    console.error('Error al obtener pedidos pendientes:', err);
    res.status(500).json({ error: 'Error al obtener pedidos pendientes' });
  }
});

// Obtener pedidos del usuario autenticado (cliente o admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const esCliente = req.user.rol === 'cliente';

    const pedidos = await Pedidos.findAll({
      where: esCliente ? { usuarioId: req.user.id } : {},
      include: [
        { model: ProductosPedidos, include: [Productos] },
        ...(esCliente ? [] : [{ model: Usuario, as: 'cliente', attributes: ['id', 'nombre', 'email'] }])
      ],
      order: [['fecha', 'DESC']]
    });

    res.json(pedidos);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Vista de pedidos para el calendario del empleado (todos los pedidos)
router.get('/empleado-vista', authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== 'empleado') {
      return res.status(403).json({ error: 'Acceso denegado: solo empleados' });
    }

    const pedidos = await Pedidos.findAll({
      include: [
        { model: ProductosPedidos, include: [Productos] },
        { model: Usuario, as: 'cliente', attributes: ['nombre', 'telefono'] } 
      ],
      order: [['fechaEntrega', 'ASC']]
    });

    const resultado = pedidos.map(p => ({
      id: p.id,
      nombreCliente: p.cliente?.nombre || 'Cliente',
      telefonoCliente: p.cliente?.telefono || 'N/D', 
      productos: Array.isArray(p.ProductosPedidos)
        ? p.ProductosPedidos.map(pp => ({
            nombre: pp?.Producto?.nombre || 'Desconocido'
          }))
        : [],
      estado: p.estado || 'desconocido',
      fechaEntrega: p.fechaEntrega || null
    }));

    res.json(resultado);
  } catch (err) {
    console.error('Error en /empleado-vista:', err);
    res.status(500).json({ error: 'Error al obtener pedidos para el empleado' });
  }
});

// Crear un nuevo pedido
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, tipoEntrega, tienda, metodoPago, fechaEntrega, direccionId } = req.body;

    if (!fechaEntrega) return res.status(400).json({ error: 'Debe especificar la fecha de entrega.' });
    if (!items || items.length === 0) return res.status(400).json({ error: 'El pedido no contiene productos.' });
    if (!tipoEntrega || !['enviar', 'recoger'].includes(tipoEntrega)) return res.status(400).json({ error: 'Tipo de entrega inválido. Debe ser "enviar" o "recoger".' });
    if (tipoEntrega === 'recoger' && !tienda) return res.status(400).json({ error: 'Debes especificar la tienda para la recogida.' });

    if (tipoEntrega === 'enviar') {
      const direcciones = await Direccion.findAll({ where: { usuarioId: req.user.id } });
      if (!direcciones || direcciones.length === 0) return res.status(400).json({ error: 'No tienes direcciones guardadas para la entrega.' });
      if (!direccionId) return res.status(400).json({ error: 'Debes seleccionar una dirección para la entrega.' });
      const direccionValida = direcciones.find(d => d.id === Number(direccionId));
      if (!direccionValida) return res.status(400).json({ error: 'La dirección seleccionada no es válida.' });
    }

    const esParaHoy = new Date().toISOString().split('T')[0] === fechaEntrega;
    let total = 0;
    const productosParaActualizar = [];
    const advertencias = [];
    let aprobadorId = null;
    let segundoAprobadorId = null;

    for (const item of items) {
      const producto = await Productos.findByPk(item.productoId);
      if (!producto) return res.status(404).json({ error: `Producto con ID ${item.productoId} no encontrado` });
      if (esParaHoy && producto.stock < item.cantidad) advertencias.push(`Stock bajo de ${producto.nombre}. Solo hay ${producto.stock} unidades disponibles.`);
      if (producto.stock < item.cantidad) return res.status(400).json({ error: `No hay suficiente stock de ${producto.nombre}` });

      total += producto.precio * item.cantidad;
      if (tipoEntrega === 'recoger' && metodoPago === 'efectivo') {
        aprobadorId = await buscarEmpleadoDisponible(tienda);
        if (total > 30) {
          const admin = await Usuario.findOne({ where: { rol: 'administrador' } });
          segundoAprobadorId = admin?.id || null;
        }
      }
      productosParaActualizar.push({ producto, cantidad: item.cantidad });
    }

    const pedido = await Pedidos.create({
      usuarioId: req.user.id,
      fecha: new Date(),
      estado: 'pendiente',
      total,
      tipoEntrega,
      tienda: tipoEntrega === 'recoger' ? tienda : null,
      metodoPago,
      aprobadorId,
      segundoAprobadorId,
      fechaEntrega,
      direccionId: tipoEntrega === 'enviar' ? direccionId : null
    });

    for (const { producto, cantidad } of productosParaActualizar) {
      await ProductosPedidos.create({ pedidoId: pedido.id, productoId: producto.id, cantidad });
      producto.stock -= cantidad;
      await producto.save();
    }

    res.status(201).json({ message: 'Pedido creado exitosamente', pedidoId: pedido.id, advertencias });
  } catch (err) {
    console.error('Error creando pedido:', err);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// Aprobar pedido (empleado o administrador)
router.put('/:id/aprobar', authMiddleware, async (req, res) => {
  try {
    const pedido = await Pedidos.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    const userId = req.user.id;
    const esPrimerAprobador = pedido.aprobadorId === userId;
    const esSegundoAprobador = pedido.segundoAprobadorId === userId;
    if (!esPrimerAprobador && !esSegundoAprobador) return res.status(403).json({ error: 'No tienes permiso para aprobar este pedido' });
    if (esPrimerAprobador && !pedido.aprobadoPorEmpleado) pedido.aprobadoPorEmpleado = true;
    if (esSegundoAprobador && !pedido.aprobadoPorAdmin) pedido.aprobadoPorAdmin = true;
    if (pedido.aprobadoPorEmpleado && (pedido.segundoAprobadorId === null || pedido.aprobadoPorAdmin)) pedido.estado = 'confirmado';
    await pedido.save();
    res.json({ message: 'Pedido aprobado', pedido });
  } catch (err) {
    console.error('Error aprobando pedido:', err);
    res.status(500).json({ error: 'Error al aprobar el pedido' });
  }
});

// Cambiar estado del pedido (✉️ notifica al cliente)
router.put('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { estado: nuevoEstado, comentario } = req.body;

    const pedido = await Pedidos.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'cliente', attributes: ['id','nombre','email'] },
        { model: ProductosPedidos, include: [Productos] } // opcional, para email con detalle
      ]
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    const prevEstado = pedido.estado;
    pedido.estado = nuevoEstado;
    await pedido.save();

    // Dispara email sin bloquear la respuesta
    notifyPedidoEstado({ pedido, prevEstado, nuevoEstado, comentario })
      .catch(e => console.error('notifyPedidoEstado:', e.message));

    res.json({ message: 'Estado actualizado correctamente', pedido });
  } catch (err) {
    console.error('Error actualizando estado:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Confirmar un pedido (generar factura y enviar email)
router.put('/:id/confirmar', authMiddleware, async (req, res) => {
  try {
    const { metodoPago } = req.body;
    const pedido = await Pedidos.findOne({
      where: { id: req.params.id, usuarioId: req.user.id },
      include: [{ model: ProductosPedidos, include: [Productos] }, { model: Usuario, as: 'cliente' }]
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    pedido.estado = 'confirmado';
    pedido.metodoPago = metodoPago || 'N/A';
    await pedido.save();

    const rutaFactura = await generarFacturaPDF(pedido);
    await enviarFacturaEmail(pedido.cliente.email, rutaFactura);

    res.json({ message: 'Pedido confirmado, factura generada y enviada', factura: rutaFactura });
  } catch (err) {
    console.error('Error confirmando pedido:', err);
    res.status(500).json({ error: 'Error al confirmar pedido o enviar factura' });
  }
});

// Obtener detalle del pedido (última ruta)
router.get('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID de pedido inválido' });

  try {
    const condicion = req.user.rol === 'cliente'
      ? { id: req.params.id, usuarioId: req.user.id }
      : { id: req.params.id };

    const pedido = await Pedidos.findOne({
      where: condicion,
      include: [{ model: ProductosPedidos, include: [Productos] }]
    });

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    const productos = pedido.ProductosPedidos.map(item => ({
      nombre: item.Producto.nombre,
      cantidad: item.cantidad,
      subtotal: item.Producto.precio * item.cantidad
    }));

    res.json({
      id: pedido.id,
      fecha: pedido.fecha,
      estado: pedido.estado,
      total: pedido.total,
      tipoEntrega: pedido.tipoEntrega,
      tienda: pedido.tienda,
      productos
    });
  } catch (err) {
    console.error('Error al obtener detalle del pedido:', err);
    res.status(500).json({ error: 'Error al obtener el detalle del pedido' });
  }
});

// Marcar pedido como preparado (para empleados)
router.put('/:id/preparar', authMiddleware, async (req, res) => {
  try {
    const pedido = await Pedidos.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    if (req.user.rol !== 'empleado' || pedido.aprobadorId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para preparar este pedido' });
    }

    pedido.estado = 'entregado';
    await pedido.save();

    res.json({ message: 'Pedido marcado como entregado', pedido });
  } catch (err) {
    console.error('Error al marcar como preparado:', err);
    res.status(500).json({ error: 'Error al preparar el pedido' });
  }
});

// Obtener los pedidos del cliente autenticado (mis pedidos)
router.get('/mis-pedidos', authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== 'cliente') {
      return res.status(403).json({ error: 'Acceso denegado: solo clientes' });
    }

    const pedidos = await Pedidos.findAll({
      where: { usuarioId: req.user.id },
      include: [
        { model: ProductosPedidos, include: [Productos] }
      ],
      order: [['fecha', 'DESC']]
    });

    const resultado = pedidos.map(p => ({
      id: p.id,
      fecha: p.fecha,
      estado: p.estado,
      total: p.total,
      productos: p.ProductosPedidos.map(pp => ({
        nombre: pp.Producto?.nombre || 'Desconocido',
        cantidad: pp.cantidad,
        precio: pp.Producto?.precio || 0,
        subtotal: pp.cantidad * (pp.Producto?.precio || 0)
      }))
    }));

    res.json(resultado);
  } catch (err) {
    console.error('Error al obtener mis pedidos:', err);
    res.status(500).json({ error: 'Error al obtener tus pedidos' });
  }
});

// Obtener todos los pedidos (solo visualización)
router.get('/todos', authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== 'empleado') {
      return res.status(403).json({ error: 'Acceso denegado: solo empleados' });
    }

    const pedidos = await Pedidos.findAll({
      include: [
        { model: ProductosPedidos, include: [Productos] },
        { model: Usuario, as: 'cliente', attributes: ['nombre', 'telefono'] }
      ],
      order: [['fechaEntrega', 'ASC']]
    });

    const resultado = pedidos.map(p => {
      try {
        return {
          id: p.id,
          nombreCliente: p.cliente?.nombre || 'Cliente',
          productos: Array.isArray(p.ProductosPedidos)
            ? p.ProductosPedidos.map(pp => ({
                nombre: pp?.Producto?.nombre || 'Desconocido'
              }))
            : [],
          estado: p.estado || 'desconocido',
          fechaEntrega: p.fechaEntrega || null
        };
      } catch (err) {
        console.error(`Error al procesar pedido ID ${p.id}:`, err.message);
        return null;
      }
    }).filter(Boolean);

    res.json({ pedidos: resultado });
  } catch (err) {
    console.error('Error general al obtener pedidos:', err.message);
    res.status(500).json({ error: 'Error al obtener pedidos', detalle: err.message });
  }
});

// Crear pedido como empleado para un cliente
router.post('/crear-por-empleado', authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== 'empleado') {
      return res.status(403).json({ error: 'Solo los empleados pueden usar esta ruta' });
    }

    const { clienteId, items, tipoEntrega, tienda, fechaEntrega, notas } = req.body;

    if (!clienteId || !fechaEntrega || !items?.length) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: clienteId, fechaEntrega o productos' });
    }

    let total = 0;
    const productosParaActualizar = [];

    for (const item of items) {
      const producto = await Productos.findByPk(item.productoId);
      if (!producto) return res.status(404).json({ error: `Producto ID ${item.productoId} no encontrado` });
      if (producto.stock < item.cantidad) return res.status(400).json({ error: `Stock insuficiente para ${producto.nombre}` });

      total += producto.precio * item.cantidad;
      productosParaActualizar.push({ producto, cantidad: item.cantidad });
    }

    const pedido = await Pedidos.create({
      usuarioId: clienteId,
      fecha: new Date(),
      estado: 'pendiente',
      total,
      tipoEntrega,
      tienda: tipoEntrega === 'recoger' ? tienda : null,
      metodoPago: 'empleado',
      fechaEntrega,
      notas
    });

    for (const { producto, cantidad } of productosParaActualizar) {
      await ProductosPedidos.create({ pedidoId: pedido.id, productoId: producto.id, cantidad });
      producto.stock -= cantidad;
      await producto.save();
    }

    res.status(201).json({ message: 'Pedido creado por empleado', pedidoId: pedido.id });
  } catch (err) {
    console.error('Error en /crear-por-empleado:', err);
    res.status(500).json({ error: 'Error al crear pedido por empleado' });
  }
});

module.exports = router;
