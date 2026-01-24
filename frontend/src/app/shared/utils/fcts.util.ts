export function computeVisiblePages(
  current: number,
  total: number
): number[] {
  const pages = new Set<number>([
    1,
    total,
    current - 1,
    current,
    current + 1,
  ]);

  return [...pages]
    .filter(p => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

