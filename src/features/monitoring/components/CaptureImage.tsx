'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImageOffIcon } from 'lucide-react';

interface CaptureImageProps {
  src: string;
  alt: string;
  className: string;
  iconClassName?: string;
}

/** Camera capture with a graceful fallback when the image fails to load. */
export function CaptureImage({ src, alt, className, iconClassName = 'h-4 w-4' }: CaptureImageProps) {
  const tm = useTranslations('monitoring');
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <span role="img" aria-label={tm('imgFailed', { alt })} className={`flex items-center justify-center bg-surface-2 text-subtle ${className}`}>
        <ImageOffIcon className={iconClassName} aria-hidden />
      </span>);

  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} loading="lazy" className={`object-cover ${className}`} />;
}