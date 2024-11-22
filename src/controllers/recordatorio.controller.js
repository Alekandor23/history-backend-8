import { PrismaClient } from "@prisma/client";
import moment from 'moment-timezone';
const prisma = new PrismaClient();
import Bull from 'bull';
import nodemailer from 'nodemailer';
import Redis from "ioredis";


// Configura el transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambia al servicio de correo que uses
  auth: {
      user: 'HistoryHouse743@gmail.com',
      pass: 'njsj pjlf plqy getu'
  }
});

// Función para enviar correo electrónico
const enviarCorreo = (email, asunto, mensaje) => {
  const mailOptions = {
    from: 'HistoryHouse743@gmail.com',
    to: email,
    subject: asunto,
    text: mensaje 
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
      console.error('Error al enviar el correo:', error);
    }else{
      console.log('Correo enviado:', info.response);
    }
  }); 
};

// Crear una cola de trabajos
const emailQueue = new Bull('emailQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Procesar los trabajos de la cola
emailQueue.process((job, done) => {
  const { email, asunto, mensaje } = job.data;
  enviarCorreo(email, asunto, mensaje);
  done();
});

export const guardarRecordatorio = async (req, res) => {
  const { id_usuario, id_libro } = req.params;
  const usuarioId = parseInt(id_usuario, 10);
  const libroId = parseInt(id_libro, 10);

  const { fecha, hora, descripcion } = req.body;

  if (isNaN(usuarioId) || isNaN(libroId)) {
    return res.status(400).json({ error: "ID de usuario o libro no válido" });
  };
  
  if (!fecha || !hora || !descripcion) {
    return res
    .status(400)
    .json({ error: "Se requiere fecha, hora y descripción" });
  };

  // Validar que la fecha y hora ingresadas sean mayores que la fecha y hora actuales
  const fechaIngresada = moment.tz(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm', 'America/La_Paz'); // Ajusta la zona horaria según sea necesario
  const fechaActual = moment.tz(new Date(), 'America/La_Paz'); // Ajusta la zona horaria según sea necesario
  
  if (fechaIngresada.isSameOrBefore(fechaActual)) {
    return res.status(400).json({ message: "La fecha y hora ingresadas deben ser mayores que la fecha y hora actuales" });
  };

  try {
    const recordatorio = await prisma.recordatorio.create({
      data: {
        usuarioId,
        libroId,
        fechaHora: fechaIngresada.toDate(),
        descripcion,
      },
    });

    const libro = await prisma.libro.findUnique({
      where: {
        id: libroId,
      },
      select: {
        titulo: true,
      },
    });

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      select: {
        correo: true, 
        nombreUsuario: true, 
      },
    });

    emailQueue.add({
      email: usuario.email,
      asunto: `History House - Recordatorio - ${libro.titulo}`,
      mensaje: `Recordatorio para ${usuario.nombreUsuario} del libro ${libro.titulo}:\n\n${descripcion}`,
    },
    {
      delay: fechaIngresada.diff(fechaActual, 'milliseconds'),
      attemps: 3, 
    }
    );
    
    res.json({ message: "Recordatorio guardado exitosamente", recordatorio });
  }catch (error) {
    console.error("Error al guardar el recordatorio:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  };
};

export const obtenerRecordatorio = async (req, res) => {
  try {
    const { id_usuario, id_libro } = req.params;
    const usuarioId = parseInt(id_usuario, 10);
    const libroId = parseInt(id_libro, 10);
    
    if (isNaN(usuarioId) || isNaN(libroId)) {
      return res.status(400).json({ error: "ID de usuario o libro no válido" });
    };
    
    const recordatorio = await prisma.recordatorio.findUnique({
      where: {
        usuarioId_libroId: { usuarioId, libroId },
      },
      select: {
        fechaHora: true,
        descripcion: true,
      },
    });
      
    // Convertir la fecha a la zona horaria de La Paz, Bolivia
    const fechaHoraLaPaz = moment.tz(recordatorio.fechaHora, 'UTC').tz('America/La_Paz');
      
    const recordatorioConZonaHoraria = {
      ...recordatorio,
      fechaHora: fechaHoraLaPaz.format('YYYY-MM-DD HH:mm:ss'),
    };
      
    res.json(recordatorioConZonaHoraria);
  } catch (error) {
    console.error("Error al obtener el recordatorio:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  };
};
  

export const borrarRecordatorio = async (req, res) => {
  try {
    const { id_usuario, id_libro } = req.params;
  
    const usuarioId = parseInt(id_usuario, 10);
    const libroId = parseInt(id_libro, 10);
  
    if (isNaN(usuarioId) || isNaN(libroId)) {
      return res.status(400).json({ error: "ID de usuario o libro no válido" });
    };
  
    const recordatorio = await prisma.recordatorio.delete({
      where: {
        usuarioId_libroId: { usuarioId, libroId },
      },
    });
  
    res.json({ message: "Recordatorio eliminado exitosamente", recordatorio });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "No se encontró un recordatorio para este usuario y libro" });
    };
  
    console.error("Error al borrar el recordatorio:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  };
};

export const modificarRecordatorio = async (req, res) => {
  // Recoger los datos de la petición
  const { id_usuario, id_libro } = req.params;
  const usuarioId = parseInt(id_usuario, 10);
  const libroId = parseInt(id_libro, 10);
  const { fecha, hora, descripcion } = req.body;

  if(isNaN(usuarioId) || isNaN(libroId)) {
    return res.status(400).json({ message: 'ID de usuario y libro son obligatorios' });
  };

  if(!fecha || !hora || !descripcion) {	
    return res.status(400).json({ message: 'Fecha, hora y descripción son obligatorios' });
  };

  // Validar que la fecha y hora ingresadas sean mayores que la fecha y hora actuales
  const fechaIngresada = moment.tz(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm', 'America/La_Paz'); // Ajusta la zona horaria según sea necesario
  const fechaActual = moment.tz(new Date(), 'America/La_Paz'); // Ajusta la zona horaria según sea necesario
    
  if (fechaIngresada.isSameOrBefore(fechaActual)) {
    return res.status(400).json({ message: "La fecha y hora ingresadas deben ser mayores que la fecha y hora actuales" });
  };

  try {
    const recordatorio = await prisma.recordatorio.update({
      where: {
        usuarioId_libroId: { usuarioId, libroId },
      },
      data: {
        fechaHora: fechaIngresada.toDate(),
        descripcion,
      },
    });
  
    res.json({ message: "Recordatorio actualizado exitosamente", recordatorio });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "No se encontró un recordatorio para este usuario y libro" });
    };
    console.error("Error al actualizar el recordatorio:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  };
};
  