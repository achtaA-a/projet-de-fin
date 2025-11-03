const dotenv = require("dotenv");
const emailjs = require("@emailjs/nodejs");

dotenv.config();

// Configuration EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_CONTACT,
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY,
};

const sendContactMessage = async (req, res) => {
  // Vérifie que req.body existe
  if (!req.body) {
    return res.status(400).json({ error: "Requête vide." });
  }

  // Déstructuration sécurisée avec valeurs par défaut
  let { name = "", email = "", message = "", subject = "" } = req.body;

  // Nettoyage des valeurs
  name = name.trim();
  email = email.trim();
  message = message.trim();
  subject = subject.trim();

  // Vérification des champs obligatoires
  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Les champs nom, email et message sont obligatoires.",
    });
  }

  // Validation minimale de l'email
  if (!email.includes("@")) {
    return res.status(400).json({ error: "Format d'email invalide." });
  }

  try {
    const templateParams = {
      from_name: name,
      from_email: email,
      subject: subject || "Sans sujet",
      message,
      reply_to: email,
      to_name: "Fondation Mayar",
    };

    const options = {
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
      privateKey: EMAILJS_CONFIG.PRIVATE_KEY,
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      options
    );

    console.log("Email envoyé :", result);

    res.status(200).json({
      success: true,
      message: "Email envoyé avec succès à la Fondation Mayar !",
    });
  } catch (err) {
    console.error("Erreur EmailJS :", err);
    res.status(500).json({
      success: false,
      error: err.message || "Erreur lors de l'envoi de l'email.",
    });
  }
};

module.exports = { sendContactMessage };
