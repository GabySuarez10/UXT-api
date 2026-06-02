import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { updateSitioSnapshot } from "@/queries/sitiosQueries.js";

// Ruta al ejecutable de Chrome instalado
const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

/**
 * POST /rutas/screenshot
 * Body: { url: string }
 * Captura un screenshot de la URL usando Puppeteer y lo guarda como snapshot.
 * Retorna { snapshot: "data:image/jpeg;base64,..." }
 */
export async function POST(req) {
  let browser;
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "El campo 'url' es obligatorio" },
        { status: 400 }
      );
    }

    console.log(`POST /rutas/screenshot - Capturando: ${url}`);

    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--disable-extensions",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Ignorar errores de recursos (imágenes/fuentes fallidas no deben detener la captura)
    page.on("requestfailed", () => {});

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    // Espera breve para que termine de renderizar
    await new Promise((r) => setTimeout(r, 1000));

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 60,
      fullPage: false,
    });

    await browser.close();

    const base64 = `data:image/jpeg;base64,${screenshotBuffer.toString("base64")}`;

    // Intentar guardar el snapshot en la BD (no es crítico si falla)
    try {
      await updateSitioSnapshot({ url, snapshot: base64 });
      console.log(`Snapshot guardado en BD para: ${url}`);
    } catch (dbErr) {
      console.warn("No se pudo guardar el snapshot en BD:", dbErr.message);
    }

    return NextResponse.json({ snapshot: base64 }, { status: 200 });
  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    console.error("Error en POST /rutas/screenshot:", error);
    return NextResponse.json(
      { error: error.message || "Error al capturar la pantalla" },
      { status: 500 }
    );
  }
}
