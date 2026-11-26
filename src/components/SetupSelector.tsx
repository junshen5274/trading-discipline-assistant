import { Panel } from "@/components/Panel";
import { setups, type SetupType } from "@/types/trade";

type SetupSelectorProps = {
  selected: SetupType;
  onSelect: (setup: SetupType) => void;
};

export function SetupSelector({ selected, onSelect }: SetupSelectorProps) {
  return (
    <Panel title="Setup">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {setups.map((setup) => (
          <button
            key={setup}
            type="button"
            onClick={() => onSelect(setup)}
            className={[
              "h-10 rounded-md border px-3 text-sm font-semibold transition",
              selected === setup
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-teal-500"
            ].join(" ")}
          >
            {setup}
          </button>
        ))}
      </div>
    </Panel>
  );
}
