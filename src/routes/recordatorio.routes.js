import { Router } from "express";
import { borrarRecordatorio, guardarRecordatorio, modificarRecordatorio, obtenerRecordatorio } from "../controllers/recordatorio.controller.js";

const router = Router();

//ruta para agregar recordatorio
router.post('/usuarios/:id_usuario/libros/:id_libro/recordatorio', guardarRecordatorio);

//ruta para obtener recordatorios
router.get('/usuarios/:id_usuario/libros/:id_libro/recordatorio', obtenerRecordatorio);

//ruta para borrar un recordatorio
router.delete('/usuarios/:id_usuario/libros/:id_libro/recordatorio', borrarRecordatorio);

//ruta para modificar un recordatorio
router.put('/usuarios/:id_usuario/libros/:id_libro/recordatorio', modificarRecordatorio);

export default router;