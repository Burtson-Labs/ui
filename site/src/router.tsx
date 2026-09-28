import * as React from 'react';

/** A tiny pathname router: the site has a handful of static routes. */
export function usePath(): string {
  const [path, setPath] = React.useState(() => window.location.pathname);
  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

export function navigate(to: string) {
  if (to === window.location.pathname) {
    // Selecting the current component should also leave an API-reference anchor.
    window.history.replaceState(null, '', to);
  } else {
    window.history.pushState(null, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  // Override the site's smooth anchor scrolling. WebKit can interrupt that
  // animation as a route changes or a menu closes, leaving the preview offscreen.
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

export function Link({
  href,
  onClick,
  children,
  ...props
}: React.ComponentProps<'a'> & { href: string }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          props.target === '_blank' ||
          props.download != null ||
          !href.startsWith('/') ||
          href.startsWith('//')
        )
          return;
        e.preventDefault();
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
