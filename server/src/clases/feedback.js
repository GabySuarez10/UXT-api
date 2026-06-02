export class Feedback {
  constructor(id, timestamp, response, session_id, page_url, comment, event_type) {
    this.id = id;
    this.timestamp = timestamp;
    this.response = response;
    this.session_id = session_id;
    this.page_url = page_url;
    this.comment = comment;
    this.event_type = event_type;
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      response: this.response,
      session_id: this.session_id,
      page_url: this.page_url,
      comment: this.comment,
      event_type: this.event_type,
    };
  }
}
