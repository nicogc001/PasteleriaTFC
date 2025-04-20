const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const SolicitudEmpleo = require('../models/SolicitudEmpleo');
const { storage } = require('../config/cloudinary'); // <--- usamos Cloudinary

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

// POST - subir solicitud y CV a Cloudinary
router.post('/', upload.single('cv'), async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    // URL segura generada por Cloudinary
    const cv_url = req.file?.path || null;

    const nuevaSolicitud = await SolicitudEmpleo.create({
      nombre,
      email,
      telefono,
      mensaje,
      cv_url
    });

    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error(error);
    if (error.message.includes('PDF')) {
      return res.status(400).json({ error: 'Solo se permiten archivos PDF' });
    }
    res.status(500).json({ error: 'Error al guardar la solicitud' });
  }
});

// GET - listar solicitudes
router.get('/', async (req, res) => {
  try {
    const solicitudes = await SolicitudEmpleo.findAll({ order: [['fecha', 'DESC']] });
    res.json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
});

module.exports = router;
