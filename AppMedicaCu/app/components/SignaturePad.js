import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Suaviza un polyline en un path con curvas Q
function toSmoothPath(points, strokeWidth) {
  if (!points || points.length === 0) return '';
  if (points.length < 3) {
    return points.reduce((d, p, i) => d + `${i === 0 ? 'M' : 'L'}${p.x},${p.y} `, '').trim();
  }
  let d = `M${points[0].x},${points[0].y} `;
  for (let i = 1; i < points.length - 1; i++) {
    const c = points[i];
    const n = points[i + 1];
    d += `Q${c.x},${c.y} ${(c.x + n.x) / 2},${(c.y + n.y) / 2} `;
  }
  const last = points[points.length - 1];
  d += `L${last.x},${last.y}`;
  return d.trim();
}

// Extrae width/height del <svg ...>
function parseSvgSize(svg) {
  const w = svg.match(/width="([\d.]+)/)?.[1];
  const h = svg.match(/height="([\d.]+)/)?.[1];
  if (w && h) return { w: parseFloat(w), h: parseFloat(h) };
  const vb = svg.match(/viewBox="[^"]*0 0 ([\d.]+) ([\d.]+)"/);
  if (vb) return { w: parseFloat(vb[1]), h: parseFloat(vb[2]) };
  return null;
}

// Parsea un atributo d="..." con M/L/Q; devolvemos sólo puntos finales
function parseD(dAttr) {
  const strokes = [];
  let curr = [];
  const tokens = dAttr
    .replace(/,/g, ' ')
    .replace(/([MLQZ])/g, ' $1 ')
    .trim()
    .split(/\s+/);

  let i = 0, cmd = null;
  while (i < tokens.length) {
    const t = tokens[i++];
    if (/^[MLQZ]$/.test(t)) { cmd = t; continue; }
    if (!cmd) break;

    // Leemos según comando
    if (cmd === 'M' || cmd === 'L') {
      const x = parseFloat(t);
      const y = parseFloat(tokens[i++]);
      if (!isNaN(x) && !isNaN(y)) {
        curr.push({ x, y });
      }
    } else if (cmd === 'Q') {
      // Q cx cy x y -> nos quedamos con x,y (punto final)
      const cx = parseFloat(t);
      const cy = parseFloat(tokens[i++]);
      const x = parseFloat(tokens[i++]);
      const y = parseFloat(tokens[i++]);
      if (![cx, cy, x, y].some(isNaN)) {
        curr.push({ x, y });
      }
    } else if (cmd === 'Z') {
      // cierre: terminamos stroke (si existe)
      if (curr.length) { strokes.push(curr); curr = []; }
    }
  }
  if (curr.length) strokes.push(curr);
  return strokes;
}

// Parsea el SVG completo y devuelve { w,h, strokes: Array<points[]> }
function parseSvgToPayload(svg) {
  if (!svg) return null;
  const size = parseSvgSize(svg) || { w: 0, h: 0 };
  const pathRegex = /<path[^>]*\sd="([^"]+)"[^>]*>/g;
  const strokes = [];
  let m;
  while ((m = pathRegex.exec(svg)) !== null) {
    const d = m[1];
    const segs = parseD(d);
    if (segs.length) strokes.push(...segs);
  }
  if (!strokes.length) return null;
  return { w: size.w, h: size.h, strokes };
}

/**
 * Props:
 * - initialSvg?: string   (firma guardada)
 * - strokeWidth?: number
 *
 * Métodos:
 * - clear()
 * - toSvg(): string
 */
const SignaturePad = forwardRef(({ initialSvg, strokeWidth = 3 }, ref) => {
  const [strokes, setStrokes] = useState([]); // [[{x,y}], ...]
  const [current, setCurrent] = useState([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const currentRef = useRef(current);
  currentRef.current = current;

  const loadSvgScaled = (svg) => {
    const payload = parseSvgToPayload(svg);
    if (!payload) return;
    const { w: pw, h: ph, strokes: s } = payload;
    const { w, h } = sizeRef.current;
    if (!w || !h || !pw || !ph) return;
    const sx = w / pw, sy = h / ph;
    const scaled = s.map(seg => seg.map(p => ({ x: p.x * sx, y: p.y * sy })));
    setStrokes(scaled);
    setCurrent([]);
  };

  useEffect(() => {
    if (initialSvg && sizeRef.current.w > 0) {
      loadSvgScaled(initialSvg);
    }
  }, [initialSvg]);

  useImperativeHandle(ref, () => ({
    clear() { setStrokes([]); setCurrent([]); },
    toSvg() {
      const { w, h } = sizeRef.current;
      const all = [...strokes, currentRef.current].filter(s => s.length);
      if (!w || !h || !all.length) return '';
      const paths = all
        .map(pts => `<path d="${toSmoothPath(pts, strokeWidth)}" stroke="#000" fill="none" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`)
        .join('');
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${paths}</svg>`;
    },
  }), [strokes, strokeWidth]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: e => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        setCurrent([{ x, y }]);
      },
      onPanResponderMove: e => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        setCurrent(prev => [...prev, { x, y }]);
      },
      onPanResponderRelease: () => {
        if (currentRef.current.length) setStrokes(prev => [...prev, currentRef.current]);
        setCurrent([]);
      },
    })
  ).current;

  return (
    <View
      style={styles.canvas}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        const first = sizeRef.current.w === 0;
        sizeRef.current = { w: width, h: height };
        if (first && initialSvg) loadSvgScaled(initialSvg);
      }}
      {...pan.panHandlers}
    >
      <Svg style={StyleSheet.absoluteFill}>
        {strokes.map((pts, i) => (
          <Path
            key={`s-${i}`}
            d={toSmoothPath(pts, strokeWidth)}
            stroke="#000"
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <Path
          d={toSmoothPath(current, strokeWidth)}
          stroke="#000"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default SignaturePad;
