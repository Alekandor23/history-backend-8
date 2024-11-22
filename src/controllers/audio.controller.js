import process from 'node:process';
import textToSpeech from '@google-cloud/text-to-speech';
import * as musicMetadata from 'music-metadata';


// Ruta de las credenciales
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./src/controllers/historyhouse-c247db459be7.json";

const client = new textToSpeech.TextToSpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// Función para dividir el texto en párrafos
const splitText = (text) => {
    const parts = text.split(/(?:\n| {2,})/); // Dividir por saltos de línea (párrafos)
    console.log(`Total de párrafos generados: ${parts.length}`);
    
    // Log para cada párrafo
    parts.forEach((part, index) => {
        console.log(`Párrafo ${index + 1}: ${part.trim()}`);
    });

    return parts;
};

// Función para obtener la duración de un archivo de audio (MP3)
const getAudioDuration = async (audioBuffer) => {
    try {
        const metadata = await musicMetadata.parseBuffer(audioBuffer, { length: 1024 });
        return metadata.format.duration; // Retorna la duración en segundos
    } catch (error) {
        console.error('Error al obtener la duración del audio:', error);
        throw new Error('No se pudo obtener la duración del audio');
    }
};

// Función para convertir texto a audio
const volverAudio = async (text) => {
    try {
        const textParts = splitText(text); // Dividir el texto por párrafos
        const audioBuffers = [];

        for (const [index, part] of textParts.entries()) {
            console.log(`Generando audio para el párrafo ${index + 1}:`, part);

            const request = {
                input: { text: part },
                voice: { languageCode: 'es-MX', ssmlGender: 'NEUTRAL' },
                audioConfig: { audioEncoding: 'MP3' },
            };

            const [response] = await client.synthesizeSpeech(request);

            if (response.audioContent) {
                console.log(`Audio generado para el párrafo ${index + 1} (${part.length} caracteres)`);
                audioBuffers.push(response.audioContent);
            } else {
                console.error(`Error: No se recibió contenido de audio para el párrafo ${index + 1}`);
            }
        }

        // Combinar todos los fragmentos de audio
        const finalAudio = Buffer.concat(audioBuffers);
        console.log('Audio final generado exitosamente');
        return finalAudio;
    } catch (error) {
        console.error('Error generando el audio:', error);
    }
};

// Función para calcular los timestamps
const calcularTimestamps = async (text) => {
    try {
        const textParts = splitText(text); // Dividir el texto en párrafos
        console.log(`Iniciando cálculo de timestamps para ${textParts.length} párrafos.`);
        const timestamps = [];
        let offset = 0;

        for (const [index, part] of textParts.entries()) {
            console.log(`Procesando párrafo ${index + 1}: "${part.trim()}"`);
            
            const request = {
                input: { text: part },
                voice: { languageCode: 'es-MX', ssmlGender: 'NEUTRAL' },
                audioConfig: { audioEncoding: 'MP3' },
            };

            // Generar el audio del párrafo y calcular su duración
            const [response] = await client.synthesizeSpeech(request);
            console.log(`Audio generado para párrafo ${index + 1}. Calculando duración...`);

            const duration = await getAudioDuration(response.audioContent); // Usar la función que definimos
            console.log(`Duración del párrafo ${index + 1}: ${duration.toFixed(2)} segundos.`);

            // Guardar los timestamps
            timestamps.push({
                paragraph: index + 1,
                start: offset,
                end: offset + duration,
            });

            console.log(
                `Timestamps para párrafo ${index + 1}: { start: ${offset.toFixed(2)}s, end: ${(offset + duration).toFixed(2)}s }`
            );

            offset += duration; // Actualizar el offset acumulado
        }

        console.log('Cálculo de timestamps completado. Resultados:', timestamps);
        return timestamps;
    } catch (error) {
        console.error('Error al calcular los timestamps:', error);
        throw new Error('Error al calcular los timestamps');
    }
};

// Controlador para sintetizar el audio
export const synthesizeSpeech = async (req, res) => {
    try {
        const { textoI } = req.body;
        console.log('Texto recibido:', textoI);

        const audioData = await volverAudio(textoI);

        if (!audioData) {
            console.error('Error: No se generó el audio');
            res.status(500).send('Error al generar el audio');
            return;
        }

        console.log('Enviando archivo de audio al cliente');
        res.set('Content-Type', 'audio/mpeg');
        res.set('Content-Disposition', 'attachment; filename="audio.mp3"');
        res.send(audioData); // Enviar los datos binarios directamente
    } catch (error) {
        console.error('Error en synthesizeSpeech:', error);
        res.status(500).send('Error al generar el audio');
    }
};

// Controlador para devolver los timestamps
export const obtenerTimestamps = async (req, res) => {
    try {
        const { textoI } = req.body;
        console.log('Texto recibido para calcular timestamps:', textoI);

        // Calcular timestamps
        const timestamps = await calcularTimestamps(textoI);

        console.log('Timestamps generados:', JSON.stringify(timestamps, null, 2));
        res.json({ timestamps });
    } catch (error) {
        console.error('Error en obtenerTimestamps:', error);
        res.status(500).json({ error: 'Error al calcular los timestamps' });
    }
};
