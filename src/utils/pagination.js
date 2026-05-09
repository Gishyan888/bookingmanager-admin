/**
 * Up to `windowSize` consecutive page numbers, sliding with the current page
 * (e.g. 1–10 near start, 91–100 near end, centered in the middle).
 */
export function getPageWindow(page, totalPages, windowSize = 10) {
  const total = Math.max(1, totalPages)
  const p = Math.min(Math.max(1, page), total)
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  let start = Math.max(1, p - Math.floor(windowSize / 2))
  let end = start + windowSize - 1
  if (end > total) {
    end = total
    start = Math.max(1, end - windowSize + 1)
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}
