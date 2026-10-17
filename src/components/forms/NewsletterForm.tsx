"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";

import { newsletterSchema, type NewsletterValues } from "@/lib/newsletter-schema";
import { postJSON } from "@/lib/submit";
import { useFormAge } from "@/hooks/useFormAge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PillButton } from "@/components/ui/pill-button";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

type SubscribeResponse = { ok?: boolean; duplicate?: boolean };

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const formAge = useFormAge();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", company: "" },
    mode: "onTouched",
  });

  async function onSubmit(data: NewsletterValues) {
    setStatus("loading");
    try {
      const { status: http, data: res } = await postJSON<SubscribeResponse>(
        process.env.NEXT_PUBLIC_N8N_SUBSCRIBE_WEBHOOK,
        {
          email: data.email,
          company: data.company ?? "",
          source: "velure-web",
          subscribed_at: new Date().toISOString(),
          elapsedMs: formAge(),
        },
        { timeoutMs: 15000 },
      );
      if (http >= 200 && http < 300) {
        setStatus(res?.duplicate ? "duplicate" : "success");
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset disabled={loading} className="min-w-0">
        <Label htmlFor="newsletter-email" className="mb-1 block text-sm text-ink/70">
          Your email
        </Label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="field flex-1">
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              className="h-11 rounded-none border-0 border-b border-current/25 bg-transparent px-0 text-base shadow-none focus-visible:border-b-transparent focus-visible:ring-0 aria-invalid:border-b-destructive aria-invalid:ring-0 placeholder:text-current/40 dark:bg-transparent"
              {...register("email")}
            />
          </div>
          <PillButton type="submit" disabled={loading} className="w-full sm:w-auto">
            <span className="inline-flex items-center gap-2">
              {loading && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
              {loading ? "Subscribing…" : "Subscribe"}
            </span>
          </PillButton>
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

      <div aria-live="polite" className="mt-4 min-h-6 text-[0.9375rem]">
        {errors.email && (
          <p role="alert" className="text-destructive">
            {errors.email.message}
          </p>
        )}
        {status === "success" && (
          <p>You&apos;re on the list. Check your inbox for a welcome note.</p>
        )}
        {status === "duplicate" && <p>You&apos;re already subscribed — thank you.</p>}
        {status === "error" && (
          <p role="alert" className="text-destructive">
            Something went wrong. Please try again in a moment.
          </p>
        )}
      </div>
    </form>
  );
}
