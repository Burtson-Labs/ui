import { ArrowRight, Eye, KeyRound, Shield } from '@burtson-labs/icons/react';
import type { CSSProperties } from 'react';

import { Link } from './router';
import './design-language.css';

const families = [
  {
    name: 'Burtson Labs',
    tone: '#87c6ef',
    lightTone: '#226489',
    lightSupport: '#526b7d',
    support: '#dce8f1',
    purpose: 'The craft behind the tools.',
    context: 'Shared foundations, components, infrastructure, and the people building them.',
    href: 'https://burtson.ai',
    action: 'Explore the tools',
  },
  {
    name: 'Bandit & Stealth',
    tone: '#65d3bd',
    lightTone: '#087c68',
    lightSupport: '#906018',
    support: '#e8ba78',
    purpose: 'Private work. Visible decisions.',
    context: 'Model choice, useful context, explicit permissions, and work people can inspect.',
    href: 'https://banditailabs.com/trust',
    action: 'Read the trust story',
  },
  {
    name: 'TrueMarks',
    tone: '#4fc3f7',
    lightTone: '#007bac',
    lightSupport: '#42688e',
    support: '#9cbce0',
    purpose: 'Keep the evidence in context.',
    context:
      'Recovery, examination, and deliberate presentation, with the original clearly distinguished from a derivative.',
    href: 'https://truemarks.ai',
    action: 'Explore TrueMarks',
  },
];

export function DesignLanguage() {
  return (
    <article className="design-language">
      <header>
        <p className="overline">Burtson design language</p>
        <h1>
          One foundation.
          <br />
          Distinct identities.
        </h1>
        <p className="dl-lead">
          A familiar way to work across Burtson Labs, Bandit, Stealth, and TrueMarks. Shared
          components and icons carry the behavior. Each product keeps its own voice, color, and
          purpose.
        </p>
      </header>
      <div className="dl-families">
        {families.map(
          (
            { name, tone, support, lightTone, lightSupport, purpose, context, href, action },
            index,
          ) => (
            <section
              key={name}
              className="dl-family"
              style={
                {
                  '--dl-dark-accent': tone,
                  '--dl-dark-support': support,
                  '--dl-light-accent': lightTone,
                  '--dl-light-support': lightSupport,
                } as CSSProperties
              }
            >
              <div className="dl-specimen" aria-hidden="true">
                <span>
                  0{index + 1} / {name}
                </span>
                <div className="dl-sample">
                  <div className="dl-sample-rail">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="dl-sample-body">
                    <Shield size={24} />
                    <b />
                    <b />
                    <div>
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                </div>
                <div className="dl-swatches">
                  <i />
                  <i />
                  <span>ILLUSTRATION PALETTE</span>
                </div>
              </div>
              <div className="dl-family-copy">
                <h2>{name}</h2>
                <strong>{purpose}</strong>
                <p>{context}</p>
                <a href={href}>
                  {action} <ArrowRight size={14} />
                </a>
              </div>
            </section>
          ),
        )}
      </div>
      <section className="dl-section">
        <p className="overline">Trust is an interaction</p>
        <h2>Make the next decision clear.</h2>
        <p>
          Bandit means independence in the tools you choose. Stealth means discretion with sensitive
          work. The interface expresses those ideas through understandable boundaries, visible
          activity, and deliberate authority.
        </p>
        <div className="dl-rules">
          {[
            {
              Icon: KeyRound,
              title: 'Show the boundary',
              body: 'Name the workspace, model, account, and destination when they affect a decision. Explain when context will leave the local environment.',
            },
            {
              Icon: Eye,
              title: 'Show the work',
              body: 'Keep progress, results, failures, and recovery visible. Concept illustrations stay separate from real product screenshots and actual system status.',
            },
            {
              Icon: Shield,
              title: 'Show the authority',
              body: 'Approval controls state the action, scope, and duration. Distinguish an action the user authorized from an example or a marketing demonstration.',
            },
          ].map(({ Icon, title, body }) => (
            <div key={title}>
              <Icon size={22} aria-hidden />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="dl-section">
        <p className="overline">The visual grammar</p>
        <h2>Graphics that explain the work.</h2>
        <ul>
          <li>
            <strong>Start with the product.</strong> Draw a document, a change, a frame, or a
            component. Connect them only when the connection has meaning.
          </li>
          <li>
            <strong>Use a quiet construction grid.</strong> Thin guides, registration marks, and
            layered surfaces support the subject. Keep them behind the text.
          </li>
          <li>
            <strong>Keep information available.</strong> Product choices and capabilities should be
            understandable without hovering, opening an accordion, or waiting for an animation.
          </li>
          <li>
            <strong>Make motion optional.</strong> Prefer a short entrance or a purposeful
            transition. Honor reduced motion and provide a pause control for ongoing movement.
          </li>
          <li>
            <strong>Use semantic colors.</strong> Brand colors give identity. Error, warning,
            success, and permission states retain consistent meaning and text labels.
          </li>
          <li>
            <strong>Build for touch and keyboards.</strong> Visible focus, generous targets,
            readable type, and layouts that work at phone widths are part of the design.
          </li>
        </ul>
      </section>
      <section className="dl-section">
        <p className="overline">The words matter, too</p>
        <h2>Specific promises. Verifiable behavior.</h2>
        <p>
          Explain privacy in terms of the selected deployment and providers. Describe permission
          modes precisely. Link to evidence for security and release claims. Label planned
          capabilities as planned, and keep compliance readiness separate from an independent audit
          or attestation.
        </p>
        <p>
          For TrueMarks, distinguish the source from an annotated or derived output and make the
          decision to present evidence explicit. For Bandit and Stealth, make model and tool access
          understandable.
        </p>
      </section>
      <nav className="dl-next" aria-label="Design system resources">
        <Link href="/docs/theming">
          Use the theme tokens <ArrowRight size={16} />
        </Link>
        <a href="https://icons.burtson.ai">
          Use Burtson Icons <ArrowRight size={16} />
        </a>
        <Link href="/docs/components/agent-run">
          See the agent components <ArrowRight size={16} />
        </Link>
      </nav>
    </article>
  );
}
