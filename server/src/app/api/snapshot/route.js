import { NextResponse } from "next/server";
import { updateSitioSnapshot } from "@/queries/sitiosQueries.js";

export async function POST(req) {

  try {

    const data = await req.json();

    const {
      url,
      snapshot,
      snapshot_width,
      snapshot_height
    } = data;

    // Validaciones
    if (!url || !snapshot) {

      return NextResponse.json(
        {
          error:
            "Los campos 'url' y 'snapshot' son obligatorios"
        },
        {
          status: 400
        }
      );

    }

    console.log("📸 Guardando snapshot:", {
      url,
      width: snapshot_width,
      height: snapshot_height
    });

    // Guardar snapshot completo
    const updated = await updateSitioSnapshot({

      url,

      snapshot,

      snapshot_width:
        snapshot_width || 1280,

      snapshot_height:
        snapshot_height || 4000

    });

    return NextResponse.json({

      mensaje:
        "Snapshot guardado exitosamente",

      url: updated.url,

      width:
        snapshot_width || 1280,

      height:
        snapshot_height || 4000

    });

  } catch (error) {

    console.error(
      "❌ Error en POST /api/snapshot:",
      error
    );

    return NextResponse.json({

      error:
        error.message ||
        "Error al guardar snapshot"

    }, {

      status:
        error.message.includes("No se encontró")
          ? 404
          : 500

    });

  }

}