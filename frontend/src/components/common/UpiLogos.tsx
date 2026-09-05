import React from 'react';

interface UpiLogoProps {
  className?: string;
  size?: number;
}

/** Official Google Pay G-Mark Vector */
export const GooglePayLogo: React.FC<UpiLogoProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect width="48" height="48" rx="12" fill="#FFFFFF" />
    <path
      d="M36.5 24.3c0-.8-.1-1.6-.2-2.3H24v4.5h7.1c-.3 1.6-1.2 3-2.6 3.9v3.2h4.2c2.5-2.3 3.8-5.7 3.8-9.3z"
      fill="#4285F4"
    />
    <path
      d="M24 37c3.5 0 6.5-1.2 8.7-3.2l-4.2-3.2c-1.2.8-2.7 1.3-4.5 1.3-3.4 0-6.3-2.3-7.4-5.4h-4.4v3.4C14.4 34.3 18.9 37 24 37z"
      fill="#34A853"
    />
    <path
      d="M16.6 26.5c-.3-.8-.4-1.6-.4-2.5 0-.9.1-1.7.4-2.5v-3.4h-4.4C11.3 19.8 10.8 21.8 10.8 24s.5 4.2 1.4 5.9l4.4-3.4z"
      fill="#FBBC05"
    />
    <path
      d="M24 15.6c1.9 0 3.7.7 5 2l3.7-3.7C30.4 11.8 27.5 11 24 11c-5.1 0-9.6 2.7-11.8 7.1l4.4 3.4c1.1-3.1 4-5.9 7.4-5.9z"
      fill="#EA4335"
    />
  </svg>
);

/** Official PhonePe Brandmark */
export const PhonePeLogo: React.FC<UpiLogoProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect width="48" height="48" rx="12" fill="#5F259F" />
    {/* Stylized Devanagari Pe & Dynamic Stripe */}
    <path
      d="M23.5 11h-7.5c-.6 0-1 .4-1 1v23.5c0 .6.4 1 1 1s1-.4 1-1v-8.5h6.5c5 0 8.5-3.5 8.5-8s-3.5-8-8.5-8zm-.3 12h-6.2v-8h6.2c2.8 0 4.8 1.8 4.8 4s-2 4-4.8 4z"
      fill="#FFFFFF"
    />
    <path
      d="M34.5 14L25.8 35.5h4.2L38.7 14h-4.2z"
      fill="#FFFFFF"
    />
  </svg>
);

/** Paytm Brandmark */
export const PaytmLogo: React.FC<UpiLogoProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size * 1.3}
    height={size}
    viewBox="0 0 64 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect width="64" height="48" rx="12" fill="#002E6E" />
    <text
      x="8"
      y="32"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontSize="20"
      fontWeight="900"
      fill="#00BAF2"
      letterSpacing="-0.5"
    >
      Pay<tspan fill="#FFFFFF">tm</tspan>
    </text>
  </svg>
);

/** CRED Minimal Brand Badge */
export const CredLogo: React.FC<UpiLogoProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect width="48" height="48" rx="12" fill="#0F0F0F" stroke="#2D3139" strokeWidth="1.5" />
    <path
      d="M15 13h18v4.5H20v13h13V35H15V13z"
      fill="#FFFFFF"
    />
    <path
      d="M23 21h10v5H23v-5z"
      fill="#E5B94E"
    />
  </svg>
);

/** Official BHIM UPI Tri-Color Logo */
export const BhimLogo: React.FC<UpiLogoProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect width="48" height="48" rx="12" fill="#004A80" />
    {/* Tri-color stripe */}
    <rect x="8" y="10" width="32" height="4" rx="2" fill="#FF9933" />
    <rect x="8" y="16" width="32" height="4" rx="2" fill="#FFFFFF" />
    <rect x="8" y="22" width="32" height="4" rx="2" fill="#138808" />
    <text
      x="24"
      y="38.5"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="11.5"
      fontWeight="900"
      textAnchor="middle"
      fill="#FFFFFF"
      letterSpacing="1.5"
    >
      BHIM
    </text>
  </svg>
);

/** Amazon Pay Brandmark */
export const AmazonPayLogo: React.FC<UpiLogoProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size * 1.3}
    height={size}
    viewBox="0 0 64 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect width="64" height="48" rx="12" fill="#1E293B" />
    <text
      x="9"
      y="24"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      fontSize="12.5"
      fontWeight="800"
      fill="#FFFFFF"
    >
      amazon<tspan fill="#FF9900">pay</tspan>
    </text>
    {/* Smile curved arrow */}
    <path
      d="M12 31c9 6 25 6 36-.5"
      stroke="#FF9900"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M45.5 27l3 3.5-3.5 2.5"
      fill="#FF9900"
    />
  </svg>
);

/** Official Slice App Vector Logo */
export const SliceLogo: React.FC<UpiLogoProps> = ({ className = '', size = 28 }) => (
  <svg
    width={size * 1.3}
    height={size}
    viewBox="0 0 64 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect width="64" height="48" rx="12" fill="#582490" />
    <text
      x="10"
      y="31"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontSize="19"
      fontWeight="800"
      fill="#FFFFFF"
      letterSpacing="-0.8"
    >
      slice
    </text>
    {/* Signature Slice dynamic geometric accent */}
    <circle cx="53" cy="27" r="3.2" fill="#FA4D56" />
  </svg>
);
