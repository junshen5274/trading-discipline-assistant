import { Panel } from "@/components/Panel";
import { instruments, type Instrument } from "@/types/trade";

type InstrumentSelectorProps = {
  selected: Instrument;
  onSelect: (instrument: Instrument) => void;
};

export function InstrumentSelector({ selected, onSelect }: InstrumentSelectorProps) {
  return (
    <Panel title="Instrument">
      <div className="grid grid-cols-4 gap-2">
        {instruments.map((instrument) => (
          <button
            key={instrument}
            type="button"
            onClick={() => onSelect(instrument)}
            className={[
              "h-10 rounded-md border px-3 text-sm font-semibold transition",
              selected === instrument
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-teal-500"
            ].join(" ")}
          >
            {instrument}
          </button>
        ))}
      </div>
    </Panel>
  );
}
