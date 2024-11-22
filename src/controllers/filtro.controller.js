import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const getCategorias = async (req, res) => {
    const categorias = await prisma.categoria.findMany({
        select:{
            nombre: true,
            id: true
        }
    });

    res.status(200).json(categorias);
};

export const getPaises = async (req, res) => {
    const categorias = await prisma.pais.findMany({
        select:{
            nombre: true,
            id: true
        }
    });

    res.status(200).json(categorias);
};

export const getLibrosPorPais = async (req, res) => {
    try {
        const { id_pais } = req.params;
        
        // Validar que id_pais sea un número
        const paisId = parseInt(id_pais, 10);
        if (isNaN(paisId)) {
            return res.status(400).json({ error: "ID de país no válido" });
        }

        const libros = await prisma.libro.findMany({
            where: {
                paisId
            },
            select: {
                titulo: true,
                portada: true,
                id: true
            },
        });
        
        res.json(libros);
    } catch (error) {
        console.error("Error al obtener los libros por país:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


export const getLibrosPorCategoria = async (req, res) => {
    try {
        const { id_categoria } = req.params;
        
        // Validar que id_categoria sea un número
        const categoriaId = parseInt(id_categoria, 10);
        if (isNaN(categoriaId)) {
            return res.status(400).json({ error: "ID de categoría no válido" });
        }

        const libros = await prisma.libro.findMany({
            where: {
                categoriaId
            },
            select: {
                titulo: true,
                portada: true,
                id: true
            },
        });
        
        res.json(libros);
    } catch (error) {
        console.error("Error al obtener los libros por categoría:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};