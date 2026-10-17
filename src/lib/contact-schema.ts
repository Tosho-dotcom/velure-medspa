import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().pipe(z.email("Please enter a valid email")),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{7,20}$/, "Please enter a valid phone number")
    .or(z.literal(""))
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(1000, "Please keep it under 1000 characters"),
  company: z.string().max(0).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;
