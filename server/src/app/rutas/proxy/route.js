/**
 * Proxy endpoint — sirve el HTML de cualquier URL eliminando
 * los headers de seguridad que impiden cargar la web en un iframe
 * (X-Frame-Options, Content-Security-Policy frame-ancestors).
 *
 * NO genera imágenes. NO usa Puppeteer.
 * Solo actúa como intermediario para que el iframe del dashboard
 * pueda renderizar el sitio.
 *
 * Uso: GET /rutas/proxy?url=https://ejemplo.com
 */

import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { error: "El parámetro 'url' es requerido" },
        { status: 400 }
      );
    }

    console.log(`[Proxy] Fetching: ${targetUrl}`);

    // Fetch the target page HTML
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return new NextResponse(`Error fetching ${targetUrl}: ${response.status}`, {
        status: response.status,
      });
    }

    let html = await response.text();

    // Inyectar una etiqueta <base> para que los recursos relativos
    // (CSS, JS, imágenes) se resuelvan contra el dominio original
    const origin = new URL(targetUrl).origin;
    const basePath = targetUrl.endsWith("/") ? targetUrl : targetUrl + "/";

    // Reemplazar cualquier <base> existente con la URL absoluta del sitio original
    if (html.includes("<base")) {
      html = html.replace(
        /<base[^>]*>/i,
        `<base href="${basePath}">`
      );
    } else {
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1><base href="${basePath}">`
      );
    }

    // Devolver como HTML sin restricciones de iframe
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "X-Frame-Options": "ALLOWALL",
        // No enviar CSP que bloquee el iframe
      },
    });
  } catch (error) {
    console.error("[Proxy] Error:", error);
    return new NextResponse(
      `<html><body><h3>No se pudo cargar la vista previa</h3><p>${error.message}</p></body></html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "X-Frame-Options": "ALLOWALL",
        },
      }
    );
  }
}
