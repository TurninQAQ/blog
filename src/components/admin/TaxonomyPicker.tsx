"use client";

import { useId } from "react";
import { Folder, ListOrdered, Tag } from "lucide-react";

export type TaxonomyPickerOption = {
  id: string;
  label: string;
  slug: string;
};

type SingleTaxonomyPickerProps = {
  kind: "category" | "series";
  label: string;
  newLabel: string;
  emptyLabel: string;
  options: TaxonomyPickerOption[];
  value: string;
  newValue: string;
  valueError?: string;
  newValueError?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  onNewValueChange: (value: string) => void;
};

type MultipleTaxonomyPickerProps = {
  kind: "tags";
  label: string;
  newLabel: string;
  options: TaxonomyPickerOption[];
  values: string[];
  newValue: string;
  valuesError?: string;
  newValueError?: string;
  placeholder?: string;
  onValuesChange: (values: string[]) => void;
  onNewValueChange: (value: string) => void;
};

type TaxonomyPickerProps =
  | SingleTaxonomyPickerProps
  | MultipleTaxonomyPickerProps;

const iconByKind = {
  category: Folder,
  tags: Tag,
  series: ListOrdered,
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-2 text-[14px] leading-[1.4] text-[#ff8a8a]"
    >
      {message}
    </p>
  );
}

export function TaxonomyPicker(props: TaxonomyPickerProps) {
  const selectId = useId();
  const inputId = useId();
  const selectErrorId = `${selectId}-error`;
  const inputErrorId = `${inputId}-error`;
  const Icon = iconByKind[props.kind];

  if (props.kind === "tags") {
    return (
      <fieldset
        className="space-y-3"
        aria-invalid={Boolean(props.valuesError)}
        aria-describedby={props.valuesError ? selectErrorId : undefined}
      >
        <legend className="flex items-center gap-2 text-[14px] leading-[1.4] text-lab-text-muted">
          <Icon aria-hidden="true" className="h-4 w-4 text-lab-accent" />
          {props.label}
        </legend>
        {props.options.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {props.options.map((option) => {
              const checked = props.values.includes(option.id);

              return (
                <label
                  key={option.id}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lab border px-3 text-[14px] leading-[1.4] ${
                    checked
                      ? "border-[var(--lab-border-active)] bg-lab-surface-strong text-lab-accent"
                      : "border-[var(--lab-border-hairline)] text-lab-text-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    aria-invalid={Boolean(props.valuesError)}
                    aria-describedby={
                      props.valuesError ? selectErrorId : undefined
                    }
                    className="h-5 w-5 shrink-0 accent-[var(--lab-border-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-border-active)]"
                    onChange={(event) => {
                      if (event.target.checked) {
                        props.onValuesChange([...props.values, option.id]);
                        return;
                      }

                      props.onValuesChange(
                        props.values.filter((value) => value !== option.id),
                      );
                    }}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-[14px] leading-[1.4] text-lab-muted">
            还没有保存的标签。
          </p>
        )}
        <FieldError id={selectErrorId} message={props.valuesError} />
        <div>
          <label
            htmlFor={inputId}
            className="text-[14px] leading-[1.4] text-lab-text-muted"
          >
            {props.newLabel}
          </label>
          <input
            id={inputId}
            value={props.newValue}
            placeholder={props.placeholder}
            aria-invalid={Boolean(props.newValueError)}
            aria-describedby={
              props.newValueError ? inputErrorId : undefined
            }
            className="mt-2 block min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3 text-[16px] leading-[1.5] text-lab-text outline-none transition-colors duration-150 placeholder:text-lab-muted focus:border-[var(--lab-border-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-border-active)]"
            onChange={(event) => props.onNewValueChange(event.target.value)}
          />
          <FieldError id={inputErrorId} message={props.newValueError} />
        </div>
      </fieldset>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={selectId}
          className="flex items-center gap-2 text-[14px] leading-[1.4] text-lab-text-muted"
        >
          <Icon aria-hidden="true" className="h-4 w-4 text-lab-accent" />
          {props.label}
        </label>
        <select
          id={selectId}
          value={props.value}
          aria-invalid={Boolean(props.valueError)}
          aria-describedby={props.valueError ? selectErrorId : undefined}
          className="mt-2 block min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3 text-[16px] leading-[1.5] text-lab-text outline-none transition-colors duration-150 focus:border-[var(--lab-border-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-border-active)]"
          onChange={(event) => props.onValueChange(event.target.value)}
        >
          <option value="">{props.emptyLabel}</option>
          {props.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id={selectErrorId} message={props.valueError} />
      </div>
      <div>
        <label
          htmlFor={inputId}
          className="text-[14px] leading-[1.4] text-lab-text-muted"
        >
          {props.newLabel}
        </label>
        <input
          id={inputId}
          value={props.newValue}
          placeholder={props.placeholder}
          aria-invalid={Boolean(props.newValueError)}
          aria-describedby={props.newValueError ? inputErrorId : undefined}
          className="mt-2 block min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3 text-[16px] leading-[1.5] text-lab-text outline-none transition-colors duration-150 placeholder:text-lab-muted focus:border-[var(--lab-border-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-border-active)]"
          onChange={(event) => props.onNewValueChange(event.target.value)}
        />
        <FieldError id={inputErrorId} message={props.newValueError} />
      </div>
    </div>
  );
}
