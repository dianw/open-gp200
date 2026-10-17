/** Cable routing for the signal-chain view: pure geometry, no DOM. */

export interface JackBox {
  x: number
  y: number
  w: number
  h: number
  /** y of the jacks on this box's sides */
  jack: number
}

export interface Point { x: number; y: number }

/** A polyline as an SVG path, with corners rounded to at most radius `r`. */
export function roundedPath(pts: Point[], r: number): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0]!.x} ${pts[0]!.y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [p, c, n] = [pts[i - 1]!, pts[i]!, pts[i + 1]!]
    const lin = Math.hypot(c.x - p.x, c.y - p.y)
    const lout = Math.hypot(n.x - c.x, n.y - c.y)
    const k = Math.min(r, lin / 2, lout / 2)
    if (k <= 0) { d += ` L${c.x} ${c.y}`; continue }
    const a = { x: c.x + (p.x - c.x) * k / lin, y: c.y + (p.y - c.y) * k / lin }
    const b = { x: c.x + (n.x - c.x) * k / lout, y: c.y + (n.y - c.y) * k / lout }
    d += ` L${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`
  }
  const last = pts[pts.length - 1]!
  return `${d} L${last.x} ${last.y}`
}

const sameRow = (a: JackBox, b: JackBox) => a.y < b.y + b.h && b.y < a.y + a.h

/**
 * The cable from each box's right jack to the next box's left jack. Within a row it's a straight run;
 * across a line break it leaves to the right, drops into the gap between the rows, runs back left and
 * enters the next box from its left, so the chain stays connected however the boxes wrap.
 * `gap` is the horizontal space between boxes; the turns sit at half of it.
 */
export function cablePaths(boxes: JackBox[], gap: number, r = 10): string[] {
  const paths: string[] = []
  let rowBottom = -Infinity
  for (let i = 0; i + 1 < boxes.length; i++) {
    const a = boxes[i]!
    const b = boxes[i + 1]!
    rowBottom = Math.max(rowBottom, a.y + a.h)
    const start = { x: a.x + a.w, y: a.jack }
    const end = { x: b.x, y: b.jack }
    if (sameRow(a, b) && b.x >= start.x) {
      paths.push(roundedPath([start, end], r))
      continue
    }
    const right = start.x + gap / 2
    const left = end.x - gap / 2
    const mid = (rowBottom + b.y) / 2
    paths.push(roundedPath([start, { x: right, y: start.y }, { x: right, y: mid }, { x: left, y: mid }, { x: left, y: end.y }, end], r))
  }
  return paths
}
