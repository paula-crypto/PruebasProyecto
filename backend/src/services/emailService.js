const nodemailer = require('nodemailer');

const crearTransport = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Enviar un correo de forma segura (no rompe el flujo si falla el envío)
const enviarCorreo = async ({ to, subject, text, attachments = [] }) => {
  try {
    const transporter = crearTransport();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments
    });
    return { ok: true };
  } catch (error) {
    console.error('Error enviando correo:', error.message);
    return { ok: false, error: error.message };
  }
};

module.exports = { enviarCorreo };
