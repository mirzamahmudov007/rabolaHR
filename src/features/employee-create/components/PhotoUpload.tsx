'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  CheckIcon,
  Loader2Icon,
  RefreshCwIcon,
  ScanFaceIcon,
  Trash2Icon,
  UploadIcon } from
'lucide-react';
import { Button } from '@/shared/ui/Button';

interface PhotoUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

type CheckStatus = 'idle' | 'checking' | 'ok' | 'low';

const MAX_MB = 5;
const MIN_PX = 300;

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const t = useTranslations('create.photo');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<CheckStatus>(value ? 'ok' : 'idle');
  const [size, setSize] = useState<{w: number;h: number;} | null>(null);

  useEffect(() => {
    if (!value) setStatus('idle');
  }, [value]);

  const requirements = [
  t('reqFront'),
  t('reqLight'),
  t('reqFormat', { mb: MAX_MB })];

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setError(t('errFormat'));
    if (file.size > MAX_MB * 1024 * 1024) return setError(t('errSize', { mb: MAX_MB }));
    setError(null);
    const url = URL.createObjectURL(file);
    onChange(url);
    setStatus('checking');
    const img = new Image();
    img.onload = () => {
      window.setTimeout(() => {
        setSize({ w: img.naturalWidth, h: img.naturalHeight });
        setStatus(img.naturalWidth < MIN_PX || img.naturalHeight < MIN_PX ? 'low' : 'ok');
      }, 900);
    };
    img.onerror = () => {
      setStatus('idle');
      onChange(null);
      setError(t('errRead'));
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={`relative flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-colors duration-150 ${
        value ?
        status === 'low' ?
        'border-late/60' :
        'border-line' :
        dragging ?
        'border-ink/50 bg-canvas' :
        error ?
        'border-dashed border-absent/60 bg-surface-2' :
        'border-dashed border-line bg-surface-2'}`
        }>
        
        {value ?
        <>
            <img src={value} alt={t('alt')} className="h-full w-full object-cover" />
            {status === 'checking' &&
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white">
                <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden />
                <span className="text-xs font-medium">{t('checking')}</span>
              </div>
          }
          </> :

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
          
            <ScanFaceIcon className="h-7 w-7 text-subtle" aria-hidden />
            <span className="text-[13px] font-medium text-ink">{t('upload')}</span>
            <span className="text-[11px] text-muted">{t('dropHint')}</span>
          </button>
        }
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
        aria-label={t('uploadAria')} />
      

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">{t('title')}</div>
        <p className="mt-0.5 text-xs text-muted">{t('subtitle')}</p>
        <ul className="mt-3 space-y-1.5">
          {requirements.map((r) =>
          <li key={r} className="flex items-center gap-2 text-[13px] text-body">
              <CheckIcon className={`h-3.5 w-3.5 shrink-0 ${status === 'ok' ? 'text-present-ink' : 'text-subtle'}`} aria-hidden />
              {r}
            </li>
          )}
        </ul>

        <div aria-live="polite">
          {error &&
          <p className="mt-3 flex items-center gap-1.5 text-xs text-absent-ink" role="alert">
              <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          }
          {status === 'ok' && value &&
          <p className="mt-3 flex items-center gap-1.5 text-xs text-present-ink">
              <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('picked')}
            </p>
          }
          {status === 'low' && size &&
          <p className="mt-3 flex items-start gap-1.5 text-xs text-late-ink">
              <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              {t('small', { w: size.w, h: size.h, min: MIN_PX })}
            </p>
          }
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === 'checking'}
            variant="secondary"
            size="sm"
            className="disabled:opacity-60"
            icon={value ? <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden /> : <UploadIcon className="h-3.5 w-3.5" aria-hidden />}>
            
            {value ? t('replace') : t('pick')}
          </Button>
          {value && status !== 'checking' &&
          <Button
            type="button"
            onClick={() => onChange(null)}
            variant="danger"
            size="sm"
            icon={<Trash2Icon className="h-3.5 w-3.5" aria-hidden />}>
            
              {t('remove')}
            </Button>
          }
        </div>
      </div>
    </div>);

}