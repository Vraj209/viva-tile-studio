"use client";

import { useState } from "react";

export default function PasswordField({ name = "password", label = "Password", autoComplete = "current-password", minLength }: {
  name?: string; label?: string; autoComplete?: string; minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return <div className="field"><label htmlFor={name}>{label}</label><div className="password-field">
    <input id={name} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={minLength} maxLength={128} />
    <button type="button" onClick={() => setVisible(!visible)} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible}>{visible ? "Hide" : "Show"}</button>
  </div></div>;
}
