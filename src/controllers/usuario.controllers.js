import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import moment from 'moment-timezone';

const prisma = new PrismaClient();


export const createUsuario = async (req, res) => {
    const { nombreUsuarioI, nombreI, apellidoI, correoI, contraseniaI } = req.body;

    if (!nombreUsuarioI || !nombreI || !apellidoI || !correoI || !contraseniaI) {
        return res.status(400).json({ message: 'Datos Incompletos' });
    }

    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (!usernameRegex.test(nombreUsuarioI)) {
        return res.status(400).json({ message: 'El nombre de usuario solo debe contener letras y números, sin espacios' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(contraseniaI)) {
        return res.status(400).json({ 
            message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial' 
        });
    }

    try {
    
        const usuarioExistente = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { nombreUsuario: nombreUsuarioI },
                    { correo: correoI }
                ]
            }
        });

        if (usuarioExistente) {
            const campoConflicto = usuarioExistente.nombreUsuario === nombreUsuarioI ? 'nombre de usuario' : 'correo';
            return res.status(400).json({ message: `El usuario ya existe con este ${campoConflicto}` });
        }

        const saltRounds = 8;
        const hashedPassword = await bcrypt.hash(contraseniaI, saltRounds);

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombreUsuario: nombreUsuarioI,
                nombre: nombreI,
                apellido: apellidoI,
                correo: correoI,
                contrasenia: hashedPassword
            }
        });

        res.status(201).json({ message: "Usuario creado exitosamente", usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ message: "Error al crear usuario", error: error.message });
    }
};


export const logIn = async (req, res) => {
    const { nombreUsuarioI, contraseniaI } = req.body;

    try {
        const usuario = await prisma.usuario.findFirst({
            where: {
                nombreUsuario: nombreUsuarioI
            }
        });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const esContraseniaCorrecta = await bcrypt.compare(contraseniaI, usuario.contrasenia);

        if (!esContraseniaCorrecta) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        res.json({ 
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            nombreUsuario: usuario.nombreUsuario
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

export const obtenerPerfilUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const usuarioId = parseInt(id_usuario, 10);
    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fechaNacimiento: true,
        nombreUsuario: true,
        imagenPerfil: true, // Incluye la imagen de perfil
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Convertir la fecha a la zona horaria de La Paz, Bolivia
    const fechaHoraLaPaz = moment.tz(usuario.fechaNacimiento, 'UTC').tz('America/La_Paz');
      
    const usuarioConZonaHoraria = {
      ...usuario,
      fechaNacimiento: fechaHoraLaPaz.format('YYYY-MM-DD HH:mm:ss'),
    };

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fechaNacimiento: usuario.fechaNacimiento,
      nombreUsuario: usuario.nombreUsuario,
      imagenPerfil: usuario.imagenPerfil
        ? `data:image/jpeg;base64,${usuario.imagenPerfil.toString("base64")}` // Convertir la imagen a base64
        : null,
    });
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const editarPerfil = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const usuarioId = parseInt(id_usuario, 10);
    if (isNaN(usuarioId)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    const { nombre, apellido, fechaNacimiento, nombreUsuario } = req.body;

    if (!nombre || !apellido || !fechaNacimiento || !nombreUsuario) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const [anio, mes, dia] = fechaNacimiento.split("-");
    const fechaNacimientoISO = moment.tz(new Date(`${anio}-${mes}-${dia}`), 'America/La_Paz');

    let nuevaImagenPerfil = null;
    if (req.file) {
      nuevaImagenPerfil = req.file.buffer;
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nombre,
        apellido,
        fechaNacimiento: fechaNacimientoISO.toDate(),
        nombreUsuario,
        imagenPerfil: nuevaImagenPerfil || undefined, // Actualiza solo si hay una nueva imagen
      },
    });

    res.json({
      message: "Usuario actualizado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al editar el usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// Configura el transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Cambia al servicio de correo que uses
    auth: {
        user: 'HistoryHouse743@gmail.com',
        pass: 'njsj pjlf plqy getu'
    }
});

// Configura tu clave secreta para el token
const JWT_SECRET = 'esta_aplicacion_fue_desarrollada_por_nova_devs';
const TOKEN_EXPIRATION = '1h'; // Expira en 1 hora

export const passwordRequest = async (req, res) => {
    const { correoI } = req.body;
    // Verificar que el campo de correo no esté vacío
    if (!correoI) {
        return res.status(400).json({ message: 'El campo de correo está vacío' });
    }

    // Validar el formato del correo con una expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoI)) {
        return res.status(400).json({ message: 'El correo electrónico no tiene un formato válido' });
    }

    try{

        // Verificamos la existencia del usuario dado el correo electrónico 
        const usuario= await prisma.usuario.findFirst({
            where: {
                correo: correoI, 
            }
        });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Generamos el token de recuperación
        const token = jwt.sign({ userId: usuario.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });

        // Enlace de restablecimiento (adaptar según tu frontend)
        const resetLink = `http://localhost:5173/reset-password?token=${token}`;
        
        // Envía el correo al usuario
         await transporter.sendMail({
            from: 'HistoryHouse743@gmail.com',
            to: correoI,
            subject: 'History House - Restablecimiento de contraseña',
            html: `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><a href="${resetLink}">Restablecer contraseña</a>`
        });

        res.json({ message: 'Correo de restablecimiento enviado' });
    }catch(error){
        console.error(error);
        res.status(500).json(({message: "Error al enviar el correo"}));
    }
};

export const passwordReset = async (req, res) => {
    const { token, contraseniaNueva } = req.body;
  
    // Validación de entrada
    if (!token || !contraseniaNueva) {
      return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios' });
    }

    // Verificamos que la contrasenia cumpla con los estandares de seguridad
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(contraseniaNueva)) {
        return res.status(400).json({ 
            message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial' 
        });
    }

    try {
        // Verificamos el token
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        
        // Buscamos el usuario en la base de datos
        const usuario = await prisma.usuario.findUnique({
            where: {
                id: userId, 
            }
        });
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Hash de la nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contraseniaNueva, saltRounds);  
        
        // Actualizar la contraseña en la base de datos
        await prisma.usuario.update({
            where: { id: userId },
            data: { contrasenia: hashedPassword },
        });
        
        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'El token ha expirado' });
        }
        
        if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
            return res.status(400).json({ message: 'Token no válido' });
        }
        console.error(error);
        res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
};

export const newPassword = async (req, res) => {
    const {id_usuario} = req.params;
    const { contraseniaActual, contraseniaNueva } = req.body;
  
    // Validación de entrada
    if (!contraseniaActual || !contraseniaNueva) {
      return res.status(400).json({ message: 'Contraseña actual y nueva contraseña son obligatorios' });
    }

    // Verificamos que la contrasenia cumpla con los estandares de seguridad
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(contraseniaNueva)) {
        return res.status(400).json({ 
            message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial' 
        });
    }

    try {
        const userId = parseInt(id_usuario, 10);
        
        // Buscamos el usuario en la base de datos
        const usuario = await prisma.usuario.findUnique({
            select: {
                contrasenia: true,
            },
            where: {
                id: userId, 
            }
        });
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const esContraseniaCorrecta = await bcrypt.compare(contraseniaActual, usuario.contrasenia);

        if (!esContraseniaCorrecta) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }
        
        if(contraseniaActual === contraseniaNueva){
            return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la actual' });
        }

        // Hash de la nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contraseniaNueva, saltRounds);  
        
        // Actualizar la contraseña en la base de datos
        await prisma.usuario.update({
            where: { id: userId },
            data: { contrasenia: hashedPassword },
        });
        
        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
};