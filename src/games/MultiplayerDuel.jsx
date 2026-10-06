import { useEffect, useState } from 'react'
import { DeckStack, GoldButton, HelpDialog, PlayerHand, TableFelt } from '../components/Table.jsx'
import { ActionPanel, GameFrame, ResultBanner } from '../components/GameShell.jsx'
import { createDeck, shuffleDeck } from '../game/rules.js'
import { createDuelRound, finishDuelWithoutBots, playNextBot, selectDuelCard } from '../game/duel.js'

export function MultiplayerDuel({ humans, bots }) {
  const [round, setRound] = useState(null)
  const [help, setHelp] = useState(false)
  const [dealId, setDealId] = useState(0)

  const start = () => {
    setRound(createDuelRound(shuffleDeck(createDeck()), humans, bots))
    setDealId((id) => id + 1)
  }

  useEffect(() => {
    if (round?.phase !== 'bots') return undefined
    const timer = setTimeout(() => setRound((current) => current?.phase === 'bots'
      ? current.botTurn === current.seats.length ? finishDuelWithoutBots(current) : playNextBot(current)
      : current), 500)
    return () => clearTimeout(timer)
  }, [round])

  const phase = round?.phase || 'ready'
  const active = round?.seats[round.turn]
  const currentBot = round?.seats[round.botTurn]
  const activeSeat = phase === 'bots' ? round?.botTurn : round?.turn
  const winners = round?.winners.map((id) => round.seats[id].name).join(' y ')
  const status = phase === 'ready' ? 'Reparte las cartas para iniciar la mesa.'
    : phase === 'handoff' ? `Pasa el ordenador a ${active.name}. Sus cartas siguen ocultas.`
      : phase === 'choose' ? `Turno de ${active.name}: elige una de sus tres cartas.`
        : phase === 'bots' ? currentBot?.bot ? `${currentBot.name} está eligiendo su carta…` : 'Se están comparando las cartas…'
          : round.winners.length > 1 ? `Empate entre ${winners}.` : `Ganó ${winners}.`

  return <GameFrame id="duelo" onHelp={() => setHelp(true)} status={status} phase={phase}>
    <a className="back-link" href="#multijugador">← Cambiar participantes</a>
    <TableFelt className="multi-table" key={dealId}>
      <div className="multi-table-inner">
        <div className="multi-seats" aria-label="Participantes">
          {Array.from({ length: humans + bots }, (_, index) => {
            const seat = round?.seats[index]
            const isWinner = phase === 'complete' && round.winners.includes(index)
            return <div className={`seat-chip ${seat?.id === activeSeat && phase !== 'complete' ? 'seat-current' : ''} ${isWinner ? 'seat-winner' : ''}`} key={index}>
              <span aria-hidden="true">{index < humans ? '♟' : '✦'}</span>
              <strong>{index < humans ? `Jugador ${index + 1}` : `Bot ${index - humans + 1}`}</strong>
              <small>{isWinner ? 'Ganador' : seat?.choice !== null && seat?.choice !== undefined ? 'Carta elegida' : 'En espera'}</small>
            </div>
          })}
        </div>
        <div className="multi-center"><DeckStack /><span className="table-ornament">{humans + bots} PUESTOS · 3 CARTAS CADA UNO</span></div>
        {phase === 'choose' ? <PlayerHand label={`Mano de ${active.name}`} cards={active.cards} active onCardSelect={(index) => setRound((current) => selectDuelCard(current, current.turn, index))} />
          : <div className="handoff-panel" key={phase === 'handoff' ? active?.id : phase}><span aria-hidden="true">✧</span><strong>{phase === 'handoff' ? 'Mano reservada' : phase === 'complete' ? 'Cartas reveladas' : 'La mesa espera'}</strong><p>{phase === 'handoff' ? `Solo ${active.name} debe mirar cuando se muestren las cartas.` : phase === 'complete' ? 'Compara las cartas jugadas abajo.' : 'Nadie puede ver la mano de otra persona.'}</p></div>}
      </div>
    </TableFelt>
    <ActionPanel title={phase === 'ready' ? 'Prepara la mesa' : phase === 'handoff' ? `Turno de ${active.name}` : phase === 'choose' ? 'Elige tu carta' : phase === 'bots' ? 'Juegan los bots' : 'Ronda terminada'} description={phase === 'ready' ? `${humans} ${humans === 1 ? 'persona' : 'personas'} y ${bots} ${bots === 1 ? 'bot' : 'bots'}. Una baraja nueva por ronda.` : phase === 'handoff' ? 'Confirma cuando el jugador tenga el ordenador. Su mano aparecerá entonces.' : phase === 'choose' ? 'Al tocar una carta, la mano se oculta inmediatamente para pasar el turno.' : phase === 'bots' ? 'Cada bot juega la carta más alta de su mano.' : 'Una carta por participante decide el resultado. Puedes iniciar otra ronda.'}>
      {(phase === 'ready' || phase === 'complete') && <GoldButton onClick={start}>{phase === 'ready' ? 'Repartir cartas' : 'Nueva ronda'} →</GoldButton>}
      {phase === 'handoff' && <GoldButton onClick={() => setRound((current) => ({ ...current, phase: 'choose' }))}>Mostrar mi mano →</GoldButton>}
      {phase === 'choose' && <span className="pick-prompt">Selecciona una carta de tu mano ↑</span>}
      {phase === 'bots' && <GoldButton disabled>Los bots juegan…</GoldButton>}
    </ActionPanel>
    {phase === 'complete' && <><ResultBanner outcome={round.winners.length > 1 ? 'tie' : round.winners[0] < humans ? 'win' : 'lose'} title={round.winners.length > 1 ? 'Empate' : `Ganó ${winners}`} detail={`La carta más alta fue de ${winners}. Los palos no desempatan.`} />
      <div className="reveal-grid" aria-label="Cartas jugadas">{round.seats.map((seat, index) => <div className={`reveal-seat ${round.winners.includes(seat.id) ? 'reveal-winner' : ''}`} style={{ '--reveal-index': index }} key={seat.id}><span>{seat.name}</span><strong>{seat.cards[seat.choice].rank} {seat.cards[seat.choice].symbol}</strong></div>)}</div>
      <details className="round-audit"><summary>Ver las tres cartas de cada participante</summary><div className="audit-grid">{round.seats.map((seat) => <p key={seat.id}><strong>{seat.name}:</strong> {seat.cards.map((card, index) => <span className={index === seat.choice ? 'audit-chosen' : ''} key={card.id}>{card.rank}{card.symbol}{index < 2 ? ' · ' : ''}</span>)}</p>)}</div></details></>}
    {help && <HelpDialog title="Carta Mayor · Mesa compartida" onClose={() => setHelp(false)}><div className="help-content"><p>Variante Royal Table para 2 a 8 participantes. Puede haber hasta 7 bots y varias personas en el mismo ordenador.</p><ol><li>Cada participante recibe tres cartas de una misma baraja de 52.</li><li>Las personas eligen una carta por turnos. Pasa el ordenador cuando la mano quede oculta.</li><li>Los bots eligen automáticamente su carta más alta.</li><li>Gana la carta jugada más alta. Si varias tienen el mismo valor, comparten el empate.</li></ol><p>El as vale más que el rey. Los palos no desempatan. Cada ronda empieza con una baraja nueva; no hay puntos acumulados.</p></div></HelpDialog>}
  </GameFrame>
}
