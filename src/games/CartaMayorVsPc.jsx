import { useEffect, useState } from 'react'
import { DeckStack, GoldButton, HelpDialog, PlayerHand, TableFelt } from '../components/Table.jsx'
import { ActionPanel, GameFrame, HelpFooter, ResultBanner } from '../components/GameShell.jsx'
import { chooseBotCard, createDeck, highCardResult, shuffleDeck } from '../game/rules.js'

export function CartaMayorVsPc() {
  const [round, setRound] = useState(null)
  const [help, setHelp] = useState(false)

  const start = () => {
    const deck = shuffleDeck(createDeck())
    setRound({ player: deck.slice(0, 3), pc: deck.slice(3, 6), phase: 'choose', playerIndex: -1, pcIndex: -1, outcome: null, id: Date.now() + Math.random() })
  }

  const choose = (index) => {
    setRound((current) => current?.phase === 'choose' ? { ...current, playerIndex: index, phase: 'bot' } : current)
  }

  useEffect(() => {
    if (round?.phase !== 'bot') return undefined
    const timer = setTimeout(() => setRound((current) => {
      if (current?.phase !== 'bot') return current
      const pcIndex = chooseBotCard(current.pc)
      return { ...current, pcIndex, phase: 'complete', outcome: highCardResult(current.player[current.playerIndex], current.pc[pcIndex]) }
    }), 650)
    return () => clearTimeout(timer)
  }, [round])

  const phase = round?.phase || 'ready'
  const status = phase === 'ready' ? 'Reparte para ver tus tres cartas.' : phase === 'choose' ? 'Tu turno: elige una de tus cartas. La PC no puede ver tu elección.' : phase === 'bot' ? 'La PC está eligiendo la carta más alta de su mano…' : round.outcome === 'tie' ? 'Ambos jugaron el mismo valor: empate.' : round.outcome === 'win' ? 'Tu carta venció a la de la PC.' : 'La carta de la PC fue más alta.'
  const played = round?.phase === 'complete' ? { player: round.player[round.playerIndex], pc: round.pc[round.pcIndex] } : null

  return <GameFrame id="carta-mayor-pc" onHelp={() => setHelp(true)} status={status} phase={phase}>
    <nav className="mode-switch" aria-label="Modo de Carta Mayor"><a href="#carta-mayor">Ronda rápida</a><a href="#carta-mayor-pc" aria-current="page">Jugador vs PC</a></nav>
    <TableFelt key={round?.id || 'empty'} className="duel-table"><div className="table-inner">
      <PlayerHand label="La PC" cards={round?.pc} allHidden={phase !== 'complete'} selectedIndex={round?.pcIndex} empty="La PC espera sus cartas" />
      <div className="table-center"><DeckStack /><span className="table-ornament">DUELO DE CARTA MAYOR</span></div>
      <PlayerHand label="Tu mano" cards={round?.player} onCardSelect={phase === 'choose' ? choose : undefined} selectedIndex={round?.playerIndex} active={phase === 'choose'} empty="Reparte para elegir" />
    </div></TableFelt>
    <ActionPanel title={phase === 'choose' ? 'Elige tu carta' : phase === 'bot' ? 'La PC decide' : phase === 'complete' ? 'Duelo terminado' : 'Tres cartas por lado'} description={phase === 'choose' ? 'Toca la carta que quieres jugar. El as es la más alta.' : phase === 'bot' ? 'La PC compara sus cartas y juega la de mayor valor.' : phase === 'complete' ? 'Todas las cartas están visibles para comprobar la elección.' : 'La PC elegirá su carta más alta después de ti.'}>
      {phase === 'ready' || phase === 'complete' ? <GoldButton onClick={start}>{phase === 'ready' ? 'Repartir cartas' : 'Nuevo duelo'} <span aria-hidden="true">→</span></GoldButton> : phase === 'bot' ? <GoldButton disabled>La PC está jugando…</GoldButton> : <span className="pick-prompt">Selecciona una carta de tu mano ↑</span>}
    </ActionPanel>
    {played && <ResultBanner outcome={round.outcome} detail={`Jugaste ${played.player.rank}; la PC jugó ${played.pc.rank}. ${round.outcome === 'tie' ? 'Los palos no desempatan.' : 'Gana el valor más alto.'}`} />}
    {help && <HelpDialog title="Cómo jugar contra la PC" onClose={() => setHelp(false)}><div className="help-content"><p>Es una variante de Carta Mayor creada para Royal Table. Cada lado recibe tres cartas de una baraja de 52.</p><ol><li>Reparte y elige una de tus tres cartas.</li><li>La PC elige automáticamente la carta de mayor valor de su mano, sin ver tu elección.</li><li>Se revelan todas las cartas. Gana la carta jugada más alta; dos valores iguales empatan.</li></ol><HelpFooter>El as es alto y los palos no desempatan. Las cartas no jugadas se descartan; cada duelo usa una baraja nueva. No hay niveles ni puntuación acumulada.</HelpFooter></div></HelpDialog>}
  </GameFrame>
}
