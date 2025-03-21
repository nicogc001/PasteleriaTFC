const { db, Productos } = require('./models'); // Asegúrate que el modelo se llama 'Productos' en index.js

async function seed() {
    try {
        await db.authenticate();
        console.log('📦 Base de datos conectada');

        await db.sync({ force: true }); // opcional si quieres resetear

        await Productos.bulkCreate([
            {
                nombre: "Tarta de Fresas",
                descripcion: "Fresca y deliciosa",
                precio: 12.50,
                stock: 10,
                imagen: "https://tudominio.com/fresas.jpg",
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
