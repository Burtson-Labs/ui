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
  if (to === window.location.pathname) return;
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
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
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || !href.startsWith('/'))
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
