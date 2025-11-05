const dotenv = require("dotenv");
const emailjs = require("@emailjs/nodejs");

dotenv.config();

// ⚙️ Configuration EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_CONTACT,
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY,
};

// 📧 Contrôleur d’envoi de message de contact
exports.sendContactMessage = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, error: "Requête vide." });
    }

    // ✅ Déstructuration et nettoyage
    let { name = "", email = "", message = "", subject = "" } = req.body;
    name = name.trim();
    email = email.trim();
    message = message.trim();
    subject = subject.trim() || "Sans sujet";

    // ✅ Vérification des champs requis
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Les champs nom, email et message sont obligatoires.",
      });
    }

    // ✅ Validation d'email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: "Email invalide." });
    }

    // ✅ Préparation des paramètres EmailJS
    const templateParams = {
      from_name: name,
      from_email: email,
      subject,
      message,
      reply_to: email,
      to_name: "Fondation Mayar",
    };

    const options = {
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
      privateKey: EMAILJS_CONFIG.PRIVATE_KEY,
    };

    // ✅ Envoi via EmailJS
    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      options
    );

    console.log("✅ Email envoyé :", result);

    res.status(200).json({
      success: true,
      message: "Email envoyé avec succès à la Fondation Mayar !",
    });
  } catch (err) {
    console.error("❌ Erreur EmailJS :", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Erreur lors de l'envoi de l'email.",
    });
  }
};
