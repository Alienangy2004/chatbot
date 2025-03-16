/**
 * @description      : 
 * @author           : ditom
 * @group            : 
 * @created          : 13/03/2025 - 09:18:09
 * 
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 13/03/2025
 * - Author          : ditom
 * - Modification    : 
 **/
const express = require("express");
const bodyParser = require("body-parser");
const dialogflow = require("@google-cloud/dialogflow");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname)); // Servir archivos estáticos como index.html

// Cargar la clave JSON de Dialogflow
const CREDENTIALS = JSON.parse(fs.readFileSync("dialogflow-key.json"));

// Configurar cliente de Dialogflow
const sessionClient = new dialogflow.SessionsClient({
    credentials: CREDENTIALS
});

// Función para enviar mensajes a Dialogflow
async function sendToDialogflow(msg, sessionId) {
    const sessionPath = sessionClient.projectAgentSessionPath(
        CREDENTIALS.project_id,
        sessionId
    );

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: msg,
                languageCode: "es" // Cambia según el idioma de tu chatbot
            }
        }
    };

    const responses = await sessionClient.detectIntent(request);
    return responses[0].queryResult.fulfillmentText;
}

// Ruta para recibir mensajes desde la página web
app.post("/chatbot", async(req, res) => {
    const userMessage = req.body.message;
    const sessionId = req.body.session || "123456";

    try {
        const botResponse = await sendToDialogflow(userMessage, sessionId);
        res.json({ reply: botResponse });
    } catch (error) {
        console.error("Error en Dialogflow:", error);
        res.status(500).json({ reply: "Hubo un error, intenta nuevamente." });
    }
});

// Servir la página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
