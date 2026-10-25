import ChevronLeft from '@burtson-labs/icons/react/chevron-left';
import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import ImageIcon from '@burtson-labs/icons/react/image';
import * as React from 'react';

import { safeImageSrc } from '../lib/safe-url';
import { cn, focusRingClasses } from '../lib/utils';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog';
import { IconButton } from './icon-button';

export interface LightboxImage {
  /** http(s), blob: or a data:image URL. Anything else is not loaded. */
  src: string;
  /** Required: what the image shows. It is the image's name in the viewer. */
  alt: string;
  /** A visible line under the image, e.g. the file name. */
  caption?: React.ReactNode;
}

const imageLightboxLabels = {
  dialog: 'Image viewer',
  previous: 'Previous image',
  next: 'Next image',
  /** Shown and announced when the image changes. */
  position: (current: number, total: number) => `Image ${current} of ${total}`,
  /** Shown in place of an image whose URL is not allowed or fails to load. */
  unavailable: 'Image unavailable',
};

export type ImageLightboxLabels = typeof imageLightboxLabels;

export interface ImageLightboxProps {
  images: LightboxImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The image on screen, from 0. Controlled; pair with onIndexChange. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Strings, for translation. */
  labels?: Partial<ImageLightboxLabels>;
  className?: string;
}

/** Shows `src` only when it is a safe image URL, with a labelled fallback otherwise. */
function SafeImage({
  image,
  unavailable,
  className,
}: {
  image: LightboxImage;
  unavailable: string;
  className?: string;
}) {
  const src = safeImageSrc(image.src);
  // Remember which URL failed, so a new src gets a fresh attempt.
  const [failedSrc, setFailedSrc] = React.useState<string>();
  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={`${unavailable}: ${image.alt}`}
        className={cn(
          'grid place-items-center gap-2 rounded-md bg-muted p-6 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        <ImageIcon aria-hidden className="size-6" />
        <span aria-hidden>{unavailable}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={image.alt}
      onError={() => setFailedSrc(src)}
      className={cn('object-contain', className)}
    />
  );
}

/**
 * A full-size view of one or more images in a dialog: focus stays inside,
 * Escape closes and focus returns to whatever opened it. With several
 * images, previous and next buttons and the Left and Right arrows move
 * between them, and the position is announced. Image URLs are checked:
 * only http(s), blob: and data:image sources load.
 */
function ImageLightbox({
  images,
  open,
  onOpenChange,
  index: indexProp,
  onIndexChange,
  labels,
  className,
}: ImageLightboxProps) {
  const l = { ...imageLightboxLabels, ...labels };
  const [own, setOwn] = React.useState(0);
  const total = images.length;
  const index = Math.min(Math.max(0, indexProp ?? own), Math.max(0, total - 1));
  const image = images[index];
  const multiple = total > 1;
  const go = (next: number) => {
    if (next < 0 || next >= total || next === index) return;
    if (indexProp === undefined) setOwn(next);
    onIndexChange?.(next);
  };
  // Opened without a DialogTrigger, so remember the opener for Escape and Close.
  const opener = React.useRef<HTMLElement | null>(null);
  const nav =
    'size-10 rounded-full bg-surface-raised/90 shadow-md backdrop-blur-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-40 pointer-coarse:size-11';
  return (
    <Dialog open={open && !!image} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="image-lightbox"
        className={cn('w-[calc(100%-1rem)] max-w-5xl gap-3 p-3 sm:max-w-5xl sm:p-4', className)}
        onOpenAutoFocus={() => {
          const active = document.activeElement;
          opener.current =
            active instanceof HTMLElement && active !== document.body ? active : null;
        }}
        onCloseAutoFocus={(e) => {
          if (!opener.current?.isConnected) return;
          e.preventDefault();
          opener.current.focus();
        }}
        onKeyDown={(e) => {
          if (!multiple) return;
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(index - 1);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(index + 1);
          }
        }}
      >
        <DialogTitle className="sr-only">{image ? image.alt : l.dialog}</DialogTitle>
        <DialogDescription className="sr-only">
          {multiple ? l.position(index + 1, total) : l.dialog}
        </DialogDescription>
        {image && (
          <figure className="grid min-h-0 gap-2">
            <div className="relative grid min-h-40 place-items-center">
              <SafeImage
                key={index}
                image={image}
                unavailable={l.unavailable}
                className="max-h-[calc(100dvh-10rem)] w-auto max-w-full rounded-md"
              />
              {multiple && (
                <>
                  <IconButton
                    variant="ghost"
                    label={l.previous}
                    aria-disabled={index === 0 || undefined}
                    onClick={() => go(index - 1)}
                    className={cn(nav, 'absolute top-1/2 left-2 -translate-y-1/2')}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    label={l.next}
                    aria-disabled={index === total - 1 || undefined}
                    onClick={() => go(index + 1)}
                    className={cn(nav, 'absolute top-1/2 right-2 -translate-y-1/2')}
                  >
                    <ChevronRight />
                  </IconButton>
                </>
              )}
            </div>
            {(image.caption || multiple) && (
              <figcaption className="flex min-w-0 items-baseline justify-between gap-3 px-1 text-sm text-muted-foreground">
                <span className="min-w-0 truncate">{image.caption}</span>
                {multiple && (
                  <span role="status" aria-live="polite" className="shrink-0 text-xs tabular-nums">
                    {l.position(index + 1, total)}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        )}
      </DialogContent>
    </Dialog>
  );
}

export interface ImageGalleryProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  images: LightboxImage[];
  /** Thumbnail height. Default `md` (112px). */
  size?: 'sm' | 'md';
  labels?: Partial<ImageLightboxLabels>;
}

/**
 * Image thumbnails, e.g. the pictures sent with a message, that open the
 * ImageLightbox at the one picked. Each thumbnail is a button named by the
 * image's alt text.
 */
const ImageGallery = React.forwardRef<HTMLDivElement, ImageGalleryProps>(function ImageGallery(
  { images, size = 'md', labels, className, ...props },
  ref,
) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const l = { ...imageLightboxLabels, ...labels };
  if (!images.length) return null;
  return (
    <div
      ref={ref}
      data-slot="image-gallery"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    >
      {images.map((image, i) => (
        <button
          key={`${image.src}-${i}`}
          type="button"
          aria-haspopup="dialog"
          aria-label={image.alt}
          onClick={() => {
            setIndex(i);
            setOpen(true);
          }}
          className={cn(
            'block overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90',
            focusRingClasses,
          )}
        >
          <SafeImage
            image={image}
            unavailable={l.unavailable}
            className={cn(
              'w-auto object-cover',
              size === 'sm' ? 'h-16 max-w-28 min-w-16' : 'h-28 max-w-56 min-w-28',
            )}
          />
        </button>
      ))}
      <ImageLightbox
        images={images}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
        labels={labels}
      />
    </div>
  );
});

export { ImageGallery, ImageLightbox };
