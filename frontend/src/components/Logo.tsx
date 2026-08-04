import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'full' | 'icon' | 'black' | 'white';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'full',
  className = '',
}) => {
  const sizeMap = {
    sm: { width: 24, height: 24 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
  };

  const { width, height } = sizeMap[size];

  // Use icon-only variant when showText is false
  const logoVariant = showText ? variant : 'icon';
  const logoSrc = `/assets/logo/logo-${logoVariant}.svg`;

  return (
    <img
      src={logoSrc}
      alt="ArthaFlow Logo"
      width={width}
      height={height}
      className={className}
      style={{ width, height }}
    />
  );
};

export default Logo;
