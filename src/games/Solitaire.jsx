import { useState } from 'react'
import { CardBack, CardFace, GoldButton, HelpDialog, TableFelt } from '../components/Table.jsx'
import { ActionPanel, GameFrame, ResultBanner } from '../components/GameShell.jsx'
import { createDeck, shuffleDeck, SUITS } from '../game/rules.js'
import { createSolitaireGame, drawSolitaireStock, moveSolitaireCards } from '../game/solitaire.js'

const newState = (id = 0) => ({ game: createSolitaireGame(shuffleDeck(createDeck())), history: [], selected: null, message: 'Elige una carta visible y luego su destino.', id })
const cardName = (card) => `${card.rank} de ${SUITS.find((suit) => suit.key === card.suit).name}`

export function Solitaire() {
  const [state, setState] = useState(() => newState())
  const [help, setHelp] = useState(false)
  const { game, selected } = state
  const validFoundations = selected ? new Set(SUITS.filter((suit) => moveSolitaireCards(game, selected, { kind: 'foundation', suit: suit.key })).map((suit) => suit.key)) : new Set()
  const validColumns = selected ? new Set(game.tableau.map((_, index) => moveSolitaireCards(game, selected, { kind: 'tableau', column: index }) ? index : -1)) : new Set()

  const draw = () => setState((current) => {
    const next = drawSolitaireStock(current.game)
    return next ? { ...current, game: next, history: [...current.history, current.game], selected: null, message: current.game.stock.length ? 'Carta robada. Puedes moverla al tablero o a un cimiento.' : 'Descarte reciclado. Sigue robando cartas.' } : { ...current, message: 'No quedan cartas para robar.' }
  })

  const choose = (source) => setState((current) => {
    if (current.selected?.kind === source.kind && current.selected?.column === source.column && current.selected?.index === source.index) return { ...current, selected: null, message: 'Selección cancelada.' }
    if (current.selected && source.kind === 'tableau') {
      const moved = moveSolitaireCards(current.game, current.selected, { kind: 'tableau', column: source.column })
      if (moved) return { ...current, game: moved, history: [...current.history, current.game], selected: null, message: 'Cartas movidas. Busca un as para iniciar un cimiento.' }
    }
    return { ...current, selected: source, message: 'Ahora toca una columna o un cimiento compatible.' }
  })

  const moveTo = (target) => setState((current) => {
    if (!current.selected) return { ...current, message: 'Primero elige una carta visible del tablero o el descarte.' }
    const moved = moveSolitaireCards(current.game, current.selected, target)
    return moved ? { ...current, game: moved, history: [...current.history, current.game], selected: null, message: moved.won ? '¡Completaste los cuatro cimientos!' : 'Movimiento realizado.' }
      : { ...current, message: 'Ese movimiento no está permitido. Alterna colores y baja de valor en el tablero.' }
  })

  const undo = () => setState((current) => current.history.length ? { ...current, game: current.history.at(-1), history: current.history.slice(0, -1), selected: null, message: 'Último movimiento deshecho.' } : current)
  const status = game.won ? '¡Solitario completado! Los cuatro palos llegan al rey.' : state.message

  return <GameFrame id="solitario" onHelp={() => setHelp(true)} status={status} phase={game.won ? 'complete' : 'playing'}>
    <a className="back-link" href="#solo">← Elegir otro juego</a>
    <TableFelt className="solitaire-table" key={state.id}>
      <div className="solitaire-inner">
        <div className="solitaire-top">
          <div className="solitaire-draw"><div><span className="pile-label">Mazo · {game.stock.length}</span><button type="button" className="sol-slot sol-stock" onClick={draw} disabled={game.won || (!game.stock.length && !game.waste.length)} aria-label={game.stock.length ? `Robar carta del mazo, quedan ${game.stock.length}` : 'Reciclar descarte'}>{game.stock.length ? <CardBack /> : <span aria-hidden="true">↻</span>}</button></div>
            <div><span className="pile-label">Descarte</span><button type="button" className={`sol-slot ${selected?.kind === 'waste' ? 'sol-selected' : ''}`} onClick={() => game.waste.length && choose({ kind: 'waste' })} disabled={!game.waste.length || game.won} aria-label={game.waste.length ? `Elegir ${cardName(game.waste.at(-1))} del descarte` : 'Descarte vacío'}>{game.waste.length ? <CardFace key={game.waste.at(-1).id} card={game.waste.at(-1)} /> : <span aria-hidden="true">◇</span>}</button></div></div>
          <div className="solitaire-foundations" aria-label="Cimientos">{SUITS.map((suit) => { const pile = game.foundations[suit.key]; return <div key={suit.key}><span className="pile-label">{suit.name}</span><button type="button" className={`sol-slot sol-foundation ${suit.key === 'hearts' || suit.key === 'diamonds' ? 'sol-red' : ''} ${validFoundations.has(suit.key) ? 'sol-valid-target' : ''}`} onClick={() => moveTo({ kind: 'foundation', suit: suit.key })} disabled={game.won} aria-label={`Cimiento de ${suit.name}${pile.length ? `, carta superior ${cardName(pile.at(-1))}` : ', vacío'}`}>{pile.length ? <CardFace key={pile.at(-1).id} card={pile.at(-1)} /> : <span aria-hidden="true">{suit.symbol}</span>}</button></div> })}</div>
        </div>
        <div className="solitaire-divider"><span>ORDENA LOS SIETE MONTONES</span></div>
        <p className="solitaire-mobile-hint">Desliza el tablero para ver las 7 columnas <span aria-hidden="true">↔</span></p>
        <div className="solitaire-scroll" tabIndex={0} aria-label="Tablero de siete columnas, desplaza horizontalmente en móvil"><div className="solitaire-columns">{game.tableau.map((column, columnIndex) => <div className={`sol-column ${validColumns.has(columnIndex) ? 'sol-valid-target' : ''}`} key={columnIndex} style={{ '--column-cards': column.length }}><span className="pile-label">{columnIndex + 1}</span><button type="button" className="sol-column-target" onClick={() => moveTo({ kind: 'tableau', column: columnIndex })} aria-label={`Mover selección a columna ${columnIndex + 1}`} disabled={!selected || game.won} />{column.map(({ card, faceUp }, index) => <button type="button" key={card.id} className={`sol-table-card ${selected?.kind === 'tableau' && selected.column === columnIndex && selected.index === index ? 'sol-selected' : ''}`} style={{ '--card-position': index }} disabled={!faceUp || game.won} onClick={() => choose({ kind: 'tableau', column: columnIndex, index })} aria-label={faceUp ? `Elegir ${cardName(card)} en columna ${columnIndex + 1}${index < column.length - 1 ? ' y las cartas debajo' : ''}` : 'Carta boca abajo'}>{faceUp ? <CardFace card={card} /> : <CardBack />}</button>)}</div>)}</div></div>
      </div>
    </TableFelt>
    <ActionPanel title={game.won ? '¡Mesa completada!' : selected ? 'Elige destino' : 'Tu siguiente movimiento'} description={selected ? 'Los destinos disponibles se iluminan. Para una columna vacía necesitas un rey.' : 'Toca una carta visible y después otra columna o un cimiento. Roba del mazo cuando necesites más opciones.'}><button className="secondary-button" type="button" onClick={undo} disabled={!state.history.length}>Deshacer</button><GoldButton onClick={() => setState((current) => newState(current.id + 1))}>Nueva partida</GoldButton></ActionPanel>
    {game.won && <ResultBanner outcome="win" title="¡Solitario completado!" detail="Cada palo llegó del as al rey." />}
    {help && <HelpDialog title="Cómo jugar Solitario" onClose={() => setHelp(false)}><div className="help-content"><p>Klondike de una carta. Tu objetivo es completar los cuatro cimientos, uno por palo, del as al rey.</p><ol><li>En las siete columnas, coloca cartas de mayor a menor alternando rojo y negro. Puedes mover una secuencia visible.</li><li>Solo un rey puede ocupar una columna vacía. Al descubrir una carta boca abajo, se voltea.</li><li>Toca una carta y luego su destino. Los ases abren los cimientos; sigue con 2, 3… del mismo palo.</li><li>Toca el mazo para robar una carta. Al agotarse, recicla el descarte sin límite. Puedes deshacer movimientos.</li></ol><p>No se devuelven cartas desde los cimientos al tablero.</p><a href="https://bicyclecards.com/how-to-play/klondike" target="_blank" rel="noreferrer">Reglas de Klondike ↗</a></div></HelpDialog>}
  </GameFrame>
}
