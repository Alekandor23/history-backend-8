import express from "express";

import libroRoutes from '../routes/libro.routes.js';
import reseniaRoutes from '../routes/resenia.routes.js';
import usuarioRoutes from '../routes/usuario.routes.js';
import filtroRoutes from '../routes/filtro.routes.js';
import audioRoutes from '../routes/audio.routes.js';
import progresoRoutes from '../routes/progreso.routes.js';
import favoritoRoutes from '../routes/favorito.routes.js';
import recordatorioRoutes from '../routes/recordatorio.routes.js';


const router = express.Router();

router.use('/', libroRoutes);
router.use('/', reseniaRoutes);
router.use('/', usuarioRoutes);
router.use('/', filtroRoutes);
router.use('/', audioRoutes);
router.use('/', progresoRoutes);
router.use('/', favoritoRoutes);
router.use('/', recordatorioRoutes);


export default router;
