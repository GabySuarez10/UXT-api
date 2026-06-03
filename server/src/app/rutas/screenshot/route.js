import { NextResponse } from "next/server";
import {
  updateSitioSnapshot,
  getSitioSnapshot
} from "@/queries/sitiosQueries.js";

const CAPTURE_WIDTH = 1280;

// ════════════════════════════════
// MAIN ENDPOINT
// ════════════════════════════════
export async function POST(req) {
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
    // 2. FETCH FROM MICROLINK API
    // ════════════════════════════════
    console.log("🌐 Solicitando screenshot a microlink.io...");
    const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&fullPage=true`;
    
    const response = await fetch(microlinkUrl);
    const data = await response.json();

    if (data.status !== 'success' || !data.data?.screenshot?.url) {
      throw new Error("No se pudo obtener el screenshot de microlink");
    }

    // ════════════════════════════════
    // 3. DESCARGAR LA IMAGEN Y CONVERTIR A BASE64
    // ════════════════════════════════
    const imageUrl = data.data.screenshot.url;
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`;
    const captureHeight = data.data.screenshot.height || 900;

    // ════════════════════════════════
    // 4. SAVE IN DB
    // ════════════════════════════════
    try {
      await updateSitioSnapshot({
        url,
        snapshot: base64,
        height: captureHeight
      });

      console.log("💾 Snapshot guardado en BD");
    } catch (dbErr) {
      console.warn("⚠️ No se pudo guardar en BD:", dbErr.message);
    }

    // ════════════════════════════════
    // 5. RESPONSE
    // ════════════════════════════════
    return NextResponse.json(
      {
        snapshot: base64,
        width: CAPTURE_WIDTH,
        height: captureHeight,
        cached: false
      },
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error("❌ Screenshot error:", error);
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