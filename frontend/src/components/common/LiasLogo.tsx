import React from "react";

interface LiasLogoProps {
  className?: string;
  variant?: "full" | "icon" | "mark" | "compact";
  theme?: "light" | "dark";
  showSubtitle?: boolean;
}

export default function LiasLogo({
  className = "h-10",
  variant = "full",
  theme = "dark",
  showSubtitle = true
}: LiasLogoProps) {
  // If variant is just the icon / mark (the brain + circuit)
  if (variant === "icon" || variant === "mark") {
    return (
      <svg
        viewBox="0 0 240 240"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="LIAS Emblem"
      >
        <g transform="translate(10, 10)">
          {/* LEFT HALF: Brain in slate/grey */}
          <g fill="#94a3b8" stroke="#64748b" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M 110 20 C 85 20, 60 30, 45 45 C 25 65, 15 90, 15 115 C 15 130, 20 145, 30 158 C 22 170, 25 185, 35 195 C 48 208, 70 215, 90 215 C 100 215, 105 212, 110 210 L 110 20 Z"
              fill={theme === "dark" ? "#1e293b" : "#f1f5f9"}
              stroke="#94a3b8"
              strokeWidth="3.5"
            />
            <path d="M 45 60 C 60 70, 80 65, 95 55" stroke="#94a3b8" strokeWidth="4.5" />
            <path d="M 30 95 C 45 90, 70 95, 85 85 C 95 80, 105 85, 110 88" stroke="#94a3b8" strokeWidth="4.5" />
            <path d="M 25 125 C 40 120, 55 135, 75 125 C 90 118, 100 120, 110 118" stroke="#94a3b8" strokeWidth="4.5" />
            <path d="M 35 155 C 50 150, 65 160, 80 150 C 95 142, 105 148, 110 145" stroke="#94a3b8" strokeWidth="4.5" />
            <path d="M 45 185 C 60 178, 80 185, 95 178 C 102 175, 108 178, 110 176" stroke="#94a3b8" strokeWidth="4.5" />

            <circle cx="55" cy="45" r="3" fill="#94a3b8" />
            <circle cx="75" cy="38" r="3" fill="#94a3b8" />
            <circle cx="40" cy="80" r="3" fill="#94a3b8" />
            <circle cx="60" cy="108" r="3" fill="#94a3b8" />
            <circle cx="48" cy="140" r="3" fill="#94a3b8" />
            <circle cx="68" cy="168" r="3" fill="#94a3b8" />
            <circle cx="55" cy="198" r="3" fill="#94a3b8" />
            <circle cx="85" cy="202" r="3" fill="#94a3b8" />
          </g>

          {/* RIGHT HALF: Digital Circuit Board in Cyan / Electric Blue */}
          <g stroke="#0284c7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="110" y1="20" x2="110" y2="210" stroke="#0ea5e9" strokeWidth="5" />

            <path d="M 110 35 L 140 35 L 155 50 L 180 50" />
            <circle cx="180" cy="50" r="5" fill="#0284c7" stroke="none" />

            <path d="M 110 60 L 130 60 L 145 75 L 170 75" />
            <circle cx="170" cy="75" r="4.5" fill="#0284c7" stroke="none" />

            <path d="M 110 85 L 125 85 L 138 98 L 155 98" />
            <circle cx="155" cy="98" r="4" fill="#0ea5e9" stroke="none" />

            {/* Microchip */}
            <g>
              <rect x="162" y="96" width="34" height="46" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
              <rect x="170" y="104" width="18" height="30" rx="2" fill="#0284c7" stroke="none" />
              <line x1="156" y1="104" x2="162" y2="104" stroke="#0284c7" strokeWidth="3" />
              <line x1="156" y1="114" x2="162" y2="114" stroke="#0284c7" strokeWidth="3" />
              <line x1="156" y1="124" x2="162" y2="124" stroke="#0284c7" strokeWidth="3" />
              <line x1="156" y1="134" x2="162" y2="134" stroke="#0284c7" strokeWidth="3" />

              <line x1="196" y1="104" x2="202" y2="104" stroke="#0284c7" strokeWidth="3" />
              <line x1="196" y1="114" x2="202" y2="114" stroke="#0284c7" strokeWidth="3" />
              <line x1="196" y1="124" x2="202" y2="124" stroke="#0284c7" strokeWidth="3" />
              <line x1="196" y1="134" x2="202" y2="134" stroke="#0284c7" strokeWidth="3" />
            </g>

            <path d="M 202 114 L 214 114 L 218 125" />
            <circle cx="218" cy="125" r="4" fill="#0284c7" stroke="none" />

            <path d="M 110 140 L 135 140 L 148 152 L 180 152" />
            <circle cx="180" cy="152" r="5" fill="#0284c7" stroke="none" />

            <path d="M 110 165 L 125 165 L 140 180 L 165 180" />
            <circle cx="165" cy="180" r="4.5" fill="#0ea5e9" stroke="none" />

            <path d="M 110 190 L 135 190 L 150 202 L 185 202" />
            <circle cx="185" cy="202" r="5" fill="#0284c7" stroke="none" />

            <circle cx="132" cy="60" r="3.5" fill="#0284c7" stroke="none" />
            <circle cx="140" cy="140" r="3.5" fill="#0284c7" stroke="none" />
          </g>
        </g>
      </svg>
    );
  }

  const textColor = theme === "dark" ? "#f8fafc" : "#0f172a";
  const bannerBg = theme === "dark" ? "#0f172a" : "#ffffff";
  const bannerBorder = theme === "dark" ? "#38bdf8" : "#0f172a";
  const bannerText = theme === "dark" ? "#e0f2fe" : "#0f172a";

  return (
    <svg
      viewBox="0 0 920 240"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Laboratoire d'Intelligence Artificielle et Systèmes - LIAS"
    >
      <defs>
        <filter id="logo-badge-shadow" x="-3%" y="-10%" width="106%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* LEFT EMBLEM: Brain + Circuit */}
      <g transform="translate(15, 10)">
        {/* Brain Left Hemisphere */}
        <g fill="#94a3b8" stroke="#64748b" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M 110 20 C 85 20, 60 30, 45 45 C 25 65, 15 90, 15 115 C 15 130, 20 145, 30 158 C 22 170, 25 185, 35 195 C 48 208, 70 215, 90 215 C 100 215, 105 212, 110 210 L 110 20 Z"
            fill={theme === "dark" ? "#1e293b" : "#f1f5f9"}
            stroke="#94a3b8"
            strokeWidth="3.5"
          />
          <path d="M 45 60 C 60 70, 80 65, 95 55" stroke="#94a3b8" strokeWidth="4.5" />
          <path d="M 30 95 C 45 90, 70 95, 85 85 C 95 80, 105 85, 110 88" stroke="#94a3b8" strokeWidth="4.5" />
          <path d="M 25 125 C 40 120, 55 135, 75 125 C 90 118, 100 120, 110 118" stroke="#94a3b8" strokeWidth="4.5" />
          <path d="M 35 155 C 50 150, 65 160, 80 150 C 95 142, 105 148, 110 145" stroke="#94a3b8" strokeWidth="4.5" />
          <path d="M 45 185 C 60 178, 80 185, 95 178 C 102 175, 108 178, 110 176" stroke="#94a3b8" strokeWidth="4.5" />

          <circle cx="55" cy="45" r="3" fill="#94a3b8" stroke="none" />
          <circle cx="75" cy="38" r="3" fill="#94a3b8" stroke="none" />
          <circle cx="40" cy="80" r="3" fill="#94a3b8" stroke="none" />
          <circle cx="60" cy="108" r="3" fill="#94a3b8" stroke="none" />
          <circle cx="48" cy="140" r="3" fill="#94a3b8" stroke="none" />
          <circle cx="68" cy="168" r="3" fill="#94a3b8" stroke="none" />
          <circle cx="55" cy="198" r="3" fill="#94a3b8" stroke="none" />
          <circle cx="85" cy="202" r="3" fill="#94a3b8" stroke="none" />
        </g>

        {/* Digital Circuit Board Right Hemisphere */}
        <g stroke="#0284c7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="110" y1="20" x2="110" y2="210" stroke="#0ea5e9" strokeWidth="5" />

          <path d="M 110 35 L 140 35 L 155 50 L 180 50" />
          <circle cx="180" cy="50" r="5" fill="#0284c7" stroke="none" />

          <path d="M 110 60 L 130 60 L 145 75 L 170 75" />
          <circle cx="170" cy="75" r="4.5" fill="#0284c7" stroke="none" />

          <path d="M 110 85 L 125 85 L 138 98 L 155 98" />
          <circle cx="155" cy="98" r="4" fill="#0ea5e9" stroke="none" />

          <g>
            <rect x="162" y="96" width="34" height="46" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
            <rect x="170" y="104" width="18" height="30" rx="2" fill="#0284c7" stroke="none" />
            <line x1="156" y1="104" x2="162" y2="104" stroke="#0284c7" strokeWidth="3" />
            <line x1="156" y1="114" x2="162" y2="114" stroke="#0284c7" strokeWidth="3" />
            <line x1="156" y1="124" x2="162" y2="124" stroke="#0284c7" strokeWidth="3" />
            <line x1="156" y1="134" x2="162" y2="134" stroke="#0284c7" strokeWidth="3" />

            <line x1="196" y1="104" x2="202" y2="104" stroke="#0284c7" strokeWidth="3" />
            <line x1="196" y1="114" x2="202" y2="114" stroke="#0284c7" strokeWidth="3" />
            <line x1="196" y1="124" x2="202" y2="124" stroke="#0284c7" strokeWidth="3" />
            <line x1="196" y1="134" x2="202" y2="134" stroke="#0284c7" strokeWidth="3" />
          </g>

          <path d="M 202 114 L 214 114 L 218 125" />
          <circle cx="218" cy="125" r="4" fill="#0284c7" stroke="none" />

          <path d="M 110 140 L 135 140 L 148 152 L 180 152" />
          <circle cx="180" cy="152" r="5" fill="#0284c7" stroke="none" />

          <path d="M 110 165 L 125 165 L 140 180 L 165 180" />
          <circle cx="165" cy="180" r="4.5" fill="#0ea5e9" stroke="none" />

          <path d="M 110 190 L 135 190 L 150 202 L 185 202" />
          <circle cx="185" cy="202" r="5" fill="#0284c7" stroke="none" />

          <circle cx="132" cy="60" r="3.5" fill="#0284c7" stroke="none" />
          <circle cx="140" cy="140" r="3.5" fill="#0284c7" stroke="none" />
        </g>
      </g>

      {/* BIG BOLD "LIAS" */}
      <g
        fill={textColor}
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Impact', sans-serif"
        fontWeight="900"
        fontSize="215"
        letterSpacing="-3"
      >
        <text x="245" y="195">L</text>
        <text x="375" y="195">I</text>
        <text x="470" y="195">A</text>
        <text x="655" y="195">S</text>
      </g>

      {/* HORIZONTAL BADGE: LABORATOIRE D'INTELLIGENCE ARTIFICIELLE ET SYSTEMES */}
      {showSubtitle && (
        <g transform="translate(205, 108)" filter="url(#logo-badge-shadow)">
          <rect
            x="0"
            y="0"
            width="690"
            height="36"
            rx="4"
            fill={bannerBg}
            stroke={bannerBorder}
            strokeWidth="2"
          />
          <text
            x="345"
            y="24"
            fill={bannerText}
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Arial Black', sans-serif"
            fontWeight="800"
            fontSize="16.5"
            letterSpacing="5.2"
            textAnchor="middle"
          >
            LABORATOIRE D'INTELLIGENCE ARTIFICIELLE ET SYSTEMES
          </text>
        </g>
      )}
    </svg>
  );
}
