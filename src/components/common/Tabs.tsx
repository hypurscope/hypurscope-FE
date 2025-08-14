"use client";
import React, { useCallback, useId, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TabItem = {
  key: string;
  label: string;
  // Optional icon element for label (kept generic)
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
};

export interface TabsProps {
  items: TabItem[];
  value?: string; // controlled value
  defaultValue?: string; // uncontrolled default
  onChange?: (key: string) => void;
  className?: string;
  align?: "start" | "center" | "end";
}

// Tiny spring for subtle motion
const spring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
} as const;

const Tabs = ({
  items,
  value,
  defaultValue,
  onChange,
  className,
  align = "center",
}: TabsProps) => {
  const firstEnabled = useMemo(
    () => items.find((i) => !i.disabled)?.key,
    [items]
  );

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string | undefined>(
    defaultValue ?? firstEnabled
  );
  const active = (isControlled ? value : internal) ?? firstEnabled;

  const setActive = useCallback(
    (key: string) => {
      if (items.find((i) => i.key === key)?.disabled) return;
      if (!isControlled) setInternal(key);
      onChange?.(key);
    },
    [isControlled, onChange, items]
  );

  const groupId = useId();

  return (
    <div>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={`relative flex w-full gap-1 rounded-lg bg-[#F4F4F4] p-1 `}
      >
        {/* Animated active background (shared layoutId) */}
        <div className="relative flex w-full  justify-between gap-1">
          {items.map((item) => {
            const isActive = item.key === active;
            const id = `${groupId}-${item.key}`;
            return (
              <button
                key={item.key}
                id={id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${id}-panel`}
                tabIndex={isActive ? 0 : -1}
                disabled={item.disabled}
                className={`relative rounded-md w-full cursor-pointer px-3 py-2 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#1969FE]/40 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isActive ? "text-black" : "text-[#6B7280] hover:text-black"
                }`}
                onClick={() => setActive(item.key)}
              >
                {/* Active highlight - slides from clicked direction */}
                {isActive && (
                  <motion.div
                    layoutId={`tab-active-${groupId}`}
                    transition={spring}
                    className="absolute inset-0 rounded-md bg-white "
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panels - only render if items have content */}
      {items.some((item) => item.content) && (
        <div className="mt-3">
          <AnimatePresence mode="wait">
            {items.map((item) => {
              const isActive = item.key === active;
              const id = `${groupId}-${item.key}`;
              return (
                isActive &&
                item.content && (
                  <motion.div
                    key={item.key}
                    id={`${id}-panel`}
                    role="tabpanel"
                    aria-labelledby={id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {item.content}
                  </motion.div>
                )
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Tabs;
