import { NextResponse } from "next/server";
import { updateSitioSnapshot } from "@/queries/sitiosQueries";

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL requerida para capturar el sitio" },
        { status: 400 },
      );
    }

    console.log(`[Screenshot] Iniciando captura con Microlink para: ${url}`);

    // Call Microlink API to get a screenshot
    // Using viewport 1280x800 as base, and fullPage=true
    const microlinkApiUrl = new URL('https://api.microlink.io/');
    microlinkApiUrl.searchParams.append('url', url);
    microlinkApiUrl.searchParams.append('screenshot', 'true');
    microlinkApiUrl.searchParams.append('meta', 'false');
    microlinkApiUrl.searchParams.append('viewport.width', '1280');
    microlinkApiUrl.searchParams.append('viewport.height', '800');
    microlinkApiUrl.searchParams.append('viewport.deviceScaleFactor', '1');
    microlinkApiUrl.searchParams.append('fullPage', 'true');

    const response = await fetch(microlinkApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Microlink API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || !data.data.screenshot || !data.data.screenshot.url) {
      throw new Error("No se pudo obtener la imagen de Microlink");
    }

    const screenshotUrl = data.data.screenshot.url;
    // Assuming default width and estimated max height for full page
    const screenshot_width = 1280;
    const screenshot_height = data.data.screenshot.height || 4000;

    console.log(`[Screenshot] Guardando snapshot para ${url}`);
    
    // Save to DB
    const result = await updateSitioSnapshot({
      url,
      snapshot: screenshotUrl,
      snapshot_width,
      snapshot_height
    });

    return NextResponse.json({
      success: true,
      snapshotUrl: screenshotUrl,
      width: screenshot_width,
      height: screenshot_height
    });

  } catch (error) {
    console.error("[Screenshot] Error capturando sitio con Microlink:", error);
    return NextResponse.json(
      { error: "Error al capturar el sitio: " + error.message },
      { status: 500 },
    );
  }
}
