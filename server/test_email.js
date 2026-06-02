require('dotenv').config({ path: './.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing Email Configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD set?', !!process.env.EMAIL_PASSWORD);

  if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD.includes('REEMPLAZAR')) {
    console.error('ERROR: EMAIL_PASSWORD no es válido. Debes cambiarlo por tu contraseña de aplicación de Google.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "uxtracksoporte@gmail.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    const info = await transporter.verify();
    console.log('✅ ÉXITO: El servidor SMTP aceptó tus credenciales.');
    console.log('Si esto funcionó, entonces las credenciales están bien. Asegúrate de copiarlas EXACTAMENTE igual (sin espacios de más) en las variables de entorno (Environment Variables) de Render.');
  } catch (err) {
    console.error('❌ ERROR AL AUTENTICAR CON GOOGLE:');
    console.error(err.message);
    if (err.message.includes('Username and Password not accepted')) {
      console.log('\n--> Posible causa: La "Contraseña de aplicación" es incorrecta, o no activaste la Verificación en 2 pasos en Google.');
    }
  }
}

testEmail();
