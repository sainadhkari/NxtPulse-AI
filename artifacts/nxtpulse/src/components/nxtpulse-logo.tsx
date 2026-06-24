interface NxtPulseLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

export function NxtPulseLogo({ size = "md", variant = "default" }: NxtPulseLogoProps) {
  const scales = {
    sm: { box: "h-7 px-2", nxt: "text-[11px]", pulse: "text-[11px]", ai: "text-[8px]", gap: "gap-0" },
    md: { box: "h-8 px-2.5", nxt: "text-[13px]", pulse: "text-[13px]", ai: "text-[9px]", gap: "gap-0" },
    lg: { box: "h-10 px-3", nxt: "text-[16px]", pulse: "text-[16px]", ai: "text-[10px]", gap: "gap-0" },
  };
  const s = scales[size];
  const isDark = variant === "light";

  return (
    <div className={`inline-flex items-center ${s.gap}`}>
      <div
        className={`inline-flex items-center rounded-md ${s.box} font-extrabold tracking-tight leading-none select-none`}
        style={{ background: isDark ? "rgba(255,255,255,0.15)" : "#1e3a5f", gap: 0 }}
      >
        <span style={{ color: isDark ? "#fff" : "#ffffff", letterSpacing: "-0.02em" }} className={s.nxt}>
          Nxt
        </span>
        <span style={{ color: "#60a5fa", letterSpacing: "-0.02em" }} className={s.pulse}>
          Pulse
        </span>
        <span
          className={`ml-1 ${s.ai} font-bold rounded px-1 py-0.5 leading-none`}
          style={{ background: "#2563eb", color: "#fff", letterSpacing: "0" }}
        >
          AI
        </span>
      </div>
    </div>
  );
}
