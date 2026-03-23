import type { Token, TokenPriority, TokenStatus } from '@smartq/types';

// ─── Priority weights (configurable) ──────────────────────────────────────────

export const PRIORITY_WEIGHTS: Record<TokenPriority, number> = {
  EMERGENCY: 1000,
  PRIORITY: 100,
  REGULAR: 1,
};

// Default interleave ratio: for every 1 regular, serve 2 priority, then emergency first always
export const DEFAULT_INTERLEAVE_RATIO = {
  EMERGENCY: Infinity, // always first
  PRIORITY: 2,         // 2 priority per 1 regular
  REGULAR: 1,
};

// ─── Token state machine ──────────────────────────────────────────────────────

export type TokenTransition =
  | { from: 'ISSUED';          to: 'CALLED' }
  | { from: 'CALLED';          to: 'IN_CONSULTATION' | 'NO_SHOW' }
  | { from: 'IN_CONSULTATION'; to: 'COMPLETED' | 'REFERRED' | 'ADMITTED' | 'NO_SHOW' }
  | { from: 'NO_SHOW';         to: 'ISSUED' | 'CANCELLED' };  // re-queue once

const VALID_TRANSITIONS: Partial<Record<TokenStatus, TokenStatus[]>> = {
  ISSUED:          ['CALLED'],
  CALLED:          ['IN_CONSULTATION', 'NO_SHOW'],
  IN_CONSULTATION: ['COMPLETED', 'REFERRED', 'ADMITTED', 'NO_SHOW'],
  NO_SHOW:         ['ISSUED', 'CANCELLED'],
};

export function canTransition(from: TokenStatus, to: TokenStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Priority classification ──────────────────────────────────────────────────

export interface PatientFlags {
  isEmergency?: boolean;
  isSenior?: boolean;      // age >= 60
  isPregnant?: boolean;
  isDisabled?: boolean;
}

export function classifyPriority(flags: PatientFlags): TokenPriority {
  if (flags.isEmergency) return 'EMERGENCY';
  if (flags.isSenior || flags.isPregnant || flags.isDisabled) return 'PRIORITY';
  return 'REGULAR';
}

// ─── Queue sort (the interleave engine) ──────────────────────────────────────

export function sortQueue(tokens: Token[]): Token[] {
  // 1. Separate tokens by status
  const called    = tokens.filter(t => t.status === 'CALLED');
  const issued    = tokens.filter(t => t.status === 'ISSUED');
  
  // 2. Further separate issued tokens by priority
  const emergency = issued.filter(t => t.priority === 'EMERGENCY');
  const priority  = issued.filter(t => t.priority === 'PRIORITY');
  const regular   = issued.filter(t => t.priority === 'REGULAR');

  // 3. Sort each bucket by issuedAt (FIFO)
  const byTime = (a: Token, b: Token) =>
    new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();

  called.sort(byTime); // Called tokens also sorted by when they were issued/called if multiple
  emergency.sort(byTime);
  priority.sort(byTime);
  regular.sort(byTime);

  // 4. Assemble the final queue
  // All CALLED tokens first (they are already at the counter/room)
  const result: Token[] = [...called];
  
  // Followed by all EMERGENCY tokens (they jump the line)
  result.push(...emergency);

  // Then interleave PRIORITY and REGULAR (e.g. 2:1 ratio)
  let pi = 0, ri = 0;
  while (pi < priority.length || ri < regular.length) {
    // Serve PRIORITY tokens (up to ratio)
    for (let i = 0; i < DEFAULT_INTERLEAVE_RATIO.PRIORITY && pi < priority.length; i++) {
      result.push(priority[pi++]);
    }
    // Serve 1 REGULAR token
    if (ri < regular.length) {
      result.push(regular[ri++]);
    }
  }

  return result;
}

// ─── ETA calculator ───────────────────────────────────────────────────────────

export function estimateWaitMinutes(
  position: number,
  averageConsultMinutes: number,
  currentTokenStartedAt?: string,
): number {
  const currentElapsed = currentTokenStartedAt
    ? (Date.now() - new Date(currentTokenStartedAt).getTime()) / 60000
    : 0;
  const remainingCurrentConsult = Math.max(0, averageConsultMinutes - currentElapsed);
  return Math.round(remainingCurrentConsult + (position - 1) * averageConsultMinutes);
}

// ─── No-show handling ─────────────────────────────────────────────────────────

export function handleNoShow(token: Token): Token {
  if (token.noShowCount >= 1) {
    // Second no-show → cancelled
    return { ...token, status: 'CANCELLED' };
  }
  // First no-show → re-queue at end with regular priority
  return {
    ...token,
    status: 'ISSUED',
    priority: 'REGULAR',
    noShowCount: token.noShowCount + 1,
    issuedAt: new Date().toISOString(), // moves to end of FIFO
  };
}
