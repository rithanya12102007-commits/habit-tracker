import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface RithoLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtext?: string;
  animate?: boolean;
}

const sizeMap = {
  xs: {
    box: 'w-6 h-6',
    img: 'w-6 h-6',
    text: 'text-sm',
    badge: 'text-[9px] px-1 py-0.2',
  },
  sm: {
    box: 'w-8 h-8',
    img: 'w-8 h-8',
    text: 'text-base',
    badge: 'text-[10px] px-1.5 py-0.5',
  },
  md: {
    box: 'w-9 h-9',
    img: 'w-9 h-9',
    text: 'text-lg',
    badge: 'text-[11px] px-1.5 py-0.5',
  },
  lg: {
    box: 'w-12 h-12',
    img: 'w-12 h-12',
    text: 'text-2xl',
    badge: 'text-xs px-2 py-0.5',
  },
  xl: {
    box: 'w-16 h-16',
    img: 'w-16 h-16',
    text: 'text-3xl',
    badge: 'text-xs px-2.5 py-1',
  },
};

export const RithoLogo: React.FC<RithoLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtext,
  animate = true,
}) => {
  const { currentTheme } = useTheme();
  const cfg = sizeMap[size];

  // Theme-tailored accents
  const getThemeTextClass = () => {
    switch (currentTheme) {
      case 'sage-garden':
        return 'text-[#87cf9c]';
      case 'lavender-calm':
        return 'text-[#cca7ed]';
      case 'warm-minimal':
        return 'text-[#e5bf85]';
      case 'ocean-mist':
      default:
        return 'text-[#64c9d8]';
    }
  };

  const getThemeGlow = () => {
    switch (currentTheme) {
      case 'sage-garden':
        return 'shadow-[#4a8a5f]/25 border-[#5ba373]/30';
      case 'lavender-calm':
        return 'shadow-[#8a68b5]/25 border-[#9d7bc7]/30';
      case 'warm-minimal':
        return 'shadow-[#b58b50]/25 border-[#c49a60]/30';
      case 'ocean-mist':
      default:
        return 'shadow-[#3a8b99]/25 border-[#4ea8ba]/30';
    }
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Logo Emblem Icon */}
      <div
        className={`relative ${cfg.box} rounded-xl overflow-hidden shadow-lg border ${getThemeGlow()} shrink-0 transition-all duration-300 ${
          animate ? 'group-hover:scale-105 group-hover:rotate-1' : ''
        }`}
      >
        <img
          src="/logo.png"
          alt="Ritho AI Logo"
          className={`${cfg.img} object-cover w-full h-full rounded-xl`}
          onError={(e) => {
            // Elegant SVG fallback if image fails to load
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
        {/* Subtle glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none rounded-xl" />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={`font-bold tracking-tight text-white ${cfg.text}`}>
              Ritho
            </span>
            <span
              className={`font-extrabold ${getThemeTextClass()} ${cfg.text} transition-colors duration-300`}
            >
              AI
            </span>
          </div>
          {subtext && (
            <span className="text-[11px] text-neutral-400 font-normal leading-none mt-0.5">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
