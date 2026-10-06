import { useEffect, useRef } from 'react'

const RED_SUITS = new Set(['hearts', 'diamonds'])

export function CardFace({ card }) {
  return (
    <div className={`card-face ${RED_SUITS.has(card.suit) ? 'is-red' : ''} ${['J', 'Q', 'K'].includes(card.rank) ? 'is-court' : ''}`} aria-hidden="true">
      <span className="card-corner"><strong>{card.rank}</strong><span>{card.symbol}</span></span>
      <span className="card-center"><span>{card.symbol}</span></span>
      <span className="card-corner card-corner-bottom"><strong>{card.rank}</strong><span>{card.symbol}</span></span>
    </div>
  )
}

export function CardBack() {
  return <div className="card-back" aria-hidden="true"><span className="card-back-emblem">✦</span></div>
}

export function Card({ card, hidden = false, index = 0, onSelect, selected = false, dimmed = false }) {
  const label = hidden ? 'Carta boca abajo' : `${card.rank} de ${({ spades: 'picas', hearts: 'corazones', clubs: 'tréboles', diamonds: 'diamantes' })[card.suit]}`
  return (
    <li className={`playing-card ${hidden ? 'is-hidden' : 'is-face-up'} ${selected ? 'is-selected' : ''} ${dimmed ? 'is-muted' : ''}`} style={{ '--deal-index': index }} aria-label={selected ? `${label}, carta jugada` : label}>
      {onSelect && !hidden ? <button className="card-pick" type="button" onClick={onSelect} aria-label={`Elegir ${label}`}><CardFace card={card} /></button> : hidden ? <CardBack /> : <CardFace card={card} />}
    </li>
  )
}

export function PlayerHand({ label, cards = [], hiddenIndex = -1, allHidden = false, onCardSelect, selectedIndex = -1, total, active = false, empty = 'Las cartas aparecerán aquí' }) {
  return (
    <section className={`hand ${active ? 'hand-active' : ''}`} aria-label={label}>
      <div className="hand-heading"><h2>{label}</h2>{total !== undefined && <span className="hand-total">{total}</span>}</div>
      {cards.length ? (
        <ul className="card-row" aria-label={`Cartas de ${label}`}>
          {cards.map((card, index) => <Card key={card.id} card={card} hidden={allHidden || index === hiddenIndex} index={index} onSelect={onCardSelect ? () => onCardSelect(index) : undefined} selected={index === selectedIndex} dimmed={selectedIndex >= 0 && index !== selectedIndex} />)}
        </ul>
      ) : <p className="hand-empty">{empty}</p>}
    </section>
  )
}

export function DeckStack({ small = false }) {
  return <div className={`deck-stack ${small ? 'deck-small' : ''}`} aria-hidden="true"><CardBack /></div>
}

export function ShuffleDeck({ children, active = false }) {
  return <div className={active ? 'shuffle-active' : ''}>{children}</div>
}

export function TableFelt({ children, className = '' }) {
  return <div className={`table-felt ${className}`}>{children}</div>
}

export function GoldButton({ children, className = '', ...props }) {
  return <button className={`gold-button ${className}`} type="button" {...props}>{children}</button>
}

export function HelpDialog({ title, children, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    const node = dialog.current
    // El navegador retira el diálogo al desmontarlo. Cerrarlo en el cleanup
    // dispararía onClose durante la comprobación doble de efectos de StrictMode.
    if (node && !node.open) node.showModal()
  }, [])
  return (
    <dialog ref={dialog} className="help-dialog" onClose={onClose} onClick={(event) => {
      if (event.target === dialog.current) dialog.current.close()
    }} aria-labelledby="help-title">
      <div className="dialog-inner">
        <div className="dialog-top"><span className="dialog-mark">✦</span><button className="icon-button" type="button" onClick={() => dialog.current.close()} aria-label="Cerrar instrucciones">×</button></div>
        <h2 id="help-title">{title}</h2>
        {children}
        <GoldButton onClick={() => dialog.current.close()}>Entendido</GoldButton>
      </div>
    </dialog>
  )
}
