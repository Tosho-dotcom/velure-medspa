"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";

import { contactSchema, type ContactValues } from "@/lib/contact-schema";
import { postJSON } from "@/lib/submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PillButton } from "@/components/ui/pill-button";

type Status = "idle" | "loading" | "success" | "error";

const inputCls =
  "h-11 rounded-none border-0 border-b border-current/25 bg-transparent px-0 text-base shadow-none focus-visible:border-b-transparent focus-visible:ring-0 aria-invalid:border-b-destructive aria-invalid:ring-0 placeholder:text-current/40 dark:bg-transparent";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-destructive">
      {message}
    </p>
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "", company: "" },
    mode: "onTouched",
  });

  async function onSubmit(data: ContactValues) {
    setStatus("loading");
    try {
      const { status: http } = await postJSON(
        process.env.NEXT_PUBLIC_N8N_CONTACT_WEBHOOK,
        {
          name: data.name,
          email: data.email,
          phone: data.phone ?? "",
          message: data.message,
          company: data.company ?? "",
          source: "velure-web",
          submitted_at: new Date().toISOString(),
        },
        { timeoutMs: 15000 },
      );
      if (http >= 200 && http < 300) {
        setStatus("success");
        reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const loading = status === "loading";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-7">
      <fieldset disabled={loading} className="flex min-w-0 flex-col gap-7">
        <div>
          <Label htmlFor="contact-name" className="mb-1 block text-sm text-ink/70">
            Full name
          </Label>
          <div className="field">
            <Input
              id="contact-name"
              autoComplete="name"
              maxLength={80}
              aria-invalid={!!errors.name}
              className={inputCls}
              {...register("name")}
            />
          </div>
          <FieldError message={errors.name?.message} />
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact-email" className="mb-1 block text-sm text-ink/70">
              Email
            </Label>
            <div className="field">
              <Input
                id="contact-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className={inputCls}
                {...register("email")}
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="contact-phone" className="mb-1 block text-sm text-ink/70">
              Phone (optional)
            </Label>
            <div className="field">
              <Input
                id="contact-phone"
                type="tel"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                className={inputCls}
                {...register("phone")}
              />
            </div>
            <FieldError message={errors.phone?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="contact-message" className="mb-1 block text-sm text-ink/70">
            Message
          </Label>
          <div className="field">
            <Textarea
              id="contact-message"
              rows={4}
              maxLength={1000}
              aria-invalid={!!errors.message}
              className="min-h-28 resize-none rounded-none border-0 border-b border-current/25 bg-transparent px-0 text-base shadow-none focus-visible:border-b-transparent focus-visible:ring-0 aria-invalid:border-b-destructive aria-invalid:ring-0 dark:bg-transparent"
              {...register("message")}
            />
          </div>
          <FieldError message={errors.message?.message} />
        </div>

        {/* Honeypot: must stay empty. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          {...register("company")}
        />
      </fieldset>

      <div>
        <PillButton type="submit" disabled={loading} className="w-full sm:w-auto">
          <span className="inline-flex items-center gap-2">
            {loading && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
            {loading ? "Sending…" : "Send message"}
          </span>
        </PillButton>
      </div>

      <div aria-live="polite" className="min-h-6">
        {status === "success" && (
          <p className="text-[0.9375rem]">
            Thank you — your message is with us. A confirmation is on its way to your inbox.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-[0.9375rem] text-destructive">
            Something went wrong. Please try again, or call us at (480) 555-0142.
          </p>
        )}
      </div>
    </form>
  );
}
