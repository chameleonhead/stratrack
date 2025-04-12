import { useMemo } from "react";
import { cn } from "../utils";
import { useLocalValue } from "../hooks/useLocalValue";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
};

export type TabProps = {
  tabs: TabItem[];
  selectedIndex?: number;
  onSelectedIndexChnage?: (selectedIndex: number) => void;
};

export default function Tab({ tabs, selectedIndex, onSelectedIndexChnage }: TabProps) {
  const [localValue, setLocalValue] = useLocalValue(0, selectedIndex, onSelectedIndexChnage);
  return (
    <div className="w-full">
      {/* モバイル対応の横スクロール */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max border-b border-gray-200">
          {useMemo(
            () =>
              tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  className={cn(
                    "min-w-[96px] whitespace-nowrap px-4 py-2 -mb-px text-sm font-medium border-b-2 transition",
                    tab.disabled && "cursor-not-allowed text-gray-300",
                    tab.disabled
                      ? ""
                      : tab.error && localValue === i
                        ? "border-red-500 text-red-600"
                        : tab.error
                          ? "border-red-400 text-red-500 hover:text-red-600 hover:border-red-300"
                          : localValue === i
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300"
                  )}
                  onClick={() => setLocalValue(i)}
                  disabled={tab.disabled}
                  aria-disabled={tab.disabled}
                >
                  {tab.label}
                </button>
              )),
            [tabs, localValue, setLocalValue]
          )}
        </div>
      </div>

      <div className="mt-4">{tabs[localValue]?.content}</div>
    </div>
  );
}
