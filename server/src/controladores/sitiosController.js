import { getSitios, createSitio, getSitiosPorUsuario, updateSitio } from "@/queries/sitiosQueries.js";
import { Sitio } from "@/clases/sitio";

export class SitiosController  {
  // Listar todos los sitios (sin filtro)
  static async listar() {
    const sitios = await getSitios();
    return sitios.map(s => new Sitio(
      s.id, 
      s.usuario, 
      s.titulo, 
      s.url, 
      s.ultimaRevision, 
      s.fechaInicio
    ));
  }
  
  // Listar sitios por usuario específico
  static async listarPorUsuario(usuario) {
    if (!usuario) {
      throw new Error("El parámetro 'usuario' es requerido");
    }
    
    console.log(`Controlador: buscando sitios para usuario: ${usuario}`);
    const sitios = await getSitiosPorUsuario(usuario);
    
    return sitios.map(s => new Sitio(
      s.id, 
      s.usuario, 
      s.titulo, 
      s.url, 
      s.ultimarevision_local.toString(), 
      s.fechainicio_local.toString()
    ));
  }
  
  static async crear(data) {
    console.log("Datos recibidos para crear sitio:", data);
    
    // Validación de campos obligatorios
    if (!data.username) {
      throw new Error("El campo 'username' es obligatorio");
    }
    if (!data.title) {
      throw new Error("El campo 'title' es obligatorio");
    }
    if (!data.url) {
      throw new Error("El campo 'url' es obligatorio");
    }
    
    // Crear el sitio en la base de datos
    const nuevoSitio = await createSitio({
      usuario: data.username,
      titulo: data.title,
      url: data.url
    });
    
    return new Sitio(
      nuevoSitio.id, 
      nuevoSitio.usuario, 
      nuevoSitio.titulo, 
      nuevoSitio.url, 
      nuevoSitio.ultimaRevision, 
      nuevoSitio.fechaInicio
    );
  }

  static async updateTimeSitio(data) {
    if (!data.url) {
      throw new Error("El campo 'url' es requerido");
    }
    
    const ultimaRevision = new Date().getTime();
    const sitioActualizado = await updateSitio({ 
      ultimaRevision, 
      url: data.url 
    });
    
    return new Sitio(
      sitioActualizado.id, 
      sitioActualizado.usuario, 
      sitioActualizado.titulo, 
      sitioActualizado.url, 
      sitioActualizado.ultimaRevision, 
      sitioActualizado.fechaInicio
    );
  }
};