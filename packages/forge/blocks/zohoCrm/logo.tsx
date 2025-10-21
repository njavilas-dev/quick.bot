/** @jsxImportSource react */

export const ZohoCrmLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" {...props}>
    <defs>
      <linearGradient id="zohoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#E42527" />
        <stop offset="25%" stopColor="#F9B21D" />
        <stop offset="50%" stopColor="#089949" />
        <stop offset="75%" stopColor="#226DB4" />
        <stop offset="100%" stopColor="#E42527" />
      </linearGradient>
    </defs>

    {/* Z */}
    <path
      d="M15 15 L40 15 L40 20 L25 35 L40 35 L40 40 L15 40 L15 35 L30 20 L15 20 Z"
      fill="url(#zohoGradient)"
    />

    {/* O */}
    <ellipse
      cx="55"
      cy="27.5"
      rx="12.5"
      ry="12.5"
      fill="none"
      stroke="url(#zohoGradient)"
      strokeWidth="5"
    />

    {/* H */}
    <path
      d="M75 15 L75 40 M75 27.5 L95 27.5 M95 15 L95 40"
      fill="none"
      stroke="url(#zohoGradient)"
      strokeWidth="5"
      strokeLinecap="round"
    />

    {/* O */}
    <ellipse
      cx="115"
      cy="27.5"
      rx="12.5"
      ry="12.5"
      fill="none"
      stroke="url(#zohoGradient)"
      strokeWidth="5"
    />

    {/* CRM text */}
    <text
      x="140"
      y="35"
      fontFamily="Arial, sans-serif"
      fontSize="16"
      fontWeight="bold"
      fill="#333333"
    >
      CRM
    </text>
  </svg>
)
