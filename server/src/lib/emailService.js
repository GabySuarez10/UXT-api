const { MailtrapTransport } = require("mailtrap");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

const sender = {
  address: "hello@demomailtrap.co",
  name: "UXTracks",
};

async function sendRecoveryEmail(email, code) {
  try {
    console.log("Enviando correo a:", email);

    const info = await transport.sendMail({
      from: sender,
      to: [email],
      subject: "Código de recuperación - UXTracks",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Recuperación de contraseña</h2>
          <p>Tu código de verificación es:</p>
          <h1 style="letter-spacing: 8px; font-size: 32px;">${code}</h1>
          <p>Este código expira en 15 minutos.</p>
        </div>
      `,
    });

    console.log("Email enviado:", info.messageId);
    return info;

  } catch (error) {
    console.error("ERROR EN ENVIO DE EMAIL:", error);
    throw new Error("Error enviando correo de recuperacion");
  }
}

module.exports = { sendRecoveryEmail };