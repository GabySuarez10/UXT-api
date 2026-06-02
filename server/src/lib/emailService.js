import nodemailer from "nodemailer";

// Logs temporales para verificar variables en Render
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD existe:",
  !!process.env.EMAIL_PASSWORD
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

// Verificar conexión SMTP al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("Servidor SMTP listo");
  }
});

export async function sendRecoveryEmail(email, code) {
  const mailOptions = {
    from: `"UXTracks Soporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Código de recuperación de contraseña - UXTracks",

    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>

      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
          <tr>
            <td align="center">

              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

                <!-- HEADER -->
                <tr>
                  <td
                    style="background:linear-gradient(135deg,#0E2C40 0%,#148D8D 100%);
                    padding:32px 40px;
                    text-align:center;">

                    <h1 style="margin:0;color:#ffffff;font-size:34px;">
                      UXTracks
                    </h1>

                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:40px;">

                    <h2 style="margin-top:0;color:#0E2C40;">
                      Recuperación de contraseña
                    </h2>

                    <p style="color:#6c757d;line-height:1.6;">
                      Hemos recibido una solicitud para restablecer tu contraseña.
                      Usa el siguiente código:
                    </p>

                    <!-- Código -->
                    <div
                      style="
                        background:#0E2C40;
                        border-radius:10px;
                        padding:24px;
                        text-align:center;
                        margin:24px 0;
                      "
                    >

                      <p
                        style="
                          color:#4dd4d4;
                          margin:0 0 10px;
                          font-size:13px;
                          letter-spacing:2px;
                          text-transform:uppercase;
                        "
                      >
                        Código de verificación
                      </p>

                      <p
                        style="
                          color:#ffffff;
                          margin:0;
                          font-size:36px;
                          font-weight:bold;
                          letter-spacing:8px;
                        "
                      >
                        ${code}
                      </p>

                    </div>

                    <p style="color:#6c757d;">
                      ⏱️ Este código expira en
                      <strong>15 minutos</strong>.
                    </p>

                    <p style="color:#6c757d;">
                      Si no solicitaste este cambio,
                      puedes ignorar este correo.
                    </p>

                    <hr
                      style="
                        border:none;
                        border-top:1px solid #e9ecef;
                        margin:24px 0;
                      "
                    >

                    <p
                      style="
                        color:#adb5bd;
                        font-size:12px;
                        text-align:center;
                        line-height:1.5;
                      "
                    >
                      Este es un correo automático.<br>
                      © ${new Date().getFullYear()} UXTracks
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
      </html>
    `,
  };

  try {
    console.log(`Enviando correo a: ${email}`);

    const info = await transporter.sendMail(mailOptions);

    console.log("Correo enviado correctamente:", info.messageId);

    return info;

  } catch (error) {

    console.error("ERROR SMTP COMPLETO:", error);

    throw new Error(
      `Error en el servidor de correos: ${error.message}`
    );
  }
}