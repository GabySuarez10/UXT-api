import { createFeedback, getFeedbackByUrl } from "@/queries/feedbackQueries.js";
import { Feedback } from "@/clases/feedback.js";

export class FeedbackController {
  static async crear(data) {
    if (!data.response) {
      throw new Error("El campo 'response' es obligatorio");
    }
    if (!data.session_id) {
      throw new Error("El campo 'session_id' es obligatorio");
    }
    if (!data.page_url) {
      throw new Error("El campo 'page_url' es obligatorio");
    }
    if (!data.event_type) {
      throw new Error("El campo 'event_type' es obligatorio");
    }

    const res = await createFeedback({
      response: data.response,
      session_id: data.session_id,
      page_url: data.page_url,
      comment: data.comment || null,
      event_type: data.event_type,
    });

    return new Feedback(
      res.id,
      res.timestamp,
      res.response,
      res.session_id,
      res.page_url,
      res.comment,
      res.event_type
    );
  }

  static async listar(url) {
    const feedbacks = await getFeedbackByUrl(url);
    return feedbacks.map(
      (f) =>
        new Feedback(
          f.id,
          f.timestamp,
          f.response,
          f.session_id,
          f.page_url,
          f.comment,
          f.event_type
        )
    );
  }
}
