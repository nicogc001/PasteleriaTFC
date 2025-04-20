const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { crearSolicitud, obtenerSolicitudes } = require('../models/solicitudEmpleoModel');

// Configuración multer para solo aceptar PDF
const storage = multer.diskStorage({
  destination: '/tmp', // En Render, solo se puede escribir en /tmp
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

// Ruta POST - guardar solicitud de empleo
router.post('/', upload.single('cv'), async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;
    const cv_url = req.file ? `/cv/${req.file.filename}` : null;

    const nuevaSolicitud = await crearSolicitud({ nombre, email, telefono, mensaje, cv_url });
    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error(error);
    if (error.message.includes('PDF')) {
      return res.status(400).json({ error: 'Solo se permiten archivos PDF' });
    }
    res.status(500).json({ error: 'Error al guardar la solicitud' });
  }
});

// Ruta GET - listar todas las solicitudes (para admin)
router.get('/', async (req, res) => {
  try {
    const solicitudes = await obtenerSolicitudes();
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
});

module.exports = router;
