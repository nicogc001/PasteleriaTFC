const { db, Productos } = require('./models'); // Asegúrate de que 'Productos' existe en index.js

async function seed() {
    try {
        await db.authenticate();
        console.log('📦 Base de datos conectada');

        await db.sync({ force: true }); // Elimina y recrea las tablas

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
            }
        ]);

        console.log('✅ Datos insertados correctamente');
    } catch (err) {
        console.error('❌ Error en el seed:', err);
    } finally {
        await db.close();
    }
}

seed();
