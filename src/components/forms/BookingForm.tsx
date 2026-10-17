"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { track } from "@vercel/analytics";
import { CalendarIcon, Loader2Icon } from "lucide-react";

import { bookingSchema, type BookingValues } from "@/lib/booking-schema";
import { bookingTreatmentOptions, getTreatmentName } from "@/lib/treatments";
import {
  SLOTS,
  TIMEZONE,
  bookableRange,
  dateToKey,
  formatDateLabel,
  formatTimeLabel,
  isBookableDate,
  keyToDate,
} from "@/lib/slots";
import { postJSON } from "@/lib/submit";
import { useFormAge } from "@/hooks/useFormAge";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PillButton } from "@/components/ui/pill-button";

const DRAFT_KEY = "velure_booking_draft";

type Status = "idle" | "loading" | "success" | "slot_taken" | "network_error" | "error";

type BookingResponse = {
  ok: boolean;
  bookingId?: string;
  error?: string;
  errors?: Record<string, string>;
};

const defaults: Partial<BookingValues> = {
  treatmentId: "",
  date: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  firstVisit: true,
  notes: "",
  company: "",
};

const inputCls =
  "h-11 rounded-none border-0 border-b border-current/25 bg-transparent px-0 text-base shadow-none focus-visible:border-b-transparent focus-visible:ring-0 aria-invalid:border-b-blush aria-invalid:ring-0 placeholder:text-current/40 dark:bg-transparent";

function readDraft(): Partial<BookingValues> | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<BookingValues>) : null;
  } catch {
    return null;
  }
}

function writeDraft(values: Partial<BookingValues> | null) {
  try {
    if (values === null) sessionStorage.removeItem(DRAFT_KEY);
    else sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    /* storage unavailable: drafts are a nicety, not a requirement */
  }
}

/** Mounted only while the popover is open, so "now" is read on the client. */
function DateCalendar({ value, onPick }: { value?: string; onPick: (key: string) => void }) {
  const { min, max } = bookableRange();
  return (
    <Calendar
      mode="single"
      selected={value ? keyToDate(value) : undefined}
      defaultMonth={keyToDate(value || min)}
      startMonth={keyToDate(min)}
      endMonth={keyToDate(max)}
      disabled={(d) => {
        const key = dateToKey(d);
        return key < min || key > max || d.getDay() === 0;
      }}
      onSelect={(d) => d && onPick(dateToKey(d))}
    />
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-blush">
      {message}
    </p>
  );
}

function BlockTitle({ n, children }: { n: string; children: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3 border-b border-current/15 pb-3">
      <span className="font-display text-sm text-gold-light">{n}</span>
      <h3 className="t-eyebrow opacity-80">{children}</h3>
    </div>
  );
}

export function BookingForm({
  variant = "inline",
  treatmentId,
  autoFocus = false,
  onClose,
}: {
  variant?: "panel" | "inline";
  treatmentId?: string;
  autoFocus?: boolean;
  onClose?: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [taken, setTaken] = useState<Set<string>>(() => new Set());
  const [dateOpen, setDateOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<{ email: string; date: string; time: string } | null>(
    null,
  );

  const formAge = useFormAge();

  const rootRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: defaults as BookingValues,
    mode: "onTouched",
  });
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = form;

  // Restore an unsent draft, then apply any preselected treatment.
  useEffect(() => {
    const draft = readDraft();
    const restored: Partial<BookingValues> = { ...defaults, ...(draft ?? {}) };
    if (restored.date && !isBookableDate(restored.date)) {
      restored.date = "";
      restored.time = undefined;
    }
    if (treatmentId) restored.treatmentId = treatmentId;
    reset(restored as BookingValues);
    restoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (treatmentId) setValue("treatmentId", treatmentId, { shouldDirty: true });
  }, [treatmentId, setValue]);

  // Persist the draft (never consent or the honeypot), once restore has run.
  const values = useWatch({ control }) as Partial<BookingValues>;
  useEffect(() => {
    if (!restoredRef.current) return;
    const { consent, company, ...rest } = values;
    void consent;
    void company;
    writeDraft(rest);
  }, [values]);

  // Panel focus: date trigger when a treatment is preselected, else the select.
  useEffect(() => {
    if (!autoFocus) return;
    const t = window.setTimeout(() => {
      (treatmentId ? dateTriggerRef.current : selectTriggerRef.current)?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [autoFocus, treatmentId]);


  const summary = [
    values.treatmentId ? getTreatmentName(values.treatmentId) : null,
    values.date ? formatDateLabel(values.date) : null,
    values.time ? formatTimeLabel(values.time) : null,
  ].filter(Boolean);

  const isLoading = status === "loading";

  async function onSubmit(data: BookingValues) {
    setStatus("loading");
    const body = {
      ...data,
      notes: data.notes ?? "",
      company: data.company ?? "",
      treatmentName: getTreatmentName(data.treatmentId),
      source: "velure-web",
      submittedAt: new Date().toISOString(),
      elapsedMs: formAge(),
      timezone: TIMEZONE,
    };

    try {
      const { status: http, data: res } = await postJSON<BookingResponse>(
        process.env.NEXT_PUBLIC_N8N_BOOKING_WEBHOOK,
        body,
        { timeoutMs: 15000 },
      );

      if (http === 200 && res?.ok) {
        setConfirmed({ email: data.email, date: data.date, time: data.time });
        setStatus("success");
        writeDraft(null);
        track("booking_submitted");
        return;
      }
      if (http === 409) {
        setTaken((prev) => new Set(prev).add(`${data.date}T${data.time}`));
        setValue("time", undefined as unknown as BookingValues["time"]);
        setStatus("slot_taken");
        return;
      }
      if (http === 400 && res?.errors) {
        let mapped = false;
        for (const [field, message] of Object.entries(res.errors)) {
          if (field in bookingSchema.shape) {
            setError(field as keyof BookingValues, { message });
            mapped = true;
          }
        }
        setStatus(mapped ? "idle" : "error");
        return;
      }
      setStatus("network_error");
    } catch {
      setStatus("network_error");
    }
  }

  function bookAnother() {
    reset({ ...defaults, treatmentId: "" } as BookingValues);
    setConfirmed(null);
    setStatus("idle");
  }

  // Success: cross-fade in, draw the gold check.
  useGSAP(
    () => {
      if (status !== "success" || !successRef.current) return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };
          const check = successRef.current!.querySelector<SVGPathElement>("[data-check]");
          if (reduce) {
            gsap.set(successRef.current, { autoAlpha: 1 });
            if (check) gsap.set(check, { strokeDashoffset: 0 });
            return;
          }
          gsap.fromTo(successRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
          if (check) {
            gsap.fromTo(
              check,
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: 0.9, ease: "power2.out", delay: 0.2 },
            );
          }
        },
      );
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [status] },
  );

  if (status === "success" && confirmed) {
    return (
      <div ref={rootRef}>
        <div ref={successRef} className="flex flex-col items-start gap-6 py-10" aria-live="polite">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <circle cx="28" cy="28" r="27" className="stroke-gold-light/30" strokeWidth="1" />
            <path
              data-check
              d="M17 29.5 L25 37 L40 20"
              className="stroke-gold-light"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
          </svg>
          <h3 className="font-display t-h2 !text-[clamp(2rem,4vw,3rem)]">You&apos;re booked.</h3>
          <p className="max-w-md opacity-80">
            We&apos;ve sent a confirmation to {confirmed.email}. See you on{" "}
            {formatDateLabel(confirmed.date)} at {formatTimeLabel(confirmed.time)}.
          </p>
          <div className="flex flex-wrap gap-3">
            <PillButton variant="secondary" onClick={bookAnother}>
              <span>Add another booking</span>
            </PillButton>
            {onClose && (
              <PillButton variant="primary" onClick={onClose}>
                <span>Close</span>
              </PillButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  const takenForDate = (time: string) => taken.has(`${values.date}T${time}`);

  return (
    <div ref={rootRef}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col">
        <fieldset disabled={isLoading} className="flex min-w-0 flex-col gap-10">
          {/* 01 Treatment */}
          <section>
            <BlockTitle n="01">Treatment</BlockTitle>
            <Label htmlFor={`${variant}-treatment`} className="mb-2 block text-sm opacity-80">
              Treatment
            </Label>
            <Controller
              control={control}
              name="treatmentId"
              render={({ field }) => (
                <Select
                  value={field.value || null}
                  onValueChange={(v) => field.onChange(v ?? "")}
                  items={bookingTreatmentOptions.map((t) => ({ value: t.id, label: t.name }))}
                >
                  <SelectTrigger
                    id={`${variant}-treatment`}
                    ref={selectTriggerRef}
                    aria-invalid={!!errors.treatmentId}
                    aria-describedby={errors.treatmentId ? `${variant}-treatment-err` : undefined}
                    className="h-11 w-full rounded-none border-0 border-b border-current/25 px-0 text-base focus-visible:ring-0 aria-invalid:border-b-blush dark:bg-transparent dark:hover:bg-transparent"
                  >
                    <SelectValue placeholder="Choose a treatment" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} className="min-w-72">
                    {bookingTreatmentOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        <span className="ml-3 text-xs opacity-60">{t.duration}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError id={`${variant}-treatment-err`} message={errors.treatmentId?.message} />
          </section>

          {/* 02 Date & time */}
          <section>
            <BlockTitle n="02">Date &amp; time</BlockTitle>

            <Label htmlFor={`${variant}-date`} className="mb-2 block text-sm opacity-80">
              Preferred date
            </Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger
                    id={`${variant}-date`}
                    ref={dateTriggerRef}
                    aria-invalid={!!errors.date}
                    aria-describedby={errors.date ? `${variant}-date-err` : undefined}
                    className={cn(
                      "flex h-11 w-full items-center justify-between border-b border-current/25 text-left text-base outline-none focus-visible:border-b-gold-light disabled:opacity-50",
                      errors.date && "border-b-blush",
                      !field.value && "opacity-50",
                    )}
                  >
                    <span>{field.value ? formatDateLabel(field.value) : "Choose a date"}</span>
                    <CalendarIcon className="size-4 opacity-70" strokeWidth={1.25} />
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-3">
                    <DateCalendar
                      value={field.value}
                      onPick={(key) => {
                        field.onChange(key);
                        setValue("time", undefined as unknown as BookingValues["time"]);
                        if (status === "slot_taken") setStatus("idle");
                        setDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError id={`${variant}-date-err`} message={errors.date?.message} />

            <p id={`${variant}-time-label`} className="mb-3 mt-7 text-sm opacity-80">
              Preferred time <span className="opacity-60">(Arizona time)</span>
            </p>

            <div aria-live="polite">
              {status === "slot_taken" && (
                <p role="alert" className="mb-3 text-sm text-blush">
                  That time was just taken — please choose another.
                </p>
              )}
            </div>

            <Controller
              control={control}
              name="time"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-labelledby={`${variant}-time-label`}
                  className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                >
                  {SLOTS.map((slot) => {
                    const disabled = !values.date || takenForDate(slot);
                    return (
                      <label key={slot} className="relative">
                        <input
                          type="radio"
                          name={`${variant}-time`}
                          value={slot}
                          checked={field.value === slot}
                          disabled={disabled}
                          onChange={() => {
                            field.onChange(slot);
                            if (status === "slot_taken") setStatus("idle");
                          }}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "flex h-10 cursor-pointer items-center justify-center rounded-full border border-current/25 text-sm transition-colors",
                            "peer-checked:border-gold-light peer-checked:bg-gold-light peer-checked:text-espresso-deep",
                            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-light",
                            "hover:border-gold-light peer-disabled:cursor-not-allowed peer-disabled:opacity-30 peer-disabled:hover:border-current/25",
                            takenForDate(slot) && "line-through",
                          )}
                        >
                          {formatTimeLabel(slot)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            />
            {!values.date && (
              <p className="mt-2 text-sm opacity-60">Choose a date to see available times.</p>
            )}
            <FieldError id={`${variant}-time-err`} message={errors.time?.message} />
          </section>

          {/* 03 Your details */}
          <section>
            <BlockTitle n="03">Your details</BlockTitle>
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${variant}-first`} className="mb-1 block text-sm opacity-80">
                  First name
                </Label>
                <div className="field">
                  <Input
                    id={`${variant}-first`}
                    autoComplete="given-name"
                    maxLength={50}
                    aria-invalid={!!errors.firstName}
                    className={inputCls}
                    {...register("firstName")}
                  />
                </div>
                <FieldError id={`${variant}-first-err`} message={errors.firstName?.message} />
              </div>
              <div>
                <Label htmlFor={`${variant}-last`} className="mb-1 block text-sm opacity-80">
                  Last name
                </Label>
                <div className="field">
                  <Input
                    id={`${variant}-last`}
                    autoComplete="family-name"
                    maxLength={50}
                    aria-invalid={!!errors.lastName}
                    className={inputCls}
                    {...register("lastName")}
                  />
                </div>
                <FieldError id={`${variant}-last-err`} message={errors.lastName?.message} />
              </div>
              <div>
                <Label htmlFor={`${variant}-email`} className="mb-1 block text-sm opacity-80">
                  Email
                </Label>
                <div className="field">
                  <Input
                    id={`${variant}-email`}
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    className={inputCls}
                    {...register("email")}
                  />
                </div>
                <FieldError id={`${variant}-email-err`} message={errors.email?.message} />
              </div>
              <div>
                <Label htmlFor={`${variant}-phone`} className="mb-1 block text-sm opacity-80">
                  Phone
                </Label>
                <div className="field">
                  <Input
                    id={`${variant}-phone`}
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    className={inputCls}
                    {...register("phone")}
                  />
                </div>
                <FieldError id={`${variant}-phone-err`} message={errors.phone?.message} />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor={`${variant}-notes`} className="mb-1 block text-sm opacity-80">
                Anything we should know? (optional)
              </Label>
              <div className="field">
                <Textarea
                  id={`${variant}-notes`}
                  rows={3}
                  maxLength={500}
                  aria-invalid={!!errors.notes}
                  className="min-h-20 resize-none rounded-none border-0 border-b border-current/25 bg-transparent px-0 text-base shadow-none focus-visible:border-b-transparent focus-visible:ring-0 dark:bg-transparent"
                  {...register("notes")}
                />
              </div>
              <FieldError id={`${variant}-notes-err`} message={errors.notes?.message} />
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <Controller
                control={control}
                name="firstVisit"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(v) => field.onChange(!!v)}
                      className="mt-0.5 border-current/40 data-checked:border-gold-light data-checked:bg-gold-light data-checked:text-espresso-deep"
                    />
                    <span>This is my first visit to Velure</span>
                  </label>
                )}
              />

              <Controller
                control={control}
                name="consent"
                render={({ field }) => (
                  <div>
                    <label className="flex cursor-pointer items-start gap-3 text-sm">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(v) => field.onChange(v === true ? true : undefined)}
                        aria-invalid={!!errors.consent}
                        className="mt-0.5 border-current/40 data-checked:border-gold-light data-checked:bg-gold-light data-checked:text-espresso-deep"
                      />
                      <span>
                        I agree to be contacted by email about this appointment. Velure is a demo
                        project by Thaus.
                      </span>
                    </label>
                    <FieldError id={`${variant}-consent-err`} message={errors.consent?.message} />
                  </div>
                )}
              />
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
          </section>
        </fieldset>

        <div aria-live="polite" className="mt-6 min-h-6">
          {status === "network_error" && (
            <p role="alert" className="text-sm text-blush">
              We couldn&apos;t reach our booking system. Please try again, or call (480) 555-0142.
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="text-sm text-blush">
              Something went wrong. Please check your details and try again.
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 border-t border-current/15 py-4 sm:flex-row sm:items-center sm:justify-between",
            variant === "panel" &&
              "sticky bottom-0 z-10 -mx-6 bg-espresso-deep/95 px-6 backdrop-blur-md sm:-mx-8 sm:px-8",
          )}
        >
          <p className="min-h-6 text-sm opacity-80" aria-live="polite">
            {summary.length ? summary.join(" · ") : "Select a treatment, date and time"}
          </p>
          <PillButton type="submit" disabled={isLoading} className="w-full sm:w-auto">
            <span className="inline-flex items-center gap-2">
              {isLoading && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
              {isLoading ? "Confirming…" : "Confirm booking"}
            </span>
          </PillButton>
        </div>
      </form>
    </div>
  );
}
