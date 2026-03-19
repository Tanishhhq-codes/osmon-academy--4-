// ── battleSystem.ts ──────────────────────────────────────────────
import { OsMon, Move, RARITY_MULT } from '../data/osmons'

export interface BattleMon extends OsMon {
  curHp: number
  maxHp: number
  lv: number
  xp: number
  status: 'none' | 'paralyzed' | 'asleep' | 'confused'
  statusTurns: number
}

export function makeBattleMon(mon: OsMon, lv = 5): BattleMon {
  const hp = Math.floor(mon.hp * (lv / 5) * 0.9 + lv * 2)
  return { ...mon, curHp: hp, maxHp: hp, lv, xp: 0, status: 'none', statusTurns: 0 }
}

export function calcDamage(attacker: BattleMon, defender: BattleMon, move: Move): number {
  if (move.power === 0) return 0
  const base = Math.floor((attacker.attack / Math.max(1, defender.defense)) * move.power * (0.85 + Math.random() * 0.3) / 10)
  return Math.max(1, Math.floor(base * (attacker.lv / 5)))
}

export function shouldSkipTurn(mon: BattleMon): { skip: boolean; reason: string } {
  if (mon.status === 'paralyzed' && Math.random() < 0.25)
    return { skip: true, reason: `${mon.name} is paralyzed! It can't move!` }
  if (mon.status === 'asleep') {
    if (mon.statusTurns > 0) return { skip: true, reason: `${mon.name} is fast asleep!` }
    return { skip: false, reason: `${mon.name} woke up!` }
  }
  if (mon.status === 'confused' && Math.random() < 0.33)
    return { skip: true, reason: `${mon.name} is confused and hurt itself!` }
  return { skip: false, reason: '' }
}

export function getXpReward(mon: BattleMon): number {
  return Math.floor(mon.lv * 10 * (RARITY_MULT[mon.rarity] ?? 1))
}

export function wildAiMove(wild: BattleMon): string {
  const available = wild.moves.filter(m => m)
  return available[Math.floor(Math.random() * available.length)]
}

export function applyStatus(target: BattleMon, effect: 'paralyze' | 'sleep' | 'confuse'): boolean {
  if (target.status !== 'none') return false
  if (Math.random() < 0.7) {
    target.status = effect === 'paralyze' ? 'paralyzed' : effect === 'sleep' ? 'asleep' : 'confused'
    target.statusTurns = effect === 'sleep' ? Math.floor(Math.random() * 3) + 1 : 3
    return true
  }
  return false
}

export function tickStatus(mon: BattleMon) {
  if (mon.statusTurns > 0) mon.statusTurns--
  if (mon.statusTurns === 0 && mon.status !== 'none' && mon.status !== 'paralyzed') {
    mon.status = 'none'
  }
}
