import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRecoveryEmail(email, code) {
  try {
    console.log("Enviando correo de recuperacion a:", email);

    const { data, error } = await resend.emails.send({
      from: "UXTracks <onboarding@resend.dev>", // 👈 este funciona sin dominio propio
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

    if (error) {
      console.error("Error Resend:", error);
      throw new Error(error.message);
    }

    console.log("Email enviado:", data?.id);
    return data;

  } catch (error) {
    console.error("ERROR EN ENVIO DE EMAIL:", error);
    throw new Error("Error enviando correo de recuperacion");
  }
}