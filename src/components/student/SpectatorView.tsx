'use client'
import { motion } from 'framer-motion'
import { Eye, Users, Crown, Skull } from 'lucide-react'
import type { GameState, Player } from '@/types/game'
import { MathRenderer } from '@/components/shared/MathRenderer'
import { Timer } from '@/components/shared/Timer'
import { Badge } from '@/components/ui/badge'

interface SpectatorViewProps {
  gameState: GameState
  eliminatedRound: number
  myRank: number | null
  nickname: string
}

export function SpectatorView({
  gameState,
  eliminatedRound,
  myRank,
  nickname,
}: SpectatorViewProps) {
  const players = Object.values(gameState.players)
  const activePlayers = players.filter((p) => p.status === 'active')
  const leaderboard = [...players]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return (
    <div
      className="min-h-screen p-4 max-w-2xl mx-auto"
      style={{ background: '#0a0a0f' }}
    >
      {/* Spectator badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 mb-6 py-3 px-4 rounded-2xl"
        style={{
          background: 'rgba(107,114,128,0.1)',
          border: '1px solid rgba(107,114,128,0.2)',
        }}
      >
        <Eye size={16} className="text-gray-400" />
        <span className="text-gray-400 font-medium">
          You&apos;re spectating — eliminated in round {eliminatedRound}
          {myRank && (
            <span className="text-gray-500 ml-2">· Finished #{myRank}</span>
          )}
        </span>
      </motion.div>

      {/* Eliminated message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-6 p-4 rounded-2xl"
        style={{
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}
      >
        <span className="text-2xl mr-2">💀</span>
        <span className="text-gray-300 font-medium">
          Better luck next time, {nickname}!
        </span>
      </motion.div>

      {/* Current question (spectator view) */}
      {gameState.currentQuestion && gameState.status === 'question' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden mb-4"
          style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid #1e1e2e' }}
          >
            <div className="flex items-center gap-2">
              <Badge variant="accent">Round {gameState.currentRound}</Badge>
              <span className="text-gray-400 text-sm">
                {activePlayers.length} still alive
              </span>
            </div>
            <Timer
              timeRemaining={gameState.timeRemaining}
              timeLimit={gameState.timeLimit}
              size={56}
            />
          </div>
          <div className="p-6">
            <div
              className="rounded-xl p-5 text-center mb-4"
              style={{
                background: 'rgba(124,58,237,0.05)',
                border: '1px solid rgba(124,58,237,0.15)',
              }}
            >
              <MathRenderer
                latex={gameState.currentQuestion.latex}
                displayMode
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {gameState.currentQuestion.options.map((opt, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid #1e1e2e',
                  }}
                >
                  <span className="text-xs text-gray-500 mr-1">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <MathRenderer latex={opt} className="inline text-sm" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {gameState.status === 'results' && gameState.roundResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-5 mb-4"
          style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
        >
          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <p className="text-xl font-black text-emerald-400">
                {gameState.roundResults.survivors.length}
              </p>
              <p className="text-xs text-gray-400">Survived</p>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <p className="text-xl font-black text-red-400">
                {gameState.roundResults.eliminated.length}
              </p>
              <p className="text-xs text-gray-400">Eliminated</p>
            </div>
          </div>
          {gameState.currentQuestion && (
            <div
              className="p-3 rounded-xl text-center"
              style={{
                background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <p className="text-xs text-emerald-400 mb-1">Correct Answer</p>
              <MathRenderer latex={gameState.roundResults.correctAnswer} />
            </div>
          )}
        </motion.div>
      )}

      {/* Active players */}
      <div
        className="rounded-2xl overflow-hidden mb-4"
        style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
      >
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid #1e1e2e' }}
        >
          <Users size={15} className="text-purple-400" />
          <h3 className="font-bold text-white text-sm">
            Still in the game ({activePlayers.length})
          </h3>
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {activePlayers.length === 0 ? (
            <p className="text-gray-500 text-sm py-2">Everyone&apos;s out!</p>
          ) : (
            activePlayers.map((p: Player) => (
              <span
                key={p.id}
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                {p.nickname}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Mini leaderboard */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
      >
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid #1e1e2e' }}
        >
          <Crown size={15} className="text-yellow-400" />
          <h3 className="font-bold text-white text-sm">Leaderboard</h3>
        </div>
        <div className="p-3 space-y-2">
          {leaderboard.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{
                background:
                  idx === 0 ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-bold w-5 text-center"
                  style={{
                    color:
                      idx === 0
                        ? '#fbbf24'
                        : idx === 1
                        ? '#94a3b8'
                        : idx === 2
                        ? '#cd7c54'
                        : '#6b7280',
                  }}
                >
                  {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  {player.status === 'eliminated' && (
                    <Skull size={12} className="text-red-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      player.status === 'eliminated'
                        ? 'text-gray-500'
                        : 'text-white'
                    }`}
                  >
                    {player.nickname}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-purple-400">
                {player.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
