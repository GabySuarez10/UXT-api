// app/api/swagger/route.ts
import { url } from 'inspector';
import { NextResponse } from 'next/server';

// Tu especificación OpenAPI / Swagger mínima
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Mi API con Next.js',
    version: '1.0.0',
    description: 'Documentación generada con Swagger UI',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
  paths: {
    '/api/todos': {
      get: {
        summary: 'Obtiene todos los todos',
        responses: {
          200: {
            description: 'Lista de todos',
          },
        },
      },
      post: {
        summary: 'Crea un nuevo todo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  url: { type: 'string' },
                  dominio: { type: 'string' },
                  userAgent: { type: 'string' },
                  referrer: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Todo creado',
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
