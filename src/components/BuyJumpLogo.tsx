import React from 'react';

interface BuyJumpLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  textColor?: string;
}

export const BuyJumpLogo: React.FC<BuyJumpLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textClassName = '',
  textColor = 'text-white'
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official BuyJump Logo Image */}
      <div className={`relative ${sizeMap[size]} flex-shrink-0 rounded-xl overflow-hidden bg-white p-0.5 shadow-sm border border-slate-200/40 flex items-center justify-center`}>
        <img
          src="/images/buyjump_logo.jpg"
          alt="BuyJump Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // In case of fallback, render inline SVG logo
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight leading-none text-base sm:text-lg flex items-center gap-1.5 ${textColor} ${textClassName}`}>
            <span>BuyJump</span>
            <span className="inline-block px-1.5 py-0.5 text-[9px] uppercase font-extrabold tracking-wider rounded-md bg-[#00D053] text-slate-950 shadow-xs">
              Direct
            </span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase mt-0.5">
            Shop & Jump
          </span>
        </div>
      )}
    </div>
  );
};
