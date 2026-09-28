"use client";

import Image from "next/image";
import CountrySelect from "./CountrySelect";
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
    setMessage("Sending your idea…");
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
      setMessage(data.message);
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
      <div className={styles.intro}>
        <p className={styles.eyebrow}>07 — A conversation begins</p>
        <h2 id="enquiry-heading">
          Let’s Turn Your
          <br />
          Idea Into Tile.
        </h2>
        <p className={styles.invitation}>
          A sketch. A photograph. A thought you keep coming back to. An idea is
          enough to start the conversation.
        </p>
        <div className={styles.artwork}>
          <Image
            src="/images/midnight-garden.webp"
            alt="Midnight Garden botanical tile design"
            width={184}
            height={184}
            sizes="(max-width: 700px) 96px, 132px"
          />
          <p>
            Your idea.
            <br />
            Your tile.
            <br />
            Your space.
          </p>
        </div>
      </div>
      <div className={styles.formColumn}>
        <div aria-live="polite" className={styles.availability}>
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
          {availability === "available" && (
            <p>Begin with three details. Everything else can follow.</p>
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
          className={styles.form}
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
              rows={3}
              required={enquiryFields.idea.required}
              maxLength={enquiryFields.idea.maxLength}
              aria-invalid={!!errors.idea}
              aria-describedby={describedBy("idea")}
              placeholder="The space, the feeling, the possibility…"
            />
            {errorFor("idea")}
          </div>
          <details ref={detailsRef} className={styles.details}>
            <summary>
              <span>
                A little more about your project{" "}
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
                    onChange={setCountry}
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
              disabled={
                availability !== "available" ||
                submission === "pending" ||
                submission === "success"
              }
            >
              {submission === "pending"
                ? "Sending your idea…"
                : submission === "success"
                  ? "Enquiry received"
                  : "Share your idea"}
              <span aria-hidden="true">↗</span>
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
                  setSubmission("idle");
                  setMessage("");
                  setReference("");
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
            className={`${styles.status} ${submission === "error" ? styles.error : ""}`}
          >
            {message}
            {reference && (
              <span className={styles.reference}>Reference: {reference}</span>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
