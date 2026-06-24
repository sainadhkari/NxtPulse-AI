interface NxtPulseLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

export function NxtPulseLogo({ size = "md", variant = "default" }: NxtPulseLogoProps) {
  const scales = {
    sm:  { box: "h-9 px-3",   nxt: "text-[15px]", pulse: "text-[15px]", ai: "text-[10px]" },
    md:  { box: "h-11 px-3.5", nxt: "text-[18px]", pulse: "text-[18px]", ai: "text-[11px]" },
    lg:  { box: "h-14 px-4",   nxt: "text-[22px]", pulse: "text-[22px]", ai: "text-[13px]" },
  };
  const s = scales[size];
  const isLight = variant === "light";

  return (
    <div className="inline-flex items-center">
      <div
        className={`inline-flex items-center rounded-lg ${s.box} font-extrabold tracking-tight leading-none select-none`}
        style={{ background: isLight ? "rgba(255,255,255,0.18)" : "#1e3a5f" }}
      >
        <span style={{ color: "#ffffff", letterSpacing: "-0.02em" }} className={s.nxt}>
          Nxt
        </span>
        <span style={{ color: "#60a5fa", letterSpacing: "-0.02em" }} className={s.pulse}>
          Pulse
        </span>
        <span
          className={`ml-1.5 ${s.ai} font-bold rounded-md px-1.5 py-0.5 leading-none`}
          style={{ background: "#2563eb", color: "#fff" }}
        >
          AI
        </span>
      </div>
    </div>
  );
}
