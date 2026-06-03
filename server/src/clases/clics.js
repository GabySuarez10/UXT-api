export class Clic {
  constructor(
    id,
    uid,
    url,
    dominio,
    elemento,
    posicion_x,
    posicion_y,
    timestamp,
    created_at,
    viewport_width,
    viewport_height,
  ) {
    this.id = id;
    this.uid = uid;
    this.url = url;
    this.dominio = dominio;
    this.elemento = elemento;
    this.posicion_x = posicion_x;
    this.posicion_y = posicion_y;
    this.timestamp = timestamp;
    this.created_at = created_at;
    this.viewport_width = viewport_width;
    this.viewport_height = viewport_height;
  }

  toJSON() {
    return {
      id: this.id,
      uid: this.uid,
      url: this.url,
      dominio: this.dominio,
      elemento: this.elemento,
      posicion_x: this.posicion_x,
      posicion_y: this.posicion_y,
      timestamp: this.timestamp,
      created_at: this.created_at,
      viewport_width: this.viewport_width,
      viewport_height: this.viewport_height,
    };
  }
}
