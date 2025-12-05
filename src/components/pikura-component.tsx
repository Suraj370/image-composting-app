import * as React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { StripTheme } from "@/types/pikura";

// Theme Option Component
type ThemeOptionProps = {
  value: StripTheme;
  label: string;
  description: string;
};

export function ThemeOption({ value, label, description }: ThemeOptionProps) {
  return (
    <Label className="flex cursor-pointer items-start gap-2 rounded-xl border bg-card px-3 py-2 text-xs hover:bg-accent/60">
      <RadioGroupItem value={value} className="mt-0.5" />
      <span className="flex flex-col">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[10px] text-muted-foreground">{description}</span>
      </span>
    </Label>
  );
}

// Strip Remove Button Component
type StripRemoveButtonProps = {
  index: number;
  onRemove: () => void;
};

export function StripRemoveButton({ index, onRemove }: StripRemoveButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className={cn(
        "absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-[10px] font-semibold text-white shadow-sm",
        "hover:bg-black/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      )}
      aria-label={`Remove frame ${index + 1}`}
    >
      ×
    </button>
  );
}