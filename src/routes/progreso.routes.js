import { Router } from "express";
import { borrarTiempo, guardarTiempo, obtenerTiempo } from "../controllers/progreso.controller.js";

const router = Router();

//ruta para guardar o crear tiempo de reproduccion
router.post('/usuarios/:id_usuario/libros/:id_libro/progreso', guardarTiempo);

//ruta obtener el tiempo de progreso
router.get('/usuarios/:id_usuario/libros/:id_libro/progreso', obtenerTiempo);

//ruta para borrar el tiempo de progreso
router.delete('/usuarios/:id_usuario/libros/:id_libro/progreso', borrarTiempo);

export default router;