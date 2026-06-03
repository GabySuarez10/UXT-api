import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Reconstruir la URL original
    const pathArray = params.path || [];
    let targetUrl = pathArray.join('/');

    // Si la URL comienza con http:/ o https:/ (Next.js condensa las barras en el path), arreglarlo
    if (targetUrl.startsWith('http:/') && !targetUrl.startsWith('http://')) {
        targetUrl = targetUrl.replace('http:/', 'http://');
    }
    if (targetUrl.startsWith('https:/') && !targetUrl.startsWith('https://')) {
        targetUrl = targetUrl.replace('https:/', 'https://');
    }

    // Agregar el query string si existe
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    if (queryString) {
      targetUrl += '?' + queryString;
    }

    if (!targetUrl || targetUrl === '') {
      return NextResponse.json({ error: "La URL es requerida" }, { status: 400 });
    }

    const response = await fetch(targetUrl);
    
    // Obtener los headers y contenido
    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    // Si es HTML, inyectar base tag
    if (contentType && contentType.includes("text/html")) {
      let html = new TextDecoder("utf-8").decode(buffer);

      // El base tag apuntará a la ruta relativa del proxy
      const targetBaseUrl = new URL(targetUrl).origin;
      const baseTag = `<base href="/rutas/proxy2/${targetBaseUrl}/">`;
      
      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>\n${baseTag}`);
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
    }

    // Para cualquier otro asset (JS, CSS, Imágenes), devolverlo con CORS
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable"
      },
    });

  } catch (error) {
    console.error("Error en proxy2:", error);
    return new NextResponse(
      `console.error("Error Proxy CORS: ${error.message}");`,
      {
        status: 500,
        headers: { 
          "Content-Type": "application/javascript; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        },
      }
    );
  }
}
