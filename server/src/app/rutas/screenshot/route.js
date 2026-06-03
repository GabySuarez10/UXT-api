import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import {
  updateSitioSnapshot,
  getSitioSnapshot
} from "@/queries/sitiosQueries.js";

const CAPTURE_WIDTH = 1280;
const CACHE_TTL_DAYS = 7; // opcional si luego quieres expiración

// ════════════════════════════════
// MAIN ENDPOINT
// ════════════════════════════════
export async function POST(req) {
  let browser;

  try {
    const body = await req.json();
    const url = body?.url;
    const force = body?.force || false;

    if (!url) {
      return jsonError("El campo 'url' es obligatorio", 400);
    }

    console.log(`📸 Screenshot request: ${url} | force=${force}`);

    // ════════════════════════════════
    // 1. CHECK CACHE (BD)
    // ════════════════════════════════
    if (!force) {
      try {
        const cached = await getSitioSnapshot(url);

        if (cached?.snapshot) {
          console.log("⚡ Snapshot servido desde cache");

          return NextResponse.json(
            {
              snapshot: cached.snapshot,
              width: CAPTURE_WIDTH,
              height: cached.height || null,
              cached: true
            },
            { headers: corsHeaders() }
          );
        }
      } catch (dbErr) {
        console.warn("⚠️ Error leyendo cache, continuando captura:", dbErr.message);
      }
    }

    // ════════════════════════════════
    // 2. LANZAR CHROMIUM
    // ════════════════════════════════
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ],
      defaultViewport: {
        width: CAPTURE_WIDTH,
        height: 900
      },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: CAPTURE_WIDTH,
      height: 900,
      deviceScaleFactor: 1
    });

    page.on("requestfailed", () => { });

    // ════════════════════════════════
    // 3. NAVIGATION (ESTABLE)
    // ════════════════════════════════
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    await page.waitForTimeout(1500);

    // ════════════════════════════════
    // 4. PAGE SIZE
    // ════════════════════════════════
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    }));

    // ════════════════════════════════
    // 5. SCREENSHOT
    // ════════════════════════════════
    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 65,
      fullPage: true
    });

    const base64 = `data:image/jpeg;base64,${screenshotBuffer.toString("base64")}`;

    // cerrar browser seguro
    await browser.close();

    // ════════════════════════════════
    // 6. SAVE IN DB (NO CRÍTICO)
    // ════════════════════════════════
    try {
      await updateSitioSnapshot({
        url,
        snapshot: base64,
        height: dimensions.height
      });

      console.log("💾 Snapshot guardado en BD");
    } catch (dbErr) {
      console.warn("⚠️ No se pudo guardar en BD:", dbErr.message);
    }

    // ════════════════════════════════
    // 7. RESPONSE
    // ════════════════════════════════
    return NextResponse.json(
      {
        snapshot: base64,
        width: CAPTURE_WIDTH,
        height: dimensions.height,
        cached: false
      },
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error("❌ Screenshot error:", error);

    if (browser) {
      try {
        await browser.close();
      } catch (_) { }
    }

    return jsonError(error.message || "Error al capturar screenshot", 500);
  }
}

// ════════════════════════════════
// CORS
// ════════════════════════════════
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// ════════════════════════════════
// HELPERS
// ════════════════════════════════
function jsonError(message, status) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: corsHeaders()
    }
  );
}