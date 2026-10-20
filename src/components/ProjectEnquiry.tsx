"use client";

import Image from "next/image";
import CountrySelect from "./CountrySelect";
import { studioContact } from "@/lib/contact";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  applications,
  enquiryFields,
  MAX_UPLOAD_BYTES,
  projectTypes,
  UPLOAD_ACCEPT,
  UPLOAD_HELP,
  type EnquiryErrors,
  type EnquiryField,
} from "../lib/enquiry-config";
import styles from "./ProjectEnquiry.module.css";

type Availability = "checking" | "available" | "unavailable";
type Submission = "idle" | "pending" | "error" | "success";

async function fetchAvailability(
  signal?: AbortSignal,
): Promise<Availability | null> {
  try {
    const result = await fetch("/api/enquiry", { cache: "no-store", signal });
    if (!result.ok) return "unavailable";
    const data = await result.json();
    return data.available === true ? "available" : "unavailable";
  } catch {
    return signal?.aborted ? null : "unavailable";
  }
}

export default function ProjectEnquiry() {
  const formRef = useRef<HTMLFormElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [availability, setAvailability] = useState<Availability>("checking");
  const [submission, setSubmission] = useState<Submission>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [projectType, setProjectType] = useState("Not sure yet");
  const [application, setApplication] = useState("Not sure yet");
  const [country, setCountry] = useState("");
  const [reference, setReference] = useState("");
  const [idea, setIdea] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetchAvailability(controller.signal).then((value) => {
      if (value && !controller.signal.aborted) setAvailability(value);
    });
    const applyContext = (detail: {
      projectType?: unknown;
      application?: unknown;
    }) => {
      if (
        typeof detail.projectType === "string" &&
        detail.projectType.length <= 120
      )
        setProjectType(detail.projectType);
      if (
        typeof detail.application === "string" &&
        detail.application.length <= 120
      )
        setApplication(detail.application);
      if (detailsRef.current) detailsRef.current.open = true;
    };
    const listener = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail && typeof detail === "object") applyContext(detail);
    };
    window.addEventListener("vavi:application", listener);
    // Apply incoming browser URL context after hydration; the server renders neutral defaults.
    const contextFrame = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.has("application") || params.has("projectType"))
        applyContext({
          projectType: params.get("projectType"),
          application: params.get("application"),
        });
      const productId = params.get("product");
      if (productId) {
        // Resolve a known catalogue identity rather than trusting arbitrary URL copy.
        void import("@/lib/brochure-products").then(({ brochureProducts }) => {
          if (controller.signal.aborted) return;
          const product = brochureProducts.find((item) => item.id === productId);
          if (product) setIdea((current) => current || `I’m interested in ${product.name} from ${product.collection} (brochure page ${product.sourcePage}). I’d like to discuss this tile for my space.`);
        });
      }
    });
    return () => {
      controller.abort();
      cancelAnimationFrame(contextFrame);
      window.removeEventListener("vavi:application", listener);
    };
  }, []);

  const errorFor = (field: EnquiryField) =>
    errors[field] ? (
      <span className={styles.fieldError} id={`enquiry-${field}-error`}>
        {errors[field]}
      </span>
    ) : null;
  const describedBy = (field: EnquiryField, extra?: string) =>
    [extra, errors[field] ? `enquiry-${field}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      submission === "pending" ||
      submission === "success" ||
      availability !== "available"
    )
      return;
    const body = new FormData(event.currentTarget);
    const file = body.get("inspiration");
    if (file && typeof file !== "string" && file.size > MAX_UPLOAD_BYTES) {
      setErrors({ inspiration: "Please choose a file no larger than 5 MB." });
      setSubmission("error");
      setMessage(
        "Please check your inspiration file. Your idea has not been sent.",
      );
      if (detailsRef.current) detailsRef.current.open = true;
      formRef.current
        ?.querySelector<HTMLInputElement>('[name="inspiration"]')
        ?.focus();
      return;
    }
    setSubmission("pending");
    setErrors({});
    setMessage("Sending your project enquiry…");
    try {
      const result = await fetch("/api/enquiry", {
        method: "POST",
        body,
        signal: AbortSignal.timeout(20_000),
      });
      const data = await result.json();
      if (!result.ok) {
        const nextErrors = data.errors ?? {};
        setErrors(nextErrors);
        setSubmission("error");
        setMessage(
          typeof data.message === "string"
            ? data.message
            : "We could not confirm receipt. Please try again later.",
        );
        if (result.status === 503) setAvailability("unavailable");
        if (
          Object.keys(nextErrors).some(
            (key) => !["name", "email", "idea"].includes(key),
          ) &&
          detailsRef.current
        )
          detailsRef.current.open = true;
        const firstError = Object.keys(nextErrors)[0];
        requestAnimationFrame(() => {
          const field =
            firstError && document.getElementById(`enquiry-${firstError}`);
          if (field instanceof HTMLElement) field.focus();
          else messageRef.current?.focus();
        });
        return;
      }
      setSubmission("success");
      setMessage(
        data.message || "Thank you. Your project enquiry has been received.",
      );
      setReference(data.reference ?? "");
      requestAnimationFrame(() => messageRef.current?.focus());
    } catch {
      setSubmission("error");
      setMessage(
        "We could not confirm receipt. Your information is still here; check your connection and try again later.",
      );
      requestAnimationFrame(() => messageRef.current?.focus());
    }
  }

  const extendedProjects = projectTypes.includes(
    projectType as (typeof projectTypes)[number],
  )
    ? projectTypes
    : [...projectTypes, projectType];
  const extendedApplications = applications.includes(
    application as (typeof applications)[number],
  )
    ? applications
    : [...applications, application];

  return (
    <section
      id="enquiry"
      className={styles.section}
      aria-labelledby="enquiry-heading"
    >
      <div className={styles.surface}>
        <div className={styles.intro}>
          <div className={styles.introCopy} data-motion="quiet">
            <p className={styles.eyebrow} data-motion-item>
              Your next project
            </p>
            <h2 id="enquiry-heading" data-motion-item>
              Let’s shape <span>your space.</span>
            </h2>
            <p className={styles.invitation} data-motion-item>
              Tell us about your space and the tile you have in mind.
            </p>
            <address className={styles.contact} aria-label="Contact VAVI Tile Studio" data-motion-item>
              <a href={`mailto:${studioContact.email}`}>{studioContact.email}</a>
              <a href={studioContact.phoneHref}>{studioContact.phone}</a>
            </address>
          </div>
          <div className={styles.relief} aria-hidden="true">
            <Image
              src="/images/enquiry/forest-relief.webp"
              alt=""
              fill
              sizes="(max-width: 1620px) 38.2vw, 620px"
              className={styles.reliefImage}
            />
          </div>
        </div>
        <div className={styles.formColumn} data-motion="quiet">
          <div className={styles.formHeading} data-motion-item>
            <p>Project enquiry</p>
            <span>Begin with three details.</span>
          </div>
          <div
            aria-live="polite"
            className={styles.availability}
            data-unavailable={availability === "unavailable" || undefined}
          >
            {availability === "checking" && <p>Checking enquiry availability…</p>}
            {availability === "unavailable" && (
              <p>
                Online enquiries are currently unavailable. Your idea has not been
                sent.{" "}
                <button
                  type="button"
                  className={styles.check}
                  onClick={() => {
                    setAvailability("checking");
                    void fetchAvailability().then(
                      (value) => value && setAvailability(value),
                    );
                  }}
                >
                  Check availability
                </button>
              </p>
            )}
          </div>
          <noscript>
            <p className={styles.notice}>
              JavaScript is needed to check availability and send this form.
              Enable it and reload to continue.
            </p>
          </noscript>
          <form
            ref={formRef}
            onSubmit={submit}
            onInvalidCapture={(event) => {
              const field = event.target;
              if (
                field instanceof HTMLInputElement ||
                field instanceof HTMLTextAreaElement
              ) {
                setErrors((current) => ({
                  ...current,
                  [field.name]: field.validationMessage,
                }));
                setSubmission("error");
                setMessage(
                  "Please check the highlighted fields. Your enquiry has not been sent.",
                );
                if (
                  !["name", "email", "idea"].includes(field.name) &&
                  detailsRef.current
                )
                  detailsRef.current.open = true;
              }
            }}
            onChange={(event) => {
              const field = event.target;
              if (
                field instanceof HTMLInputElement ||
                field instanceof HTMLTextAreaElement ||
                field instanceof HTMLSelectElement
              ) {
                const name = field.name as EnquiryField;
                if (errors[name])
                  setErrors((current) => ({ ...current, [name]: undefined }));
              }
            }}
            className={styles.form}
            data-motion-item
            aria-busy={submission === "pending"}
          >
            <div className={styles.pair}>
              <div className={styles.field}>
                <label htmlFor="enquiry-name">
                  {enquiryFields.name.label}{" "}
                  <span>
                    ({enquiryFields.name.required ? "required" : "optional"})
                  </span>
                </label>
                <input
                  id="enquiry-name"
                  name="name"
                  autoComplete="name"
                  required={enquiryFields.name.required}
                  maxLength={enquiryFields.name.maxLength}
                  aria-invalid={!!errors.name}
                  aria-describedby={describedBy("name")}
                  placeholder="Name"
                />
                {errorFor("name")}
              </div>
              <div className={styles.field}>
                <label htmlFor="enquiry-email">
                  {enquiryFields.email.label}{" "}
                  <span>
                    ({enquiryFields.email.required ? "required" : "optional"})
                  </span>
                </label>
                <input
                  id="enquiry-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required={enquiryFields.email.required}
                  maxLength={enquiryFields.email.maxLength}
                  aria-invalid={!!errors.email}
                  aria-describedby={describedBy("email")}
                  placeholder="you@example.com"
                />
                {errorFor("email")}
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="enquiry-idea">
                {enquiryFields.idea.label}{" "}
                <span>
                  ({enquiryFields.idea.required ? "required" : "optional"})
                </span>
              </label>
              <textarea
                id="enquiry-idea"
                name="idea"
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                rows={3}
                required={enquiryFields.idea.required}
                maxLength={enquiryFields.idea.maxLength}
                aria-invalid={!!errors.idea}
                aria-describedby={describedBy("idea")}
                placeholder="A room, a pattern, an idea…"
              />
              {errorFor("idea")}
            </div>
            <details ref={detailsRef} className={styles.details}>
              <summary>
                <span>
                  Add project details{" "}
                  <span className={styles.optional}>(optional)</span>
                </span>
                <span className={styles.plus} aria-hidden="true">
                  +
                </span>
              </summary>
              <div className={styles.optionalFields}>
                <div className={styles.pair}>
                  <div className={styles.field}>
                    <label htmlFor="enquiry-projectType">Project type</label>
                    <select
                      id="enquiry-projectType"
                      name="projectType"
                      value={projectType}
                      onChange={(event) => setProjectType(event.target.value)}
                      aria-invalid={!!errors.projectType}
                      aria-describedby={describedBy("projectType")}
                    >
                      {extendedProjects.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    {errorFor("projectType")}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="enquiry-application">
                      Intended application
                    </label>
                    <select
                      id="enquiry-application"
                      name="application"
                      value={application}
                      onChange={(event) => setApplication(event.target.value)}
                      aria-invalid={!!errors.application}
                      aria-describedby={describedBy("application")}
                    >
                      {extendedApplications.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    {errorFor("application")}
                  </div>
                </div>
                <div className={styles.pair}>
                  <div className={styles.field}>
                    <label htmlFor="enquiry-location">
                      Project location <span>(country)</span>
                    </label>
                    <CountrySelect
                      id="enquiry-location"
                      name="location"
                      value={country}
                      onChange={(value) => {
                        setCountry(value);
                        if (errors.location)
                          setErrors((current) => ({
                            ...current,
                            location: undefined,
                          }));
                      }}
                      invalid={!!errors.location}
                      describedBy={describedBy("location")}
                    />
                    {errorFor("location")}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="enquiry-dimensions">
                      Approximate dimensions
                    </label>
                    <input
                      id="enquiry-dimensions"
                      name="dimensions"
                      maxLength={160}
                      placeholder="Include units, or leave for later"
                      aria-invalid={!!errors.dimensions}
                      aria-describedby={describedBy("dimensions")}
                    />
                    {errorFor("dimensions")}
                  </div>
                </div>
                <div className={styles.pair}>
                  <div className={styles.field}>
                    <label htmlFor="enquiry-company">Company</label>
                    <input
                      id="enquiry-company"
                      name="company"
                      autoComplete="organization"
                      maxLength={160}
                      aria-invalid={!!errors.company}
                      aria-describedby={describedBy("company")}
                    />
                    {errorFor("company")}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="enquiry-phone">Phone</label>
                    <input
                      id="enquiry-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={50}
                      aria-invalid={!!errors.phone}
                      aria-describedby={describedBy("phone")}
                    />
                    {errorFor("phone")}
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="enquiry-desiredDate">
                    Desired completion date
                  </label>
                  <input
                    id="enquiry-desiredDate"
                    name="desiredDate"
                    type="date"
                    aria-invalid={!!errors.desiredDate}
                    aria-describedby={describedBy("desiredDate", "date-help")}
                  />
                  <span id="date-help" className={styles.help}>
                    A starting point for discussion; timing is reviewed for each
                    project.
                  </span>
                  {errorFor("desiredDate")}
                </div>
                <div className={styles.field}>
                  <label htmlFor="enquiry-inspiration">
                    Share some inspiration
                  </label>
                  <p id="upload-help" className={styles.help}>
                    {UPLOAD_HELP}
                  </p>
                  <input
                    id="enquiry-inspiration"
                    name="inspiration"
                    type="file"
                    accept={UPLOAD_ACCEPT}
                    aria-invalid={!!errors.inspiration}
                    aria-describedby={describedBy("inspiration", "upload-help")}
                  />
                  {errorFor("inspiration")}
                </div>
              </div>
            </details>
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="enquiry-website">Leave this field empty</label>
              <input
                id="enquiry-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <p className={styles.privacy}>
              Share only the details needed to discuss your project. Submitted
              artwork is kept out of the public gallery.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.submit}
                type="submit"
                data-submission={submission}
                disabled={
                  availability !== "available" ||
                  submission === "pending" ||
                  submission === "success"
                }
              >
                {submission === "pending"
                  ? "Sending enquiry…"
                  : submission === "success"
                    ? "Enquiry received"
                    : "Send project enquiry"}
                <span
                  aria-hidden="true"
                  className={submission === "pending" ? styles.spinner : undefined}
                >
                  {submission === "pending" ? "" : submission === "success" ? "✓" : "↗"}
                </span>
              </button>
              {submission === "success" && (
                <button
                  className={styles.check}
                  type="button"
                  onClick={() => {
                    formRef.current?.reset();
                    setProjectType("Not sure yet");
                    setApplication("Not sure yet");
                    setCountry("");
                    setIdea("");
                    setErrors({});
                    setSubmission("idle");
                    setMessage("");
                    setReference("");
                    if (detailsRef.current) detailsRef.current.open = false;
                    formRef.current
                      ?.querySelector<HTMLInputElement>('[name="name"]')
                      ?.focus();
                  }}
                >
                  Start another enquiry
                </button>
              )}
            </div>
            <p
              ref={messageRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`${styles.status} ${submission === "error" ? styles.error : ""} ${submission === "success" ? styles.success : ""}`}
            >
              {message}
              {reference && (
                <span className={styles.reference}>Reference: {reference}</span>
              )}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
