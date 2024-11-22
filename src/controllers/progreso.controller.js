import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();


export const guardarTiempo = async (req, res) => {
    try {
      const { id_usuario, id_libro } = req.params;
      const { tiempo } = req.body; //Formato "HH:MM:SS"
  
      const usuarioId = parseInt(id_usuario, 10);
      const libroId = parseInt(id_libro, 10);
  
      if (isNaN(usuarioId) || isNaN(libroId)) {
        return res.status(400).json({ error: "ID de usuario o libro no válido" });
      }
  
      if (!/^\d{2}:\d{2}:\d{2}$/.test(tiempo)) {
        return res.status(400).json({ error: "El tiempo debe estar en formato HH:MM:SS" });
      }
  
      const tiempoDate = new Date(`1970-01-01T${tiempo}Z`);
  
      const progreso = await prisma.progreso.upsert({
        where: {
          usuarioId_libroId: { usuarioId, libroId },
        },
        update: { tiempo: tiempoDate },
        create: { usuarioId, libroId, tiempo: tiempoDate },
      });
  
      res.json({ message: "Tiempo guardado exitosamente", progreso });
    } catch (error) {
      console.error("Error al guardar el tiempo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
  

export const obtenerTiempo = async (req, res) => {
  try {
      const { id_usuario, id_libro } = req.params;
  
      const usuarioId = parseInt(id_usuario, 10);
      const libroId = parseInt(id_libro, 10);
  
      if (isNaN(usuarioId) || isNaN(libroId)) {
        return res.status(400).json({ error: "ID de usuario o libro no válido" });
      }
  
      const progreso = await prisma.progreso.findUnique({
        where: {
          usuarioId_libroId: { usuarioId, libroId },
        },
        select: {
          tiempo: true,
        },
      });
  
      if (!progreso) {
        return res.status(404).json({ error: "Progreso no encontrado" });
      }
  
      const tiempo = progreso.tiempo.toISOString().substr(11, 8);
  
      res.json({ tiempo });
    } catch (error) {
      console.error("Error al obtener el tiempo:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
 

export const borrarTiempo = async (req, res) => {
    try {
      const { id_usuario, id_libro } = req.params;
  
      const usuarioId = parseInt(id_usuario, 10);
      const libroId = parseInt(id_libro, 10);
  
      if (isNaN(usuarioId) || isNaN(libroId)) {
        return res.status(400).json({ error: "ID de usuario o libro no válido" });
      }
  
      const progreso = await prisma.progreso.delete({
        where: {
          usuarioId_libroId: { usuarioId, libroId },
        },
      });
  
      res.json({ message: "Tiempo de reproducción eliminado exitosamente", progreso });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "No se encontró el progreso para el usuario y libro especificados" });
      }
  
      console.error("Error al borrar el tiempo de reproducción:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };