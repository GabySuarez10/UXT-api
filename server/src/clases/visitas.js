export class Visita {
  constructor(id, uid, recurrente, title, url, dominio, userAgent, referrer, ultimavisita, created_at) {
    this.id = id;
    this.uid = uid;
    this.recurrente = recurrente;
    this.title = title;
    this.url = url;
    this.dominio = dominio;
    this.userAgent = userAgent;
    this.referrer = referrer;
    this.ultimavisita = ultimavisita;
    this.created_at = created_at;
  }

  // Método para convertir a objeto plano
  toJSON() {
    return {
      id: this.id,
      uid: this.uid,
      recurrente: this.recurrente,
      title: this.title,
      url: this.url,
      dominio: this.dominio,
      userAgent: this.userAgent,
      referrer: this.referrer,
      ultimavisita: this.ultimavisita,
      created_at: this.created_at
    };
  }
}