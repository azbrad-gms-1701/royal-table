import { useState } from 'react'
import { CardFace, DeckStack, GoldButton, HelpDialog, TableFelt } from '../components/Table.jsx'
import { ActionPanel, GameFrame, ResultBanner } from '../components/GameShell.jsx'
import { createDeck, highCardValue, shuffleDeck, SUITS } from '../game/rules.js'

const newRound = () => ({ deck: shuffleDeck(createDeck()), current: null, revealed: null, guess: null, outcome: null, phase: 'ready', id: Math.random() })
const cardName = (card) => `${card.rank} de ${SUITS.find((suit) => suit.key === card.suit).name}`

export function HighLow() {
  const [round, setRound] = useState(newRound)
  const [help, setHelp] = useState(false)
  const start = () => setRound(() => { const fresh = newRound(); return { ...fresh, current: fresh.deck[0], deck: fresh.deck.slice(1), phase: 'guess' } })
  const guess = (direction) => setRound((current) => {
    if (current.phase !== 'guess' || !current.deck.length) return current
    const revealed = current.deck[0]
    const difference = highCardValue(revealed) - highCardValue(current.current)
    const outcome = difference === 0 ? 'tie' : (direction === 'higher' ? difference > 0 : difference < 0) ? 'win' : 'lose'
    return { ...current, revealed, guess: direction, outcome, phase: 'result', deck: current.deck.slice(1) }
  })
  const next = () => setRound((current) => current.phase === 'result' ? { ...current, current: current.revealed, revealed: null, guess: null, outcome: null, phase: current.deck.length ? 'guess' : 'end' } : current)
  const status = round.phase === 'ready' ? 'Descubre la primera carta para empezar.' : round.phase === 'guess' ? 'Tu turno: predice si la siguiente carta será mayor o menor.' : round.phase === 'end' ? 'Se acabó la baraja. Puedes empezar otra partida.' : round.outcome === 'tie' ? 'Mismo valor: predicción nula.' : round.outcome === 'win' ? 'Acertaste la predicción.' : 'Esta vez no acertaste.'
  return <GameFrame id="alta-baja" onHelp={() => setHelp(true)} status={status} phase={round.phase === 'result' || round.phase === 'end' ? 'complete' : round.phase}>
    <a className="back-link" href="#solo">← Elegir otro juego</a>
    <TableFelt className="high-low-table" key={round.id}><div className="high-low-inner"><div className="high-low-card"><span>Tu carta</span><div className="high-low-card-art" role="img" aria-label={round.current ? cardName(round.current) : 'Baraja boca abajo'}>{round.current ? <CardFace key={round.current.id} card={round.current} /> : <DeckStack />}</div></div><div className="high-low-symbol" aria-hidden="true">→</div><div className="high-low-card"><span>Siguiente carta</span><div className="high-low-card-art" role="img" aria-label={round.revealed ? cardName(round.revealed) : 'Carta aún oculta'}>{round.revealed ? <CardFace key={round.revealed.id} card={round.revealed} /> : <DeckStack />}</div></div></div></TableFelt>
    <ActionPanel title={round.phase === 'guess' ? '¿Mayor o menor?' : round.phase === 'result' ? 'Predicción resuelta' : round.phase === 'end' ? 'Baraja terminada' : 'Empieza la partida'} description={round.phase === 'guess' ? `Quedan ${round.deck.length} cartas. El as es alto; una igualdad queda nula.` : round.phase === 'result' ? 'La carta revelada será la nueva carta de referencia.' : 'Cada predicción es independiente; no se guardan puntos.'}>
      {round.phase === 'ready' || round.phase === 'end' ? <GoldButton onClick={start}>{round.phase === 'ready' ? 'Descubrir carta' : 'Nueva baraja'} →</GoldButton> : round.phase === 'guess' ? <><button type="button" className="secondary-button" onClick={() => guess('lower')}>Será menor ↓</button><GoldButton onClick={() => guess('higher')}>Será mayor ↑</GoldButton></> : <GoldButton onClick={next}>{round.deck.length ? 'Siguiente predicción' : 'Ver final'} →</GoldButton>}
    </ActionPanel>
    {round.phase === 'result' && <ResultBanner outcome={round.outcome} title={round.outcome === 'tie' ? 'Mismo valor' : round.outcome === 'win' ? 'Predicción acertada' : 'Predicción fallida'} detail={`Salió ${round.revealed.rank}${round.revealed.symbol} después de ${round.current.rank}${round.current.symbol}. ${round.outcome === 'tie' ? 'Los palos no desempatan.' : 'Puedes intentarlo con la siguiente carta.'}`} />}
    {help && <HelpDialog title="Cómo jugar Alta o Baja" onClose={() => setHelp(false)}><div className="help-content"><p>Variante simple de Royal Table para una persona, con una baraja de 52 cartas y sin oponentes.</p><ol><li>Mira tu carta actual y predice si la siguiente será mayor o menor.</li><li>Se revela una carta. Si acertaste, ganas esa predicción; si tiene el mismo valor, queda nula.</li><li>La carta revelada pasa a ser la referencia de la siguiente predicción. Continúa hasta agotar la baraja.</li></ol><p>El as es alto y los palos no desempatan. No hay puntuación acumulada, niveles ni datos guardados.</p></div></HelpDialog>}
  </GameFrame>
}
