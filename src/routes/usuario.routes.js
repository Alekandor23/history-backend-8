import { Router } from "express";
import { createUsuario, logIn, passwordRequest, passwordReset, obtenerPerfilUsuario, editarPerfil, newPassword } from '../controllers/usuario.controllers.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// Ruta para crear usuario
router.post('/registrar/usuario', createUsuario);

// Ruta para iniciar sesion
router.post('/iniciarSesion', logIn);


//Ruta para obtener perfil del usuario
router.get('/usuarios/:id_usuario/obtenerPerfil', obtenerPerfilUsuario);

//Ruta para editar el perfil del usuario
router.put("/usuarios/:id_usuario/editarPerfil", upload.single("imagen"), editarPerfil);

// Ruta para solicitar la recuperación de contraseña dado el correo electrónico existente de un usuario
router.post('/recuperar/contrasenia', passwordRequest);

// Ruta para actualizar la contraseña de un usuario existente
router.put('/restablecer/contrasenia', passwordReset);

// Ruta para actualizar la contraseña de un usuario existente
router.put('/nueva/contrasenia/:id_usuario', newPassword);

export default router;
