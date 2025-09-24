// src/app/api/todos/schema.ts
import { url } from "inspector";
import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  url:  z.string().min(1, "El url es obligatorio"),
  dominio: z.string().min(1, "El domnio es obligatorio"),
  timestamp: z.date().min(1, "la fecha es obligatorio"),
  userAgent:z.string().min(1, "no se pero es obligatorio"),
  referrer: z.string().min(1, "tampoco se pero es obligatorio"),
  
});

// Si quieres también un esquema para update:
export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
 
});
