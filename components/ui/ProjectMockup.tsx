import { cn } from "@/lib/utils";

type MockupType = "mind" | "ai-ops" | "risk" | "pulse" | "trading" | "default";

type ProjectMockupProps = {
  type: MockupType;
  className?: string;
};

export default function ProjectMockup({ type, className }: ProjectMockupProps) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-border bg-surface",
        className
      )}
      aria-hidden="true"
    >
      {type === "mind" && <MindMockup />}
      {type === "ai-ops" && <AiOpsMockup />}
      {type === "risk" && <RiskMockup />}
      {type === "pulse" && <PulseMockup />}
      {type === "trading" && <TradingMockup />}
      {type === "default" && <DefaultMockup />}
    </div>
  );
}

function MindMockup() {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] p-4">
      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent/60" />
          <span className="text-[10px] uppercase tracking-widest text-muted">
            MIND
          </span>
        </div>
        <span className="text-[9px] text-accent/80">DOI / PMID verified</span>
      </div>
      <div className="grid flex-1 grid-cols-12 gap-3">
        <div className="col-span-4 space-y-1.5">
          {["Intent", "Retrieval", "Reasoning", "Safety"].map((stage, i) => (
            <div
              key={stage}
              className={cn(
                "rounded-sm border px-2 py-1.5 text-[9px]",
                i === 3
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-white/5 bg-white/[0.02] text-muted"
              )}
            >
              {stage}
            </div>
          ))}
        </div>
        <div className="col-span-8 flex flex-col gap-2">
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-2 text-[9px] text-muted">Why does my mind do this?</div>
            <div className="space-y-1.5">
              <div className="h-1 w-full rounded bg-white/10" />
              <div className="h-1 w-4/5 rounded bg-white/10" />
              <div className="h-1 w-2/3 rounded bg-white/5" />
            </div>
          </div>
          <div className="flex gap-2">
            {["10.1038/…", "PMID 3812"].map((cite) => (
              <div
                key={cite}
                className="rounded-sm border border-accent/20 px-2 py-1 text-[8px] text-accent/80"
              >
                {cite}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AiOpsMockup() {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] p-4">
      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex gap-2">
          <div className="h-2 w-2 rounded-full bg-accent/60" />
          <span className="text-[10px] uppercase tracking-widest text-muted">
            Operations
          </span>
        </div>
        <div className="h-1.5 w-16 rounded-full bg-white/10" />
      </div>
      <div className="grid flex-1 grid-cols-12 gap-3">
        <div className="col-span-3 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 rounded-sm border border-white/5 bg-white/[0.02] px-2 py-1.5"
            >
              <div className="h-1 w-2/3 rounded bg-white/10" />
            </div>
          ))}
        </div>
        <div className="col-span-6 flex flex-col gap-3">
          <div className="flex gap-2">
            {["Agents", "Metrics", "Alerts"].map((tab, i) => (
              <div
                key={tab}
                className={cn(
                  "rounded-sm px-2 py-1 text-[9px]",
                  i === 0
                    ? "bg-accent/10 text-accent"
                    : "text-muted"
                )}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="flex-1 rounded-sm border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-2 text-[9px] text-accent">Agent Activity</div>
            <div className="space-y-2">
              {[85, 62, 45].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-accent/40"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-3 space-y-2">
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-2">
            <div className="text-[9px] text-muted">Uptime</div>
            <div className="text-lg font-light text-foreground">99.2%</div>
          </div>
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-2">
            <div className="text-[9px] text-muted">Insights</div>
            <div className="mt-1 space-y-1">
              <div className="h-1 w-full rounded bg-white/10" />
              <div className="h-1 w-4/5 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskMockup() {
  return (
    <div className="flex h-full flex-col bg-[#0b0b0b] p-4">
      <div className="mb-3 flex justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted">
          Risk Console
        </span>
        <div className="flex gap-1">
          <div className="h-4 w-4 rounded-sm border border-white/10" />
          <div className="h-4 w-4 rounded-sm border border-white/10" />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2">
        <div className="col-span-2 rounded-sm border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-2 text-[9px] text-muted">Exposure Overview</div>
          <svg viewBox="0 0 200 80" className="h-16 w-full">
            <polyline
              fill="none"
              stroke="rgba(225,183,79,0.5)"
              strokeWidth="1.5"
              points="0,60 30,45 60,50 90,30 120,35 150,20 180,25 200,15"
            />
            <polyline
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              points="0,70 40,55 80,58 120,40 160,45 200,30"
            />
          </svg>
        </div>
        <div className="space-y-2">
          {["VaR", "Limit", "Status"].map((label) => (
            <div
              key={label}
              className="rounded-sm border border-white/5 bg-white/[0.02] p-2"
            >
              <div className="text-[8px] text-muted">{label}</div>
              <div className="mt-1 h-1.5 w-8 rounded bg-accent/30" />
            </div>
          ))}
        </div>
        <div className="col-span-3 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 rounded-sm border border-dashed border-white/10 bg-white/[0.01]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PulseMockup() {
  return (
    <div className="flex h-full flex-col bg-[#0c0c0c] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted">
          Pulse
        </div>
        <div className="rounded-sm bg-accent/10 px-2 py-0.5 text-[8px] text-accent">
          Feedback
        </div>
      </div>
      <div className="mb-3 flex gap-2 border-b border-white/5 pb-2">
        {["All", "Open", "Resolved"].map((tab, i) => (
          <span
            key={tab}
            className={cn(
              "text-[9px]",
              i === 0 ? "text-accent" : "text-muted"
            )}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="flex-1 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-sm border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <div className="h-2 w-2 rounded-full bg-accent/40" />
            <div className="flex-1 space-y-1">
              <div className="h-1 w-3/4 rounded bg-white/10" />
              <div className="h-1 w-1/2 rounded bg-white/5" />
            </div>
            <div className="h-1.5 w-8 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TradingMockup() {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] p-4">
      <div className="mb-3 flex justify-between text-[10px] text-muted">
        <span>EUR/USD · 1H</span>
        <span className="text-accent">+0.24%</span>
      </div>
      <div className="flex-1 rounded-sm border border-white/5 bg-white/[0.02] p-2">
        <svg viewBox="0 0 240 100" className="h-full w-full">
          {[20, 40, 60, 80].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="240"
              y2={y}
              stroke="rgba(255,255,255,0.04)"
            />
          ))}
          <polyline
            fill="none"
            stroke="rgba(225,183,79,0.6)"
            strokeWidth="1.5"
            points="0,70 20,65 40,68 60,55 80,58 100,45 120,50 140,35 160,40 180,30 200,25 220,20 240,18"
          />
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {["Backtest", "Strategy", "Signals"].map((label) => (
          <div
            key={label}
            className="rounded-sm border border-white/5 py-1 text-center text-[8px] text-muted"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultMockup() {
  return (
    <div className="flex h-full items-center justify-center bg-surface">
      <div className="grid grid-cols-3 gap-2 p-6 opacity-30">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-12 rounded-sm bg-white/10" />
        ))}
      </div>
    </div>
  );
}
