import { GAMES } from '../game/config.js'

export function ResultBanner({ outcome, title, detail }) {
  const labels = { win: 'Ganaste', lose: 'Ganó la casa', tie: 'Empate' }
  return <div className={`result-banner result-${outcome}`} role="status"><span className="result-symbol" aria-hidden="true">{outcome === 'win' ? '✦' : outcome === 'tie' ? '◇' : '−'}</span><div><strong>{title || labels[outcome]}</strong><p>{detail}</p></div><span className="result-ornament" aria-hidden="true">✧</span></div>
}

export function GameFrame({ id, children, onHelp, status, phase }) {
  const game = GAMES[id]
  return <div className="game-page" data-phase={phase}>
    <header className="site-header game-header"><a href="#inicio" className="brand" aria-label="Royal Table, volver al inicio"><span className="brand-symbol">♛</span><span>Royal <em>Table</em></span></a><div className="header-actions"><span className="variant-tag">{game.name}</span><button className="text-button" type="button" onClick={onHelp}>Cómo jugar <span aria-hidden="true">↗</span></button></div></header>
    <main id="contenido" className="game-main" tabIndex={-1}><div className="game-intro"><div><p className="section-kicker">Mesa {game.number} / {game.name}</p><h1>{game.name}</h1><p>{game.goal}</p></div><span className="game-intro-crest" aria-hidden="true">♛</span></div>
      <div className={`turn-cue ${phase === 'complete' ? 'cue-complete' : ''}`} role="status" aria-live="polite"><span className="cue-dot" aria-hidden="true" /><span className="cue-text" key={status}>{status}</span></div>
      {children}
      <p className="variant-note"><span aria-hidden="true">✧</span> Variante de esta mesa: {game.variant}</p>
    </main>
  </div>
}

export function ActionPanel({ title, description, children }) {
  return <div className="action-panel"><div className="action-copy"><strong>{title}</strong><span>{description}</span></div><div className="action-buttons">{children}</div></div>
}

export function HelpFooter({ children, href }) {
  return <><p className="help-foot">{children}</p>{href && <a href={href} target="_blank" rel="noreferrer">Consultar reglas de referencia ↗</a>}</>
}
