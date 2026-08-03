"use client";

import { useId } from "react";
import { ListOrdered } from "lucide-react";

type SeriesOrderInputProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function SeriesOrderInput({
  value,
  error,
  onChange,
}: SeriesOrderInputProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 text-[14px] leading-[1.4] text-lab-text-muted"
      >
        <ListOrdered aria-hidden="true" className="h-4 w-4 text-lab-accent" />
        系列排序
      </label>
      <input
        id={inputId}
        type="number"
        min="1"
        inputMode="numeric"
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 block min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3 text-[16px] leading-[1.5] text-lab-text outline-none transition-colors duration-150 placeholder:text-lab-muted focus:border-[var(--lab-border-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-border-active)]"
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-[14px] leading-[1.4] text-[#ff8a8a]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
