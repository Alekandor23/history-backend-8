import { Router } from "express";
import { synthesizeSpeech,  obtenerTimestamps} from "../controllers/audio.controller.js";

const router = Router();

//Ruta para obtener un audio dado el texto
router.post('/generar/audio', synthesizeSpeech);
router.post('/calcular/audio', obtenerTimestamps);

export default router; 