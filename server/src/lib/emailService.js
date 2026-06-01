import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'uxtracksoporte@gmail.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendRecoveryEmail(email, code) {
  const mailOptions = {
    from: `"UXTracks Soporte" <${process.env.EMAIL_USER || 'uxtracksoporte@gmail.com'}>`,
    to: email,
    subject: 'Código de recuperación de contraseña - UXTracks',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(14, 44, 64, 0.12); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0E2C40 0%, #1A4A5A 50%, #148D8D 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 36px; color: #ffffff; letter-spacing: 2px;">
                      <span style="color: #ffffff;">U</span><span style="color: #b8d4e3;">X</span><span style="color: #4dd4d4;">T</span><span style="color: #ffffff;">racks</span>
                    </h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; color: #0E2C40; font-size: 22px; font-weight: 700;">
                      Recuperación de contraseña
                    </h2>
                    <p style="margin: 0 0 24px; color: #6c757d; font-size: 15px; line-height: 1.6;">
                      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código de verificación:
                    </p>
                    <!-- Code Box -->
                    <div style="background: linear-gradient(135deg, #0E2C40 0%, #1A4A5A 100%); border-radius: 10px; padding: 24px; text-align: center; margin: 0 0 24px;">
                      <p style="margin: 0 0 8px; color: #4dd4d4; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">
                        Tu código de verificación
                      </p>
                      <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px;">
                        ${code}
                      </p>
                    </div>
                    <p style="margin: 0 0 8px; color: #6c757d; font-size: 14px; line-height: 1.5;">
                      ⏱️ Este código expira en <strong style="color: #0E2C40;">15 minutos</strong>.
                    </p>
                    <p style="margin: 0 0 24px; color: #6c757d; font-size: 14px; line-height: 1.5;">
                      Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 24px 0;">
                    <p style="margin: 0; color: #adb5bd; font-size: 12px; text-align: center; line-height: 1.5;">
                      Este es un correo automático, por favor no respondas a este mensaje.<br>
                      &copy; ${new Date().getFullYear()} UXTracks. Todos los derechos reservados.
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

  await transporter.sendMail(mailOptions);
}
