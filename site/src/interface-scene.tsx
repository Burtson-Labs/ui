import * as React from 'react';
import './interface-scene.css';

/** A drafting surface around the real, keyboard-operable component demo. */
export function InterfaceScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="interface-scene">
      <div className="is-caption">
        <span>FROM PARTS TO A WORKSPACE</span>
        <span>01 / UI</span>
      </div>
      <svg
        className="is-drawing"
        viewBox="0 0 460 126"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="is-guide"
          d="M0 31h460M0 63h460M0 95h460M38 0v126M102 0v126M166 0v126M230 0v126M294 0v126M358 0v126M422 0v126"
        />
        <path
          className="is-trace"
          pathLength="1"
          d="M63 65H137Q151 65 151 80v18q0 14 14 14h130q14 0 14-14V79q0-14 14-14h74M230 112v14"
        />
        <rect className="is-surface" x="20" y="40" width="86" height="48" rx="8" />
        <rect className="is-tint" x="32" y="52" width="62" height="24" rx="4" />
        <path className="is-stroke" d="M44 64h25m5-4 4 4-4 4" />
        <rect className="is-surface" x="173" y="19" width="114" height="79" rx="8" />
        <circle className="is-tint" cx="193" cy="38" r="7" />
        <path className="is-ink" d="M208 38h57m-78 18h78m-78 11h58" />
        <rect className="is-tint" x="239" y="78" width="34" height="9" rx="3" />
        <rect className="is-surface" x="354" y="40" width="86" height="48" rx="8" />
        <path className="is-stroke" d="m366 64 5 5 10-11" />
        <path className="is-ink" d="M390 59h36m-36 11h23" />
      </svg>
      <div className="is-demo">{children}</div>
      <div className="is-foot">
        <span className="is-dot" />
        Live components. Try the controls.
      </div>
    </div>
  );
}

const paths = [
  {
    href: '/docs/components/conversation',
    title: 'Conversations',
    body: 'Give the next thought a place to land.',
    kind: 'chat',
  },
  {
    href: '/docs/components/agent-run',
    title: 'Agent work',
    body: 'Make progress and decisions visible.',
    kind: 'agent',
  },
  {
    href: '/docs/components/app-shell',
    title: 'Workspaces',
    body: 'Keep the tools close to the work.',
    kind: 'workspace',
  },
];

export function InterfacePaths() {
  return (
    <nav className="interface-paths" aria-label="Explore component families">
      {paths.map(({ href, title, body, kind }, index) => (
        <a href={href} key={kind}>
          <svg viewBox="0 0 240 112" fill="none" aria-hidden="true" focusable="false">
            <path
              className="is-guide"
              d="M0 28h240M0 56h240M0 84h240M40 0v112M80 0v112M120 0v112M160 0v112M200 0v112"
            />
            {kind === 'chat' && (
              <>
                <rect className="is-surface" x="25" y="15" width="138" height="51" rx="9" />
                <path className="is-ink" d="M41 32h96m-96 13h69" />
                <rect className="is-tint" x="95" y="60" width="121" height="36" rx="9" />
                <path className="is-stroke" d="M111 77h81" />
              </>
            )}
            {kind === 'agent' && (
              <>
                <path className="is-stroke" d="M44 34v49h151" />
                <rect className="is-surface" x="25" y="15" width="189" height="40" rx="7" />
                <circle className="is-tint" cx="44" cy="35" r="9" />
                <path className="is-stroke" d="m39 35 4 4 7-8" />
                <path className="is-ink" d="M64 29h91m-91 11h124" />
                <rect className="is-tint" x="84" y="67" width="131" height="30" rx="6" />
                <path className="is-stroke" d="M98 82h89" />
              </>
            )}
            {kind === 'workspace' && (
              <>
                <rect className="is-surface" x="26" y="14" width="188" height="84" rx="7" />
                <path
                  className="is-ink"
                  d="M26 31h188M68 31v67M36 44h20m-20 12h14m-14 12h20M81 44h66m-66 12h54m-54 12h37"
                />
                <rect className="is-tint" x="165" y="42" width="37" height="44" rx="4" />
              </>
            )}
          </svg>
          <span className="ip-index">0{index + 1}</span>
          <strong>
            {title}
            <span aria-hidden="true">↗</span>
          </strong>
          <p>{body}</p>
        </a>
      ))}
    </nav>
  );
}
