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
        <div role="tablist" className="tabs tabs-border">
          {useMemo(
            () =>
              tabs.map((tab, i) => (
                <a
                  key={tab.id}
                  role="tab"
                  className={cn(
                    "tab",
                    localValue === i ? "tab-active" : "",
                    tab.disabled
                      ? "cursor-not-allowed tab-disabled"
                      : tab.error
                        ? "text-warning! border-b-warning"
                        : "text-primary border-b-primary"
                  )}
                  onClick={() => setLocalValue(i)}
                  aria-disabled={tab.disabled}
                  aria-selected={localValue === i}
                >
                  {tab.label}
                </a>
              )),
            [tabs, localValue, setLocalValue]
          )}
        </div>
      </div>

      <div className="mt-4">{tabs[localValue]?.content}</div>
    </div>
  );
}
