import { NextResponse } from "next/server";

export function middleware(req) {
  const res = NextResponse.next();

  // 🔓 Permitir cualquier dominio
  res.headers.set("Access-Control-Allow-Origin", "*");
  // 🔓 Permitir métodos comunes
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  // 🔓 Permitir encabezados personalizados
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ⚙️ Manejar preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: res.headers,
    });
  }

  return res;
}

// 🔍 Solo aplica a las rutas que comiencen con /api/
export const config = {
  matcher: "/rutas/:path*",
};
