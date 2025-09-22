import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todos API',
      version: '1.0.0',
      description: 'API REST para gestionar tus todos',
    },
    servers: [
      {
        url: 'http://localhost:3000', // cambia en prod
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'], // dónde leer @swagger
};

export const swaggerSpec = swaggerJsdoc(options);
