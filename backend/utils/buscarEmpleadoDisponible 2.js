const { RegistroHorario, Usuario } = require('../models');

async function buscarEmpleadoDisponible(tienda, fecha = new Date()) {
  const dia = fecha.toISOString().split('T')[0];
  const horaActual = fecha.toTimeString().split(':').slice(0, 2).join(':'); // HH:MM

  // Buscar horarios del día en la tienda
  const registros = await RegistroHorario.findAll({
    where: { tienda, fecha: dia },
    include: [{ model: Usuario }],
  });

  // Buscar si alguien está trabajando ahora
  const empleadoActual = registros.find(r => r.entrada <= horaActual && r.salida > horaActual);

  if (empleadoActual) return empleadoActual.usuarioId;

  // Si no hay nadie ahora, buscar el que entra más pronto mañana
  const mañana = new Date(fecha);
  mañana.setDate(mañana.getDate() + 1);
  const diaMañana = mañana.toISOString().split('T')[0];

  const registrosMañana = await RegistroHorario.findAll({
    where: { tienda, fecha: diaMañana },
    include: [{ model: Usuario }],
  });

  if (registrosMañana.length > 0) {
    const primero = registrosMañana.sort((a, b) => a.entrada.localeCompare(b.entrada))[0];
    return primero.usuarioId;
  }

  return null; // Si no hay nadie asignado
}

module.exports = buscarEmpleadoDisponible;
