import { cn } from "@/lib/utils";
import type { Ingredient } from "@/types";
import { useId, useRef, useState } from "react";
import { Input } from "./input";

/**
 * Headless combobox for ingredient name entry with keyboard support.
 */
export function IngredientCombobox({
  id,
  value,
  suggestions,
  inputRef,
  onBlur,
  onChange,
  onSelect,
  className,
  ariaDescribedBy,
  ariaInvalid,
}: {
  id: string;
  value: string;
  suggestions: Ingredient[];
  inputRef?: React.Ref<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange: (value: string) => void;
  onSelect?: (ingredient: Ingredient) => void;
  className?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const activeOption = suggestions[highlightedIndex];

  // Open the popup only when there are suggestions to show.
  function openSuggestions() {
    if (suggestions.length === 0) {
      return;
    }

    setHighlightedIndex(0);
    setIsOpen(true);
  }

  // Close the popup and reset highlight so reopening starts from the top.
  function closeSuggestions() {
    setIsOpen(false);
    setHighlightedIndex(0);
  }

  // Selecting a suggestion updates the input and lets the parent apply related fields.
  function selectSuggestion(ingredient: Ingredient) {
    onChange(ingredient.name);
    onSelect?.(ingredient);
    closeSuggestions();
  }

  // Keep the popup open while navigating and commit a highlighted suggestion on Enter.
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        openSuggestions();
        return;
      }

      setHighlightedIndex((currentIndex) => {
        if (suggestions.length === 0) {
          return 0;
        }

        return (currentIndex + 1) % suggestions.length;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        openSuggestions();
        return;
      }

      setHighlightedIndex((currentIndex) => {
        if (suggestions.length === 0) {
          return 0;
        }

        return (currentIndex - 1 + suggestions.length) % suggestions.length;
      });
      return;
    }

    if (event.key === "Enter" && isOpen && activeOption) {
      event.preventDefault();
      selectSuggestion(activeOption);
      return;
    }

    if (event.key === "Escape") {
      closeSuggestions();
    }
  }

  // Close the popup when focus leaves the combobox container.
  function handleContainerBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (containerRef.current?.contains(event.relatedTarget)) {
      return;
    }

    closeSuggestions();
  }

  return (
    <div ref={containerRef} className="relative" onBlur={handleContainerBlur}>
      <Input
        id={id}
        ref={inputRef}
        value={value}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-activedescendant={
          isOpen && activeOption
            ? `${listboxId}-${highlightedIndex}`
            : undefined
        }
        aria-invalid={ariaInvalid}
        onBlur={onBlur}
        onFocus={openSuggestions}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className={cn("pr-8", className)}
      />
      <span
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs"
      >
        {isOpen ? "⏶" : "⏷"}
      </span>
      {isOpen && suggestions.length > 0 ? (
        <div
          id={listboxId}
          role="listbox"
          className="bg-surface absolute z-20 mt-3 max-h-64 w-full overflow-y-auto rounded-md border p-1 shadow-lg"
        >
          {suggestions.map((ingredient, index) => (
            <button
              type="button"
              key={ingredient.id}
              id={`${listboxId}-${index}`}
              role="option"
              tabIndex={-1}
              aria-selected={highlightedIndex === index}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-left text-sm",
                highlightedIndex === index && "bg-input",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectSuggestion(ingredient)}
            >
              <span>{ingredient.name}</span>
              {ingredient.defaultUnit ? (
                <span className="text-muted-foreground text-xs uppercase">
                  {ingredient.defaultUnit}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
