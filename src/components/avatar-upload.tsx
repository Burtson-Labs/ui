import Camera from '@burtson-labs/icons/react/camera';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { Slider } from './slider';

export interface AvatarUploadProps extends Omit<React.ComponentProps<'div'>, 'onError'> {
  src?: string;
  /** A stored photo may exist even when its preview cannot be loaded. */
  hasPhoto?: boolean;
  /** The person's name, used to label the current photo. */
  name: string;
  fallback?: React.ReactNode;
  /** Receives a square JPEG. Resolve only after it has been saved; reject to offer retry. */
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  disabled?: boolean;
  /** Maximum size of the original file. Default: 10 MiB. */
  maxBytes?: number;
  /** Exported square dimension. Default: 512px. */
  outputSize?: number;
}

type Photo = { url: string; image: HTMLImageElement };
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Choose, position and save a profile photo. No storage or networking is built in. */
export function AvatarUpload({
  src,
  hasPhoto = Boolean(src),
  name,
  fallback,
  onUpload,
  onRemove,
  disabled = false,
  maxBytes = 10 * 1024 * 1024,
  outputSize = 512,
  className,
  ...props
}: AvatarUploadProps) {
  const input = React.useRef<HTMLInputElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const crop = React.useRef<HTMLDivElement>(null);
  const request = React.useRef(0);
  const saving = React.useRef(false);
  const returnFocus = React.useRef(false);
  const ownedUrl = React.useRef<string | null>(null);
  const drag = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [photo, setPhoto] = React.useState<Photo | null>(null);
  const [position, setPosition] = React.useState({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = React.useState(1);
  const [busy, setBusy] = React.useState(false);
  const [reading, setReading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const helpId = React.useId();
  const errorId = React.useId();
  const blocked = disabled || busy || reading;

  React.useEffect(
    () => () => {
      request.current++;
      if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
    },
    [],
  );
  React.useEffect(() => {
    if (photo) crop.current?.focus();
  }, [photo]);
  React.useEffect(() => {
    if (returnFocus.current && !photo && !blocked) {
      returnFocus.current = false;
      trigger.current?.focus();
    }
  }, [photo, blocked]);

  const discard = () => {
    request.current++;
    returnFocus.current = true;
    if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
    ownedUrl.current = null;
    setPhoto(null);
    setReading(false);
  };

  const choose = (file?: File) => {
    if (!file || blocked || saving.current) return;
    setError('');
    setMessage('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG or WebP photo. Export HEIC photos as JPEG first.');
      return;
    }
    if (!file.size || file.size > maxBytes) {
      setError(`Choose a photo under ${Math.round(maxBytes / 1024 / 1024)} MB that is not empty.`);
      return;
    }
    const id = ++request.current;
    const url = URL.createObjectURL(file);
    if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
    ownedUrl.current = url;
    setPhoto(null);
    setReading(true);
    const image = new Image();
    image.onload = () => {
      if (id !== request.current) return;
      setReading(false);
      if (!image.naturalWidth || !image.naturalHeight) {
        setError('This photo could not be opened. Try another image.');
        URL.revokeObjectURL(url);
        ownedUrl.current = null;
        return;
      }
      setPosition({ x: 0.5, y: 0.5 });
      setZoom(1);
      setPhoto({ url, image });
    };
    image.onerror = () => {
      if (id !== request.current) return;
      setReading(false);
      setError('This photo could not be opened. Try another image.');
      URL.revokeObjectURL(url);
      ownedUrl.current = null;
    };
    image.src = url;
  };

  const side = photo ? Math.min(photo.image.naturalWidth, photo.image.naturalHeight) / zoom : 1;
  const act = async (remove = false) => {
    if (blocked || saving.current || (!remove && !photo)) return;
    saving.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (remove) await onRemove?.();
      else if (photo) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = Math.min(2048, Math.max(64, Math.round(outputSize) || 512));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Your browser could not prepare the photo. Please try again.');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          photo.image,
          (photo.image.naturalWidth - side) * position.x,
          (photo.image.naturalHeight - side) * position.y,
          side,
          side,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (value) =>
              value
                ? resolve(value)
                : reject(new Error('Could not prepare this photo. Try another image.')),
            'image/jpeg',
            0.9,
          ),
        );
        await onUpload(new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' }));
      }
      discard();
      setMessage(remove ? 'Profile photo removed.' : 'Profile photo updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your photo. Please try again.');
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };

  return (
    <div
      data-slot="avatar-upload"
      aria-busy={busy || reading || undefined}
      className={cn('grid min-w-0 gap-4', className)}
      {...props}
      onDragOver={(event) => {
        props.onDragOver?.(event);
        event.preventDefault();
      }}
      onDrop={(event) => {
        props.onDrop?.(event);
        event.preventDefault();
        choose(event.dataTransfer.files[0]);
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          {src && (
            <AvatarImage src={src} alt={`${name}'s profile photo`} referrerPolicy="no-referrer" />
          )}
          <AvatarFallback className="text-lg">
            {fallback ?? name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid min-w-0 flex-1 gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              ref={trigger}
              variant="outline"
              disabled={blocked}
              onClick={() => input.current?.click()}
              aria-describedby={`${helpId}${error ? ` ${errorId}` : ''}`}
            >
              <Camera /> {hasPhoto ? 'Change photo' : 'Choose photo'}
            </Button>
            {onRemove && hasPhoto && !photo && (
              <Button variant="ghost" disabled={blocked} onClick={() => void act(true)}>
                Remove photo
              </Button>
            )}
          </div>
          <p id={helpId} className="text-xs text-muted-foreground">
            JPEG, PNG or WebP · up to {Math.round(maxBytes / 1024 / 1024)} MB. You can also drop a
            photo here.
          </p>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose profile photo"
          className="hidden"
          disabled={blocked}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            choose(file);
          }}
        />
      </div>
      {photo && (
        <div className="grid gap-4 rounded-lg border border-border bg-surface p-4">
          <div
            ref={crop}
            tabIndex={-1}
            role="group"
            aria-label="Photo crop preview. Use the zoom and position controls to adjust it."
            className={cn(
              'relative mx-auto aspect-square w-full max-w-64 touch-none overflow-hidden rounded-full bg-muted',
              focusRingClasses,
              !blocked && 'cursor-move',
            )}
            onPointerDown={(event) => {
              if (blocked) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { x: event.clientX, y: event.clientY, px: position.x, py: position.y };
            }}
            onPointerMove={(event) => {
              if (!drag.current || blocked) return;
              const scale = event.currentTarget.clientWidth / side;
              const dx = (photo.image.naturalWidth - side) * scale;
              const dy = (photo.image.naturalHeight - side) * scale;
              setPosition({
                x: dx ? clamp(drag.current.px - (event.clientX - drag.current.x) / dx) : 0.5,
                y: dy ? clamp(drag.current.py - (event.clientY - drag.current.y) / dy) : 0.5,
              });
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onLostPointerCapture={() => {
              drag.current = null;
            }}
          >
            <img
              src={photo.url}
              alt="Crop preview"
              draggable={false}
              className="pointer-events-none absolute max-w-none select-none"
              style={{
                width: `${(photo.image.naturalWidth / side) * 100}%`,
                height: `${(photo.image.naturalHeight / side) * 100}%`,
                left: `${((-(photo.image.naturalWidth - side) * position.x) / side) * 100}%`,
                top: `${((-(photo.image.naturalHeight - side) * position.y) / side) * 100}%`,
              }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Drag to reposition. Use position controls for precise adjustments.
          </p>
          <label className="grid gap-2 text-sm">
            Zoom{' '}
            <Slider
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onValueChange={setZoom}
              disabled={blocked}
              aria-valuetext={`${Math.round(zoom * 100)}%`}
            />
          </label>
          <details className="rounded-md border border-border px-3 text-sm">
            <summary className="flex min-h-11 cursor-pointer items-center font-medium">
              Position controls
            </summary>
            <div className="grid gap-3 pb-3 sm:grid-cols-2">
              <label className="grid gap-2" htmlFor={`${helpId}-x`}>
                Horizontal position
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  id={`${helpId}-x`}
                  value={Math.round(position.x * 100)}
                  onValueChange={(value) => setPosition((p) => ({ ...p, x: value / 100 }))}
                  disabled={blocked || photo.image.naturalWidth <= side}
                  aria-valuetext={`${Math.round(position.x * 100)}%`}
                />
              </label>
              <label className="grid gap-2" htmlFor={`${helpId}-y`}>
                Vertical position
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  id={`${helpId}-y`}
                  value={Math.round(position.y * 100)}
                  onValueChange={(value) => setPosition((p) => ({ ...p, y: value / 100 }))}
                  disabled={blocked || photo.image.naturalHeight <= side}
                  aria-valuetext={`${Math.round(position.y * 100)}%`}
                />
              </label>
            </div>
          </details>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                discard();
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button disabled={blocked} onClick={() => void act()}>
              {busy ? 'Saving photo…' : 'Save photo'}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <p
        role="status"
        aria-live="polite"
        className={cn('text-sm text-muted-foreground', !reading && !busy && !message && 'sr-only')}
      >
        {reading ? 'Opening photo…' : busy ? 'Saving your profile photo…' : message}
      </p>
    </div>
  );
}
