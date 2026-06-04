import nodemailer from "nodemailer";

let transporter;

function getEmailConfig() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error("Faltan variables EMAIL_USER o EMAIL_PASSWORD");
  }

  return { user, pass };
}

function getTransporter() {
  if (transporter) return transporter;

  const { user, pass } = getEmailConfig();

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
}

export async function sendRecoveryEmail(email, code) {
  try {
    const { user } = getEmailConfig();
    const mailer = getTransporter();

    console.log("Enviando correo de recuperacion a:", email);

    const info = await mailer.sendMail({
      from: `"UXTracks" <${user}>`,
      to: email,
      subject: "Codigo de recuperacion de contrasena",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Recuperacion de contrasena</h2>
          <p>Tu codigo de verificacion es:</p>
          <h1 style="letter-spacing: 8px; font-size: 32px;">${code}</h1>
          <p>Este codigo expira en 15 minutos.</p>
        </div>
      `,
    });

    console.log("Email de recuperacion enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("ERROR EN ENVIO DE EMAIL:");
    console.error(error);
    console.error("CODE:", error.code);
    console.error("RESPONSE:", error.response);
    console.error("COMMAND:", error.command);

    throw new Error("Error enviando correo de recuperacion");
  }
  function getEmailConfig() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.replace(/\s/g, "");

  // 👇 Agrega esto temporalmente para debuggear en Render
  console.log("EMAIL_USER length:", user?.length);
  console.log("EMAIL_USER value:", user);
  console.log("EMAIL_PASSWORD length:", pass?.length);
  console.log("EMAIL_PASSWORD primeros 4 chars:", pass?.substring(0, 4));

  if (!user || !pass) {
    throw new Error("Faltan variables EMAIL_USER o EMAIL_PASSWORD");
  }

  return { user, pass };
}
}
