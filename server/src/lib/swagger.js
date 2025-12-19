import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API REST - UXTracks",
      version: "1.0.0",
      description: "Documentación de la API con Swagger",
    },
    servers: [
      {
        //url: "http://localhost:3000/rutas",
        url: "https://uxt-api-1.onrender.com/rutas",
        //description: "Servidor local",
        description: "Servidor remoto",
      },
    ],
  },
  apis: ["./src/app/rutas/**/*.js", "./src/controladores/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
