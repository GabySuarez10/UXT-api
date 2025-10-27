
// src/controladores/pruebasController.js
import { getPruebas, createPrueba } from "@/queries/pruebasQueries.js";
import { Prueba } from "@/clases/Prueba";

export class PruebasController  {
  static async listar() {
    const  pruebas = await getPruebas();
    return pruebas.map(u => new Prueba(u.id, u.title, u.url, u.dominio, u.userAgent, u.referrer));
  }
  
  static async crear(data) {
    if (!data.title || !data.url || !data.dominio || !data.userAgent || !data.referrer) {
      throw new Error("Todos los campos son obligatorios");
    }
    const pruebas = await createPrueba(data);
    return new Prueba(pruebas.id, pruebas.title, pruebas.url, pruebas.dominio, pruebas.userAgent, pruebas.referrer);
    }
  
};
