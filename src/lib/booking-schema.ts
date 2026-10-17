import { z } from "zod";
import { SLOTS, isBookableDate } from "@/lib/slots";

export const bookingSchema = z.object({
  treatmentId: z.string().min(1, "Please choose a treatment"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date")
    .refine((v) => isBookableDate(v), {
      message: "Please choose a date from tomorrow, Monday to Saturday",
    }),
  time: z.enum(SLOTS, { error: "Please choose a time" }),
  firstName: z.string().trim().min(1, "Required").max(50),
  lastName: z.string().trim().min(1, "Required").max(50),
  email: z.string().trim().pipe(z.email("Please enter a valid email")),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{7,20}$/, "Please enter a valid phone number"),
  firstVisit: z.boolean(),
  notes: z.string().max(500, "Please keep notes under 500 characters").optional(),
  consent: z.literal(true, { error: "Please confirm to continue" }),
  company: z.string().max(0).optional(),
});

export type BookingValues = z.infer<typeof bookingSchema>;
