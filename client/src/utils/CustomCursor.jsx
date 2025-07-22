import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [variant, setVariant] = useState("default");
  const [isClicking, setIsClicking] = useState(false);
  const [rippleKey, setRippleKey] = useState(0); // triggers fresh animation

  useEffect(() => {
    const move = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleOver = (e) => {
      const el = e.target;
      const isDisabled = el.closest("button:disabled, input:disabled");
      const isLink = el.closest("a");
      const isInteractive = el.closest("button:not(:disabled), input, select, textarea");

      if (isDisabled) setVariant("disabled");
      else if (isLink) setVariant("link");
      else if (isInteractive) setVariant("hover");
      else setVariant("default");
    };

    const handleClick = () => {
      setIsClicking(true);
      setRippleKey((prev) => prev + 1); // trigger new ripple animation
      setTimeout(() => setIsClicking(false), 400);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mousedown", handleClick);

    document.body.style.cursor = "none";
    Array.from(document.querySelectorAll("*")).forEach((el) => {
      el.style.cursor = "none";
    });

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mousedown", handleClick);
      document.body.style.cursor = "";
    };
  }, []);

  const style = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    clipPath: "polygon(20% 0%, 100% 40%, 100% 60%, 20% 100%, 0% 80%, 0% 20%)",
    rotate: "240deg",
    boxShadow:
      variant === "disabled" || isClicking
        ? "none"
        : "0 0 6px #9862ff, 0 0 12px #9862ff, 0 0 24px #9862ff",
  };

  const base = `
    fixed w-5 h-5 hidden md:block pointer-events-none z-[9999]
    transition-none mix-blend-multiply
  `;

  const variants = {
    default: "bg-[radial-gradient(circle_at_30%_30%,#ffffff,#e0d9ff)] border-[2px] border-[rgba(152,98,255,0.3)]",
    hover: "scale-125 bg-[radial-gradient(circle,#fdfbff,#dbcfff)]",
    link: "scale-150 bg-[linear-gradient(135deg,#fff,#decaff)]",
    disabled: "bg-[#ccc] opacity-70 border border-[#999]",
    click: "scale-[0.85]",
  };

  const current = variants[variant] || "";
  const clickAnim = isClicking ? variants.click : "";

  return (
    <>
      <div
        className={`${base} ${current} ${clickAnim}`}
        style={style}
      >
        {/* Red Slash for Disabled */}
        {variant === "disabled" && (
          <div
            className="absolute w-[14px] h-[2px] bg-red-500 rounded"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(45deg)",
            }}
          />
        )}

        {/* Circular Ripple Animation — one per click */}
        {isClicking && (
          <span
            key={rippleKey}
            className="absolute w-4 h-4 rounded-full border-2 border-[#a88bff]/70 animate-ripple-circle"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: -1,
            }}
          />
        )}
      </div>

      {/* Ripple Keyframes */}
      <style jsx>{`
        @keyframes ripple-circle {
          0% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(6);
          }
        }

        .animate-ripple-circle {
          animation: ripple-circle 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}
