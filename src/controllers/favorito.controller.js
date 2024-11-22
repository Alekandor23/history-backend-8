import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();


export const getLibrosFavoritosPorUsuario = async (req, res) => {
    try {
      const { id_usuario } = req.params;
  
      const usuarioId = parseInt(id_usuario, 10);
      if (isNaN(usuarioId)) {
        return res.status(400).json({ error: "ID de usuario no válido" });
      }
  
      const favoritos = await prisma.usuario.findUnique({
        where: {
          id: usuarioId
        },
        select: {
          favoritos: {
            select: {
              libro: {          
                select: {
                  id: true,
                  titulo: true,
                  portada: true
                }
              }
            }
          }
        }
      });
  
      if (!favoritos) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
  
      const librosFavoritos = favoritos.favoritos.map(favorito => favorito.libro);
  
      res.json(librosFavoritos);
    } catch (error) {
      console.error("Error al obtener los libros favoritos del usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
  
  
  export const agregarFavorito = async (req, res) => {
    try {
      const { id_usuario, id_libro } = req.params;
  
      const usuarioId = parseInt(id_usuario, 10);
      const libroId = parseInt(id_libro, 10);
  
      if (isNaN(usuarioId) || isNaN(libroId)) {
        return res.status(400).json({ error: "ID de usuario o libro no válido" });
      }
  
      const favoritoExistente = await prisma.favorito.findUnique({
        where: {
          usuarioId_libroId: {
            usuarioId,
            libroId
          }
        }
      });
  
      if (favoritoExistente) {
        return res.status(400).json({ error: "Este libro ya está en favoritos del usuario" });
      }
  
      const nuevoFavorito = await prisma.favorito.create({
        data: {
          usuario: { connect: { id: usuarioId } },
          libro: { connect: { id: libroId } }
        }
      });
  
      res.json({ message: "Libro añadido a favoritos exitosamente", favorito: nuevoFavorito });
    } catch (error) {
      console.error("Error al añadir el libro a favoritos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
  

  export const quitarFavorito = async (req, res) => {
    try {
      const { id_usuario, id_libro } = req.params;
  
      const usuarioId = parseInt(id_usuario, 10);
      const libroId = parseInt(id_libro, 10);
  
      if (isNaN(usuarioId) || isNaN(libroId)) {
        return res.status(400).json({ error: "ID de usuario o libro no válido" });
      }
  
      const favoritoExistente = await prisma.favorito.findUnique({
        where: {
          usuarioId_libroId: {
            usuarioId,
            libroId,
          },
        },
      });
  
      if (!favoritoExistente) {
        return res.status(404).json({ error: "El libro no está en favoritos del usuario" });
      }
  
      await prisma.favorito.delete({
        where: {
          usuarioId_libroId: {
            usuarioId,
            libroId,
          },
        },
      });
  
      res.json({ message: "Libro quitado de favoritos exitosamente" });
    } catch (error) {
      console.error("Error al quitar el libro de favoritos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
  

export const getAutoresFavoritos = async (req, res) => {
    try {
      const { id_usuario } = req.params;
  
      const usuarioId = parseInt(id_usuario, 10);
      if (isNaN(usuarioId)) {
        return res.status(400).json({ error: "ID de usuario no válido" });
      }
  
      const autoresFavoritos = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          autoresFavoritos: {
            select: {
              autor: { select: { id: true, nombre: true, fotoPerfil: true } }
            }
          }
        }
      });
  
      if (!autoresFavoritos) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
  
      const resultado = autoresFavoritos.autoresFavoritos.map(favorito => favorito.autor);
  
      res.json(resultado);
    } catch (error) {
      console.error("Error al obtener autores favoritos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
  

export const agregarAutorFavorito = async (req, res) => {
    try {
      const { id_usuario, id_autor } = req.params;
  
      const usuarioId = parseInt(id_usuario, 10);
      const autorId = parseInt(id_autor, 10);
  
      if (isNaN(usuarioId) || isNaN(autorId)) {
        return res.status(400).json({ error: "ID de usuario o autor no válido" });
      }
  
      const favoritoExistente = await prisma.favoritoAutor.findUnique({
        where: {
          usuarioId_autorId: { usuarioId, autorId }
        }
      });
  
      if (favoritoExistente) {
        return res.status(400).json({ error: "Este autor ya está en favoritos del usuario" });
      }
  
      const nuevoFavorito = await prisma.favoritoAutor.create({
        data: {
          usuario: { connect: { id: usuarioId } },
          autor: { connect: { id: autorId } }
        }
      });
  
      res.json({ message: "Autor añadido a favoritos exitosamente", favorito: nuevoFavorito });
    } catch (error) {
      console.error("Error al añadir autor a favoritos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };


  export const quitarAutorFavorito = async (req, res) => {
    try {
      const { id_usuario, id_autor } = req.params;
  
      const usuarioId = parseInt(id_usuario, 10);
      const autorId = parseInt(id_autor, 10);
  
      if (isNaN(usuarioId) || isNaN(autorId)) {
        return res.status(400).json({ error: "ID de usuario o autor no válido" });
      }
  
      const favoritoExistente = await prisma.favoritoAutor.findUnique({
        where: {
          usuarioId_autorId: { usuarioId, autorId }
        }
      });
  
      if (!favoritoExistente) {
        return res.status(404).json({ error: "El autor no está en favoritos del usuario" });
      }
  
      await prisma.favoritoAutor.delete({
        where: {
          usuarioId_autorId: { usuarioId, autorId }
        }
      });
  
      res.json({ message: "Autor quitado de favoritos exitosamente" });
    } catch (error) {
      console.error("Error al quitar autor de favoritos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };