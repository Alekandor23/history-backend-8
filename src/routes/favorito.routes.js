import { Router } from "express";
import { getLibrosFavoritosPorUsuario, agregarFavorito, quitarFavorito, getAutoresFavoritos, agregarAutorFavorito, quitarAutorFavorito } from "../controllers/favorito.controller.js";

const router = Router();

//Ruta para obtener los libros dado un usuario
router.get('/favoritos/:id_usuario', getLibrosFavoritosPorUsuario);

//Ruta para agregar libros favoritos
router.post('/usuarios/:id_usuario/favoritos/:id_libro', agregarFavorito);

//Ruta para quitar libros favoritos
router.delete('/usuarios/:id_usuario/favoritos/:id_libro', quitarFavorito);

//Ruta para obtener los autores favoritos de un usuario
router.get('/autoresFavoritos/:id_usuario', getAutoresFavoritos);

//Ruta para agregar autor favoritro
router.post('/usuarios/:id_usuario/autorFavorito/:id_autor', agregarAutorFavorito);

//Ruta para quitar autor favorito
router.delete('/usuarios/:id_usuario/autorFavorito/:id_autor', quitarAutorFavorito);

export default router;