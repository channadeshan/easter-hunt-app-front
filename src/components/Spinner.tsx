import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function Spinner({ size = 'md', color = 'border-hunt-coral' }: SpinnerProps) {
  const sizeMap = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3' };
  return (
    <div
      className={`${sizeMap[size]} ${color} animate-spin rounded-full border-transparent border-t-current`}
      style={{ borderTopColor: 'currentColor' }}
    />
  );
}
