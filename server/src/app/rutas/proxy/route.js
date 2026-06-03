import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "La URL es requerida" }, { status: 400 });
    }

    if (url.startsWith("file://")) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; padding: 20px; color: #475569; background: #f8fafc; text-align: center;">
            <span style="font-size: 48px;">⚠️</span>
            <h2>Acceso a archivo local bloqueado</h2>
            <p>El navegador y el servidor no pueden cargar archivos locales directos (<code>file://</code>) dentro del iframe por seguridad de sandbox.</p>
            <p><strong>Solución:</strong> Ejecuta tu archivo de pruebas usando un servidor local (ej. la extensión Live Server de VS Code o <code>python -m http.server</code>), lo que te dará una URL como <code>http://127.0.0.1:5500/...</code>.</p>
          </body>
        </html>`,
        {
          status: 200,
          headers: { 
            "Content-Type": "text/html; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
          },
        }
      );
    }

    const response = await fetch(url);
    let html = await response.text();

    // Inyectar etiqueta <base> para redirigir recursos relativos al dominio real
    const originUrl = new URL(url).origin;
    const baseTag = `<base href="${originUrl}/">`;
    
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>${baseTag}`);
    } else {
      html = baseTag + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "X-Frame-Options": "ALLOW-FROM *",
        "Content-Security-Policy": ""
      },
    });
  } catch (error) {
    console.error("Error en proxy:", error);
    return new NextResponse(
      `<html>
        <body style="font-family: sans-serif; padding: 20px; color: #b91c1c; background: #fef2f2; text-align: center;">
          <span style="font-size: 48px;">❌</span>
          <h2>Error de Conexión Proxy</h2>
          <p>No se pudo cargar la página a través del proxy del servidor: <code>${error.message}</code></p>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 
          "Content-Type": "text/html; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        },
      }
    );
  }
}
