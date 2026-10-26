import * as React from 'react';

import { Slot } from './slot';
import { useCallbackRef } from './use-callback-ref';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * An avatar: an image with a fallback (initials, an icon) for while it
 * loads and when it fails. The image is loaded off-screen first; the `<img>`
 * is rendered only once it has loaded, so a broken image never shows. The
 * status runs idle → loading → loaded | error and starts again when `src`,
 * `referrerPolicy` or `crossOrigin` change. The fallback shows whenever the
 * image is not loaded, after `delayMs` if given (so a fast connection never
 * flashes the initials).
 */

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface AvatarContextValue {
  status: ImageLoadingStatus;
  setStatus: (status: ImageLoadingStatus) => void;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

function useAvatar(component: string): AvatarContextValue {
  const context = React.useContext(AvatarContext);
  if (!context) throw new Error(`${component} must be inside an Avatar`);
  return context;
}

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { asChild = false, ...props },
  ref,
) {
  const [status, setStatus] = React.useState<ImageLoadingStatus>('idle');
  const context = React.useMemo(() => ({ status, setStatus }), [status]);
  const Comp = asChild ? Slot : 'span';
  return (
    <AvatarContext.Provider value={context}>
      <Comp {...props} ref={ref} />
    </AvatarContext.Provider>
  );
});

/**
 * Loads `src` in a detached image and reports its status. A cached image
 * that is already complete reports "loaded" at once.
 */
export function useImageLoadingStatus(
  src: string | undefined,
  { referrerPolicy, crossOrigin }: Pick<AvatarImageProps, 'referrerPolicy' | 'crossOrigin'> = {},
): ImageLoadingStatus {
  const [status, setStatus] = React.useState<ImageLoadingStatus>('idle');
  useIsoLayoutEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }
    const image = new window.Image();
    let live = true;
    const settle = (next: ImageLoadingStatus) => {
      if (live) setStatus(next);
    };
    const onLoad = () => settle('loaded');
    const onError = () => settle('error');
    image.addEventListener('load', onLoad);
    image.addEventListener('error', onError);
    if (referrerPolicy) image.referrerPolicy = referrerPolicy;
    if (crossOrigin !== undefined)
      image.crossOrigin = crossOrigin === '' ? 'anonymous' : crossOrigin;
    image.src = src;
    setStatus(image.complete && image.naturalWidth > 0 ? 'loaded' : 'loading');
    return () => {
      live = false;
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
    };
  }, [src, referrerPolicy, crossOrigin]);
  return status;
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  asChild?: boolean;
  /** Called with each new status: "loading", then "loaded" or "error". */
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(function AvatarImage(
  { asChild = false, src, onLoadingStatusChange, ...props },
  ref,
) {
  const context = useAvatar('AvatarImage');
  const status = useImageLoadingStatus(src, props);
  const report = useCallbackRef(onLoadingStatusChange);
  const { setStatus } = context;
  useIsoLayoutEffect(() => {
    if (status === 'idle') return;
    setStatus(status);
    report(status);
  }, [status, setStatus, report]);
  // When the image leaves, the fallback comes back.
  useIsoLayoutEffect(() => () => setStatus('idle'), [setStatus]);
  if (status !== 'loaded') return null;
  const Comp = asChild ? Slot : 'img';
  return <Comp src={src} {...props} ref={ref} />;
});

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  /** Wait this long before showing the fallback. */
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ asChild = false, delayMs, ...props }, ref) {
    const context = useAvatar('AvatarFallback');
    const [waited, setWaited] = React.useState(delayMs === undefined);
    React.useEffect(() => {
      if (delayMs === undefined) return;
      const timer = setTimeout(() => setWaited(true), delayMs);
      return () => clearTimeout(timer);
    }, [delayMs]);
    if (!waited || context.status === 'loaded') return null;
    const Comp = asChild ? Slot : 'span';
    return <Comp {...props} ref={ref} />;
  },
);

export {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarFallback as Fallback,
  AvatarImage as Image,
  Avatar as Root,
};
