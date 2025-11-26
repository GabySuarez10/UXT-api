
// src/controladores/pruebasController.js
import { getPruebas, createPrueba } from "@/queries/pruebasQueries.js";
import { updatePrueba } from "@/queries/pruebasQueries.js";
import { Prueba } from "@/clases/Prueba";

export class PruebasController  {
  static async listar() {
    const  pruebas = await getPruebas();
    return pruebas.map(u => new Prueba(u.uid, u.recurrente, u.title, u.url, u.dominio, u.userAgent, u.referrer));
  }
  
  static async crear(data) {
    console.log(data);
    if ( !data.title || !data.url || !data.dominio || !data.userAgent || !data.referrer) {
      throw new Error("Todos los campos son obligatorios");
    }
    let listaPruebas = await getPruebas();
    for (let prueba of listaPruebas) {
      if (prueba.uid === data.uid) {
        const pruebas = await updatePrueba(data);
        return new Prueba(pruebas.uid, pruebas.recurrente, pruebas.title, pruebas.url, pruebas.dominio, pruebas.userAgent, pruebas.referrer);
      }
    }
    const pruebas = await createPrueba(data);
    return new Prueba(pruebas.uid, pruebas.recurrente, pruebas.title, pruebas.url, pruebas.dominio, pruebas.userAgent, pruebas.referrer);
    }
  
};
