import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { updateSitioSnapshot } from "@/queries/sitiosQueries.js";

// Ruta al ejecutable de Chrome instalado

// Ancho estándar de captura — debe coincidir con el ancho del contenedor del heatmap en el frontend
const CAPTURE_WIDTH = 1280;

/**
 * POST /rutas/screenshot
 * Body: { url: string }
 * Captura un screenshot completo (fullPage) de la URL usando Puppeteer.
 * Retorna { snapshot, width, height }
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
      args: chromium.args,
      defaultViewport: { width: CAPTURE_WIDTH, height: 900 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    // Viewport fijo de 1280px — el mismo ancho que usa el contenedor del heatmap
    await page.setViewport({ width: CAPTURE_WIDTH, height: 900, deviceScaleFactor: 1 });

    // Ignorar errores de recursos (imágenes/fuentes fallidas no detienen la captura)
    page.on("requestfailed", () => { });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 25000,
    });

    // Espera breve para que termine de renderizar animaciones / fuentes
    await new Promise((r) => setTimeout(r, 1200));

    // Obtener dimensiones reales de la página completa
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));

    // Captura de página completa (fullPage: true) en JPEG comprimido
    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 65,
      fullPage: true,
    });

    await browser.close();

    const base64 = `data:image/jpeg;base64,${screenshotBuffer.toString("base64")}`;

    // Intentar guardar el snapshot en la BD (no es crítico si falla)
    try {
      await updateSitioSnapshot({ url, snapshot: base64 });
      console.log(`Snapshot guardado en BD para: ${url} (${dimensions.width}x${dimensions.height})`);
    } catch (dbErr) {
      console.warn("No se pudo guardar el snapshot en BD:", dbErr.message);
    }

    return NextResponse.json(
      { snapshot: base64, width: CAPTURE_WIDTH, height: dimensions.height },
      { status: 200 }
    );
  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch (_) { }
    }
    console.error("Error en POST /rutas/screenshot:", error);
    return NextResponse.json(
      { error: error.message || "Error al capturar la pantalla" },
      { status: 500 }
    );
  }
}
