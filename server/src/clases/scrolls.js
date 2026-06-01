export class Scroll {
  constructor(
    id,
    uid,
    url,
    dominio,
    scroll_x,
    scroll_y,
    porcentaje_scroll,
    timestamp,
    created_at,
  ) {
    this.id = id;
    this.uid = uid;
    this.url = url;
    this.dominio = dominio;
    this.scroll_x = scroll_x;
    this.scroll_y = scroll_y;
    this.porcentaje_scroll = porcentaje_scroll;
    this.timestamp = timestamp;
    this.created_at = created_at;
  }

  toJSON() {
    return {
      id: this.id,
      uid: this.uid,
      url: this.url,
      dominio: this.dominio,
      scroll_x: this.scroll_x,
      scroll_y: this.scroll_y,
      porcentaje_scroll: this.porcentaje_scroll,
      timestamp: this.timestamp,
      created_at: this.created_at,
    };
  }
}
