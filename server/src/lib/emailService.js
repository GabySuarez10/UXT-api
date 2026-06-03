import nodemailer from "nodemailer";

// ❌ SOLO LOCAL
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./.env.local" });
}

// 🔐 Validación fuerte
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  throw new Error("Faltan variables EMAIL_USER o EMAIL_PASSWORD");
}

// 🚀 Transporter estable para Gmail en producción
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD?.trim(),
  },
});

export async function sendRecoveryEmail(email, code) {
  try {
    console.log("📨 Enviando correo a:", email);

    const info = await transporter.sendMail({
      from: `"UXTracks" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Código de recuperación de contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Recuperación de contraseña</h2>
          <p>Tu código de verificación es:</p>
          <h1 style="letter-spacing: 8px; font-size: 32px;">${code}</h1>
          <p>Este código expira en 15 minutos.</p>
        </div>
      `,
    });

    console.log("✅ Email enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("🔥 ERROR EN ENVÍO DE EMAIL:");
    console.error(error);
    console.error("CODE:", error.code);
    console.error("RESPONSE:", error.response);

    throw new Error("Error enviando correo de recuperación");
  }
}