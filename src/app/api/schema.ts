// src/app/api/todos/schema.ts
import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  link:  z.string().min(1, "El link es obligatorio"),
  completed: z.boolean().optional(),
});

// Si quieres también un esquema para update:
export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});
