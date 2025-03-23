const bcrypt = require('bcrypt');
const { db, Usuario, Productos } = require('./models');

async function seed() {
  try {
    await db.authenticate();
    console.log('📦 Base de datos conectada');

    await db.sync({ force: true }); // ⚠️ Borra y recrea todas las tablas

    // ✅ Crear usuario administrador con contraseña hasheada
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Usuario.create({
      nombre: 'Admin Principal',
      email: 'admin@caballogoloso.com',
      password: hashedPassword,
      rol: 'admin'
    });
    console.log('✅ Usuario administrador creado');

    // ✅ Insertar tartas
    await Productos.bulkCreate([
      {
        nombre: "Tarta de Fresas",
        descripcion: "Tarta artesanal con fresas naturales.",
        precio: 12.50,
        stock: 15,
        imagen: "https://images.unsplash.com/photo-1589712235271-410724d273b8?auto=format&fit=crop&w=600&q=80",
        categoria: "tartas"
      },
      {
        nombre: "Tarta de Chocolate",
        descripcion: "Tarta intensa con triple capa de chocolate.",
        precio: 14.00,
        stock: 10,
        imagen: "https://images.unsplash.com/photo-1599785209792-d4b54da2d65e?auto=format&fit=crop&w=600&q=80",
        categoria: "tartas"
      },
      {
        nombre: "Cheesecake de Mango",
        descripcion: "Suave y cremosa, con cobertura de mango natural.",
        precio: 13.00,
        stock: 12,
        imagen: "https://images.unsplash.com/photo-1618219547886-d1e61b2d1b41?auto=format&fit=crop&w=600&q=80",
        categoria: "tartas"
      },
      {
        nombre: "Tarta Red Velvet",
        descripcion: "Esponjosa y vibrante con crema de queso.",
        precio: 13.50,
        stock: 9,
        imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
        categoria: "tartas"
      },
      {
        nombre: "Tarta de Limón",
        descripcion: "Con base crujiente y crema ácida de limón.",
        precio: 12.00,
        stock: 10,
        imagen: "https://images.unsplash.com/photo-1613145998971-1f8d1e3f2020?auto=format&fit=crop&w=600&q=80",
        categoria: "tartas"
      },
      {
        nombre: "Tarta Selva Negra",
        descripcion: "Clásica con chocolate y cerezas.",
        precio: 14.50,
        stock: 7,
        imagen: "https://images.unsplash.com/photo-1630684292224-7c9a91527056?auto=format&fit=crop&w=600&q=80",
        categoria: "tartas"
      }
    ]);
    console.log('✅ Tartas insertadas');

  } catch (err) {
    console.error('❌ Error en el seed:', err);
  } finally {
    await db.close();
    console.log('🔒 Conexión cerrada');
  }
}

seed();
