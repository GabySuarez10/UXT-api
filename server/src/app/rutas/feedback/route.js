import { NextResponse } from "next/server";
import { FeedbackController } from "@/controladores/feedbackController.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    console.log(`GET /rutas/feedback - URL filter: ${url}`);

    const feedbacks = await FeedbackController.listar(url);
    return NextResponse.json(feedbacks.map(f => f.toJSON()));
  } catch (error) {
    console.error("Error en GET /rutas/feedback:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener feedbacks" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Datos recibidos en POST /rutas/feedback:", data);

    const feedback = await FeedbackController.crear(data);
    return NextResponse.json(feedback.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Error en POST /rutas/feedback:", error);
    return NextResponse.json(
      { error: error.message || "Error al registrar feedback" },
      { status: 400 }
    );
  }
}
