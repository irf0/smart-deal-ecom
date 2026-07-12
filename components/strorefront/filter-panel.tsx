"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CONDITIONS,
  BRANDS,
  RAM,
  STORAGE,
  NETWORK,
  OS_LIST,
  COLORS,
  SORT_OPTIONS,
  CONDITION_LABELS,
} from "@/lib/constants/products";
import type { useQueryStates } from "nuqs";
import type { filterParsers } from "@/lib/store/filter-parsers";

type FilterState = ReturnType<typeof useQueryStates<typeof filterParsers>>[0];
type FilterSetters = ReturnType<typeof useQueryStates<typeof filterParsers>>[1];

function chipClass(active: boolean) {
  return `px-2.5 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
    active
      ? "bg-accent text-white border-accent"
      : "bg-surface text-gray-600 border-gray-300 hover:border-accent-hover hover:text-accent"
  }`;
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-gray-100 last:border-0 py-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-2"
      >
        {title}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {open && children}
    </div>
  );
}

function StringChips({
  options,
  labels,
  selected,
  onChange,
  disabled,
}: {
  options: string[];
  labels?: Record<string, string>;
  selected: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  function toggle(opt: string) {
    if (disabled) return;
    onChange(
      selected.includes(opt)
        ? selected.filter((x) => x !== opt)
        : [...selected, opt],
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          disabled={disabled}
          className={chipClass(selected.includes(opt))}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

function NumberChips({
  options,
  unit,
  selected,
  onChange,
  disabled,
}: {
  options: number[];
  unit: string;
  selected: number[];
  onChange: (v: number[]) => void;
  disabled?: boolean;
}) {
  function toggle(opt: number) {
    if (disabled) return;
    onChange(
      selected.includes(opt)
        ? selected.filter((x) => x !== opt)
        : [...selected, opt],
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          disabled={disabled}
          className={chipClass(selected.includes(opt))}
        >
          {opt >= 1024 ? `${opt / 1024}TB` : `${opt}${unit}`}
        </button>
      ))}
    </div>
  );
}

export function FilterPanel({
  state,
  set,
  onClose,
  isMobile,
  disabled,
}: {
  state: FilterState;
  set: FilterSetters;
  onClose?: () => void;
  isMobile?: boolean;
  disabled?: boolean;
}) {
  const activeCount =
    [
      ...state.conditions,
      ...state.brands,
      ...state.rams,
      ...state.storages,
      ...state.networks,
      ...state.os,
      ...state.colors,
    ].length + (state.minPrice || state.maxPrice ? 1 : 0);

  function clearAll() {
    set({
      conditions: [],
      brands: [],
      rams: [],
      storages: [],
      networks: [],
      os: [],
      colors: [],
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      category: "All",
      q: "",
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              disabled={disabled}
              className="text-xs text-accent font-medium hover:underline disabled:opacity-40"
            >
              Clear all
            </button>
          )}

          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <FilterSection title="Sort by">
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => !disabled && set({ sort: opt.value })}
                disabled={disabled}
                className={`text-left text-xs px-3 py-2 rounded-xl transition-colors font-medium disabled:opacity-40 ${
                  state.sort === opt.value
                    ? "bg-accent text-white border-accent"
                    : "bg-surface text-gray-600 border-gray-300 hover:border-accent-hover hover:text-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Price Range">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Min ₹"
              type="number"
              min={0}
              value={state.minPrice}
              onChange={(e) => set({ minPrice: e.target.value })}
              disabled={disabled}
              className="h-8 text-xs rounded-lg border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-accent focus-visible:border-accent disabled:opacity-40"
            />
            <span className="text-gray-400 text-xs shrink-0">—</span>
            <Input
              placeholder="Max ₹"
              type="number"
              min={0}
              value={state.maxPrice}
              onChange={(e) => set({ maxPrice: e.target.value })}
              disabled={disabled}
              className="h-8 text-xs rounded-lg border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-accent focus-visible:border-accent disabled:opacity-40"
            />
          </div>

          {state.minPrice &&
            state.maxPrice &&
            Number(state.minPrice) > Number(state.maxPrice) && (
              <p className="text-red-500 text-[10px] mt-1.5">
                {"Min price can't exceed max price"}
              </p>
            )}
        </FilterSection>

        <FilterSection title="Grade">
          <StringChips
            options={[...CONDITIONS]}
            labels={CONDITION_LABELS}
            selected={state.conditions}
            onChange={(v) => set({ conditions: v })}
            disabled={disabled}
          />
        </FilterSection>

        <FilterSection title="Brand">
          <StringChips
            options={BRANDS}
            selected={state.brands}
            onChange={(v) => set({ brands: v })}
            disabled={disabled}
          />
        </FilterSection>

        <FilterSection title="RAM">
          <NumberChips
            options={RAM}
            unit="GB"
            selected={state.rams}
            onChange={(v) => set({ rams: v })}
            disabled={disabled}
          />
        </FilterSection>

        <FilterSection title="Storage">
          <NumberChips
            options={STORAGE}
            unit="GB"
            selected={state.storages}
            onChange={(v) => set({ storages: v })}
            disabled={disabled}
          />
        </FilterSection>

        <FilterSection title="Network">
          <StringChips
            options={NETWORK}
            selected={state.networks}
            onChange={(v) => set({ networks: v })}
            disabled={disabled}
          />
        </FilterSection>

        <FilterSection title="OS">
          <StringChips
            options={OS_LIST}
            selected={state.os}
            onChange={(v) => set({ os: v })}
            disabled={disabled}
          />
        </FilterSection>

        <FilterSection title="Color">
          <StringChips
            options={COLORS}
            selected={state.colors}
            onChange={(v) => set({ colors: v })}
            disabled={disabled}
          />
        </FilterSection>
      </div>

      {isMobile && onClose && (
        <div className="px-4 py-3 border-t border-gray-200 shrink-0">
          <Button
            onClick={onClose}
            className="w-full bg-accent hover:bg-accent-hover text-white rounded-xl h-11"
          >
            Show results
          </Button>
        </div>
      )}
    </div>
  );
}
