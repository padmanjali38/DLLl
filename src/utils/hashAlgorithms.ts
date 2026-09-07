import { ProbeStep, TableSlot } from '../types/game';

export function calculateBaseHash(rawKey: number | string, rawTableSize: number | string = 10): number {
  const numSize = Number(rawTableSize);
  const safeSize = Number.isFinite(numSize) && numSize > 0 ? Math.floor(numSize) : 10;

  const numKey = Number(rawKey);
  const safeKey = Number.isFinite(numKey) ? Math.floor(numKey) : 0;

  const remainder = safeKey % safeSize;
  return ((remainder % safeSize) + safeSize) % safeSize;
}

export function getPrimeForTableSize(tableSize: number): number {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  const validPrimes = primes.filter((p) => p < tableSize);
  if (validPrimes.length > 0) {
    if (tableSize >= 10 && validPrimes.includes(7)) return 7;
    return validPrimes[validPrimes.length - 1];
  }
  return 3;
}

export function calculateH2(
  rawKey: number | string,
  rawPrime?: number | string,
  tableSize?: number
): number {
  let primeToUse = 7;
  if (rawPrime !== undefined) {
    const numPrime = Number(rawPrime);
    if (Number.isFinite(numPrime) && numPrime > 0) {
      primeToUse = Math.floor(numPrime);
    }
  } else if (tableSize !== undefined && tableSize > 0) {
    primeToUse = getPrimeForTableSize(tableSize);
  }

  const numKey = Number(rawKey);
  const safeKey = Number.isFinite(numKey) ? Math.floor(numKey) : 0;

  const remainder = ((safeKey % primeToUse) + primeToUse) % primeToUse;
  let h2 = primeToUse - remainder;
  if (tableSize && tableSize > 0 && h2 % tableSize === 0) {
    h2 = 1;
  }
  return h2;
}

export function isSlotOccupied(slots: TableSlot[], index: number): boolean {
  const slot = slots.find((s) => s.index === index);
  return !!slot && slot.items.length > 0;
}

export function computeLinearProbeSequence(
  rawKey: number | string,
  rawTableSize: number | string,
  slots: TableSlot[],
  maxSteps?: number
): ProbeStep[] {
  const numSize = Number(rawTableSize);
  const safeSize = Number.isFinite(numSize) && numSize > 0 ? Math.floor(numSize) : 10;
  const numKey = Number(rawKey);
  const safeKey = Number.isFinite(numKey) ? Math.floor(numKey) : 0;
  const baseHash = calculateBaseHash(safeKey, safeSize);
  const steps: ProbeStep[] = [];
  const limit = maxSteps !== undefined && maxSteps > 0 ? maxSteps : safeSize;

  for (let i = 0; i < limit; i++) {
    const target = (baseHash + i) % safeSize;
    const occupied = isSlotOccupied(slots, target);
    steps.push({
      stepIndex: i,
      targetIndex: target,
      isOccupied: occupied,
      calculationStr: i === 0 
        ? `${safeKey} % ${safeSize} = ${target}`
        : `(${baseHash} + ${i}) % ${safeSize} = ${target}`,
    });

    if (!occupied) {
      break;
    }
  }

  return steps;
}

export function computeQuadraticProbeSequence(
  rawKey: number | string,
  rawTableSize: number | string,
  slots: TableSlot[],
  maxSteps?: number
): ProbeStep[] {
  const numSize = Number(rawTableSize);
  const safeSize = Number.isFinite(numSize) && numSize > 0 ? Math.floor(numSize) : 10;
  const numKey = Number(rawKey);
  const safeKey = Number.isFinite(numKey) ? Math.floor(numKey) : 0;
  const baseHash = calculateBaseHash(safeKey, safeSize);
  const steps: ProbeStep[] = [];
  const limit = maxSteps !== undefined && maxSteps > 0 ? maxSteps : safeSize;

  for (let i = 0; i < limit; i++) {
    const jump = i * i;
    const target = (baseHash + jump) % safeSize;
    const occupied = isSlotOccupied(slots, target);
    steps.push({
      stepIndex: i,
      targetIndex: target,
      isOccupied: occupied,
      calculationStr: i === 0 
        ? `${safeKey} % ${safeSize} = ${target}`
        : `(${baseHash} + ${i}²) % ${safeSize} = (${baseHash} + ${jump}) % ${safeSize} = ${target}`,
    });

    if (!occupied) {
      break;
    }
  }

  return steps;
}

export function computeDoubleHashSequence(
  rawKey: number | string,
  rawTableSize: number | string,
  slots: TableSlot[],
  maxSteps?: number
): ProbeStep[] {
  const numSize = Number(rawTableSize);
  const safeSize = Number.isFinite(numSize) && numSize > 0 ? Math.floor(numSize) : 10;
  const numKey = Number(rawKey);
  const safeKey = Number.isFinite(numKey) ? Math.floor(numKey) : 0;
  const h1 = calculateBaseHash(safeKey, safeSize);
  const h2 = calculateH2(safeKey, undefined, safeSize);
  const steps: ProbeStep[] = [];
  const limit = maxSteps !== undefined && maxSteps > 0 ? maxSteps : safeSize;

  for (let i = 0; i < limit; i++) {
    const target = (h1 + i * h2) % safeSize;
    const occupied = isSlotOccupied(slots, target);
    steps.push({
      stepIndex: i,
      targetIndex: target,
      isOccupied: occupied,
      calculationStr: i === 0
        ? `h1(${safeKey}) = ${safeKey} % ${safeSize} = ${h1}`
        : `(${h1} + ${i} × ${h2}) % ${safeSize} = ${target}`,
    });

    if (!occupied) {
      break;
    }
  }

  return steps;
}
