/**
 * @swagger
 * /screenshot:
 *   post:
 *     summary: Genera o retorna un screenshot cacheado de una URL
 *     tags: [Screenshots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL del sitio a capturar
 *     responses:
 *       200:
 *         description: Screenshot generado o cacheado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 screenshotFile:
 *                   type: string
 *                 width:
 *                   type: number
 *                 height:
 *                   type: number
 *                 cached:
 *                   type: boolean
 *       400:
 *         description: Falta el parámetro URL
 *       500:
 *         description: Error al generar screenshot
 *   get:
 *     summary: Sirve un screenshot cacheado como imagen PNG
 *     tags: [Screenshots]
 *     parameters:
 *       - in: query
 *         name: file
 *         schema:
 *           type: string
 *         description: Nombre del archivo de screenshot
 *         required: true
 *     responses:
 *       200:
 *         description: Imagen PNG del screenshot
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Screenshot no encontrado
 */

import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import os from "os";

// Directorio para screenshots cacheados (cross-platform)
const SCREENSHOTS_DIR = join(os.tmpdir(), "uxtracks-screenshots");
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 900;

// Asegurar que el directorio existe al cargar el módulo
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Genera un nombre de archivo hash estable basado en la URL normalizada
 */
function getHashedFilename(url) {
  const normalized = url.trim().toLowerCase().replace(/\/+$/, "");
  return (
    createHash("sha256").update(normalized).digest("hex").slice(0, 16) + ".png"
  );
}

/**
 * Busca un ejecutable de Chrome/Chromium local para desarrollo
 */
function findLocalChrome() {
  const paths =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        ]
      : [
          "/usr/bin/google-chrome",
          "/usr/bin/google-chrome-stable",
          "/usr/bin/chromium",
          "/usr/bin/chromium-browser",
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        ];

  return paths.find((p) => existsSync(p)) || null;
}

/**
 * GET /rutas/screenshot?file=xxx.png
 * Sirve un screenshot cacheado como imagen PNG
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file");

    // Validar parámetro (prevenir path traversal)
    if (!file || /[/\\]|\.\./.test(file)) {
      return NextResponse.json(
        { error: "Parámetro 'file' inválido" },
        { status: 400 },
      );
    }

    const filePath = join(SCREENSHOTS_DIR, file);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "Screenshot no encontrado" },
        { status: 404 },
      );
    }

    const fileBuffer = readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("Error sirviendo screenshot:", error);
    return NextResponse.json(
      { error: error.message || "Error al servir screenshot" },
      { status: 500 },
    );
  }
}

/**
 * POST /rutas/screenshot
 * Genera un screenshot con Puppeteer o retorna el cacheado si ya existe
 * Body: { "url": "https://sitio.com" }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "El campo 'url' es requerido" },
        { status: 400 },
      );
    }

    const filename = getHashedFilename(url);
    const filePath = join(SCREENSHOTS_DIR, filename);
    const metaPath = join(SCREENSHOTS_DIR, filename.replace(".png", ".json"));

    // ═══════════════════════════════
    // CACHE HIT — retornar existente
    // ═══════════════════════════════
    if (existsSync(filePath)) {
      let height = VIEWPORT_HEIGHT;
      try {
        if (existsSync(metaPath)) {
          const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
          height = meta.height || VIEWPORT_HEIGHT;
        }
      } catch {
        // Metadata corrupta, usar height por defecto
      }

      console.log(`Screenshot CACHE HIT: ${url} → ${filename}`);

      return NextResponse.json({
        success: true,
        screenshotFile: filename,
        width: VIEWPORT_WIDTH,
        height,
        cached: true,
      });
    }

    // ═══════════════════════════════
    // CACHE MISS — generar screenshot
    // ═══════════════════════════════
    console.log(`Screenshot CACHE MISS: generando para ${url}`);

    // Asegurar directorio (por si se eliminó en runtime)
    if (!existsSync(SCREENSHOTS_DIR)) {
      mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    let browser;

    try {
      // Producción: usar @sparticuz/chromium (ligero, optimizado para cloud)
      const chromium = (await import("@sparticuz/chromium")).default;
      const puppeteerCore = (await import("puppeteer-core")).default;
      const { addExtra } = await import("puppeteer-extra");
      const StealthPlugin = (await import("puppeteer-extra-plugin-stealth")).default;
      
      const puppeteer = addExtra(puppeteerCore);
      puppeteer.use(StealthPlugin());

      browser = await puppeteer.launch({
        args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } catch {
      // Desarrollo local: usar Chrome del sistema operativo
      const puppeteerCore = (await import("puppeteer-core")).default;
      const { addExtra } = await import("puppeteer-extra");
      const StealthPlugin = (await import("puppeteer-extra-plugin-stealth")).default;
      
      const puppeteer = addExtra(puppeteerCore);
      puppeteer.use(StealthPlugin());
      
      const localChrome = findLocalChrome();

      if (!localChrome) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No se encontró Chrome/Chromium instalado. Instale Google Chrome para desarrollo local.",
          },
          { status: 500 },
        );
      }

      console.log(`Usando Chrome local: ${localChrome}`);

      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
        executablePath: localChrome,
        headless: true,
      });
    }

    try {
      const page = await browser.newPage();

      // Configurar un User-Agent de navegador real para evitar bloqueos de seguridad (ej. Wordfence en WordPress)
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
      
      // Configurar cabeceras extra para simular mejor un navegador humano
      await page.setExtraHTTPHeaders({
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8,en-US;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
      });

      // Opcional: intentar evitar algunos bloqueos estrictos de CSP
      await page.setBypassCSP(true);

      // Navegar a la URL y esperar carga
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Dar tiempo extra (5 segundos) para que cualquier desafío de cookies (ej. iFastNet/InfinityFree) 
      // o redirecciones JS se completen antes de tomar la captura.
      await new Promise(r => setTimeout(r, 5000));

      // Obtener dimensiones reales de la página completa
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }));

      // Capturar screenshot full-page
      await page.screenshot({
        path: filePath,
        fullPage: true,
      });

      // Guardar metadata para futuras consultas de cache
      writeFileSync(
        metaPath,
        JSON.stringify({
          url,
          width: VIEWPORT_WIDTH,
          height: dimensions.height,
          createdAt: new Date().toISOString(),
        }),
      );

      console.log(
        `Screenshot generado: ${filename} (${VIEWPORT_WIDTH}x${dimensions.height})`,
      );

      return NextResponse.json({
        success: true,
        screenshotFile: filename,
        width: VIEWPORT_WIDTH,
        height: dimensions.height,
        cached: false,
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error("Error generando screenshot:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al generar screenshot",
      },
      { status: 500 },
    );
  }
}
