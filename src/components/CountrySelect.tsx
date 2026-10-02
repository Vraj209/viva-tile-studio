"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { countries, filterCountries } from "../lib/countries";
import styles from "./CountrySelect.module.css";

type Props = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
};

export default function CountrySelect({
  id,
  name,
  value,
  onChange,
  invalid,
  describedBy,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [above, setAbove] = useState(false);
  const results = filterCountries(query ?? "");
  const activeIndex = results.findIndex(
    (country) => country.code === activeCode,
  );
  const listId = `${id}-countries`;

  function showCountries() {
    setQuery(null);
    setActiveCode(
      countries.find((country) => country.name === value)?.code ?? null,
    );
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery(null);
    setActiveCode(null);
  }

  function choose(countryName: string) {
    onChange(countryName);
    inputRef.current?.focus();
    close();
  }

  useEffect(() => {
    if (!open) return;
    const position = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewport = window.visualViewport;
      const bottom = viewport
        ? viewport.height + viewport.offsetTop
        : window.innerHeight;
      const availableBelow = bottom - rect.bottom;
      setAbove(availableBelow < 300 && rect.top > availableBelow);
    };
    position();
    window.addEventListener("resize", position);
    window.visualViewport?.addEventListener("resize", position);
    return () => {
      window.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("resize", position);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !activeCode) return;
    const list = listRef.current;
    const option = document.getElementById(`${id}-country-${activeCode}`);
    if (!list || !option) return;
    const listRect = list.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    // Scroll only the options, leaving the page and the text field in place.
    if (optionRect.top < listRect.top)
      list.scrollTop += optionRect.top - listRect.top;
    else if (optionRect.bottom > listRect.bottom)
      list.scrollTop += optionRect.bottom - listRect.bottom;
  }, [activeCode, id, open]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (!results.length) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next =
        activeIndex < 0
          ? direction === 1
            ? 0
            : results.length - 1
          : (activeIndex + direction + results.length) % results.length;
      setActiveCode(results[next].code);
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      if (activeIndex >= 0) choose(results[activeIndex].name);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Tab") {
      close();
    }
  }

  return (
    <div
      ref={rootRef}
      className={styles.countrySelect}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <input type="hidden" name={name} value={value} />
      <div className={styles.control} data-invalid={invalid || undefined}>
        <input
          ref={inputRef}
          className={styles.searchInput}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-country-${activeCode}` : undefined
          }
          aria-invalid={invalid}
          aria-describedby={describedBy}
          autoComplete="off"
          spellCheck={false}
          maxLength={100}
          placeholder="Search countries…"
          value={query ?? value}
          onFocus={showCountries}
          onClick={() => {
            if (!open) showCountries();
          }}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setActiveCode(filterCountries(nextQuery)[0]?.code ?? null);
            setOpen(true);
            if (!nextQuery) onChange("");
          }}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear country"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              inputRef.current?.focus();
              onChange("");
              setQuery("");
              setActiveCode(null);
              setOpen(true);
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          className={styles.toggle}
          aria-label={open ? "Close countries" : "Show countries"}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            inputRef.current?.focus();
            if (open) close();
            else showCountries();
          }}
        >
          <span
            className={styles.chevron}
            data-open={open}
            aria-hidden="true"
          />
        </button>
      </div>
      {open && (
        <div className={styles.menu} data-above={above}>
          <p
            className={styles.resultCount}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {results.length
              ? `${results.length} ${results.length === 1 ? "country or territory" : "countries and territories"}`
              : "No countries found. Try another name or code."}
          </p>
          <ul
            data-lenis-prevent
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Countries and territories"
            className={styles.options}
          >
            {results.map((country) => (
              <li
                id={`${id}-country-${country.code}`}
                key={country.code}
                role="option"
                aria-selected={value === country.name}
                data-active={activeCode === country.code}
                className={styles.option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(country.name)}
              >
                <span>{country.name}</span>
                {value === country.name && <span aria-hidden="true">✓</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
