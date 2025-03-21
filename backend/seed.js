const { db, Productos } = require('./models'); // Asegúrate que el modelo se llama 'Productos' en index.js

async function seed() {
    try {
        await db.authenticate();
        console.log('📦 Base de datos conectada');

        await db.sync({ force: true }); // opcional si quieres resetear

        await Productos.bulkCreate([
            {
                nombre: 'Tarta de queso',
                descripcion: 'Tarta suave con base de galleta',
                precio: 12.50,
                stock: 10,
                imagen: 'https://ruta-a-imagen.jpg'
            },
            {
                nombre: 'Tarta de chocolate',
                descripcion: 'Chocolate puro para los más golosos',
                precio: 14.00,
                stock: 8,
                imagen: 'https://ruta-a-imagen.jpg'
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
