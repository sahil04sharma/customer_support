export type ReadinessLevel = 'EMPTY' | 'LOW' | 'GOOD' | 'STRONG';

export function computeReadinessLevel(
  readyDocuments: number,
  totalChunks: number
): ReadinessLevel {
  if (readyDocuments === 0) {
    return 'EMPTY';
  }
  if (readyDocuments === 1 || totalChunks < 15) {
    return 'LOW';
  }
  if (readyDocuments >= 3 && totalChunks > 60) {
    return 'STRONG';
  }
  if (readyDocuments >= 2 && totalChunks >= 15) {
    return 'GOOD';
  }
  return 'LOW';
}

export function isLowReadiness(level: ReadinessLevel): boolean {
  return level === 'EMPTY' || level === 'LOW';
}
