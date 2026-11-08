export default function IponionLogo({ size = 42 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <path d="M 18 42 A 38 38 0 0 1 82 42" stroke="#2D1457" strokeWidth="9" strokeLinecap="round" />
          <path d="M 28 42 A 26 26 0 0 1 72 42" stroke="#FF6B57" strokeWidth="6" strokeLinecap="round" />
          <path d="M 28 58 A 26 26 0 0 0 72 58" stroke="#FF6B57" strokeWidth="6" strokeLinecap="round" />
          <path d="M 18 58 A 38 38 0 0 0 82 58" stroke="#2D1457" strokeWidth="9" strokeLinecap="round" />
          <circle cx="50" cy="50" r="4" fill="#84CC16" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-black text-2xl tracking-tight leading-none text-[#2D1457]">
          IP<span className="text-[#FF6B57]">ONION</span>
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-0.5">
          IT & Network Support
        </span>
      </div>
    </div>
  );
}
