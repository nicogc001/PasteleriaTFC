const { db, Productos } = require('./models');

const productos = [
  {
    nombre: 'Mini Croissant',
    descripcion: 'Delicioso croissant recién horneado.',
    precio: 1.20,
    stock: 100,
    imagen: 'https://media.istockphoto.com/id/869469118/photo/two-fresh-croissants.jpg'
  },
  {
    nombre: 'Croissant de Chocolate',
    descripcion: 'Croissant con cobertura de chocolate.',
    precio: 1.70,
    stock: 80,
    imagen: 'https://piccolinoscoffee.com/wp-content/uploads/2023/12/piccolino-mixto.jpg'
  },
  {
    nombre: 'Palmerita Chocolate',
    descripcion: 'Palmerita con cobertura de chocolate.',
    precio: 1.50,
    stock: 90,
    imagen: 'https://www.bopan.cat/1948-home_default/palmera-de-chocolate-50g.jpg'
  }
];

const seed = async () => {
  try {
    await db.sync({ force: false });
    console.log('📦 Base de datos conectada');

    await Productos.bulkCreate(productos);
    console.log('✅ Productos insertados correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en el seed:', err);
    process.exit(1);
  }
};

seed();
