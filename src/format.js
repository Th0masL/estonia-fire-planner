// Shared display formatting. Kept in one place so the calculator and the
// action-plan text can never disagree about how a number is written.
//
// Every formatter guards against non-finite input. Divisions by an income of
// zero, an FI date that never arrives and a corrupted share link all produce
// Infinity or NaN legitimately, and a page reading "DSTI NaN%" is worse than
// one reading "—". The guard lives here rather than at each call site because
// there are dozens of call sites and only one of these.

const GUARD = '—';

export const eur = (n) => (Number.isFinite(n)
  ? '€' + Math.round(n).toLocaleString('en-IE')
  : GUARD);

export const pct = (n) => (Number.isFinite(n) ? (n * 100).toFixed(0) + '%' : GUARD);

export const pct1 = (n) => (Number.isFinite(n) ? +(n * 100).toFixed(2) + '%' : GUARD);
