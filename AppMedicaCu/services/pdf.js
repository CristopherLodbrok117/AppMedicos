// services/pdf.js — Paso 1 mejorado: Encabezado + Datos del servicio (OFICIO real)
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
const { StorageAccessFramework } = FileSystem;
import { Asset } from 'expo-asset';

import { getRecordById, getPatientEvaluationById, getFirstEvaluationById, getPhysicalExplorationById, getVitalSignsByRecordId, getSampleNotesById, getPatientConditionById } from './database';
import { getPatientTransferById } from './database';
import { getDeployedResourcesById as getDeployedResourcesByRecordId } from './database'; // o el nombre real


// si el nombre correcto en tu DB es otro, cámbialo aquí (p.ej. getDeployedResourcesByRecordId)


import bodyPng from '../app/assets/body.png'; 



/* ----------------- helpers ----------------- */
const safe = (v) => (v ?? '').toString().trim();
const IN = (value, ...opts) =>
  !!value && opts.map(safe).some((o) => safe(value).toLowerCase() === o.toLowerCase());

function dateParts(isoLike) {
  try {
    const d = new Date(isoLike);
    if (isNaN(d)) return { day: '', month: '', year: '', week: '' };
    const wd = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][d.getDay()];
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: String(d.getFullYear()),
      week: wd,
    };
  } catch {
    return { day: '', month: '', year: '', week: '' };
  }
}

// opción con número a la izquierda y check a la derecha
const Opt = (label, checked, num = '') => `
  <div class="opt">
    ${num ? `<span class="num">${num}</span>` : `<span class="num num--blank"></span>`}
    <span class="lbl">${label}</span>
    <span class="cb ${checked ? 'on' : ''}">${checked ? '✔' : ''}</span>
  </div>`;

function makeTopHTML(record = {}) {
  const safe = (v) => (v ?? '').toString().trim();
  const IN = (value, ...opts) =>
    !!value && opts.map(safe).some((o) => safe(value).toLowerCase() === o.toLowerCase());

  function dateParts(isoLike) {
    try {
      const d = new Date(isoLike);
      if (isNaN(d)) return { day: '', month: '', year: '', week: '' };
      const wd = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][d.getDay()];
      return {
        day: String(d.getDate()).padStart(2, '0'),
        month: String(d.getMonth() + 1).padStart(2, '0'),
        year: String(d.getFullYear()),
        week: wd,
      };
    } catch { return { day: '', month: '', year: '', week: '' }; }
  }

  // Folio = ID de expediente
  const folio = safe(record.id) || '—';
  const { day, month, year, week } = dateParts(record.date);

  const motivo = safe(record.attentionReason);
  const campus = safe(record.serviceLocation || record.campus || record.site);
  const unit   = safe(record.vehicleType || record.unitType);
  const unitNo = safe(record.vehicleNum);
  const unitNoIf = (...labels) => (labels.some(l => IN(unit, l)) ? unitNo : '');

  // opción con número a la izquierda y check a la derecha
  const Opt = (label, checked, num = '') => `
    <div class="opt">
      ${num ? `<span class="num">${num}</span>` : `<span class="num num--blank"></span>`}
      <span class="lbl">${label}</span>
      <span class="cb ${checked ? 'on' : ''}">${checked ? '✔' : ''}</span>
    </div>`;

    const NoBox = (val='') => `
      <div class="nobox"><span>No.</span><div class="uline">${safe(val)}</div></div>`;
    // ¿coincide el valor con 0/1/2 aunque venga "1 - texto", " 2 ", etc.?
    // ¿La selección coincide con 0/1/2 aunque venga "1 - texto", " 2 ", etc.?
    // Coincide con 0/1/2 aunque venga "1 - texto", " 2 ", etc.
    // Soporta 0/1/2, "1 - algo" y descripciones del APGAR.
    // Devuelve 0/1/2 a partir de número o de la descripción textual
    const apIndex = (val) => {
      const s0 = (val ?? '').toString().trim();
      if (!s0) return NaN;

      // "2 - algo", " 1 ", etc.
      const m = s0.match(/^(\d)/);
      if (m) return Number(m[1]);

      // "0", "1", "2"
      const n = Number(s0);
      if (Number.isFinite(n)) return n;

      // Descripciones guardadas como texto
      const s = s0.toLowerCase();

      // 0
      if (/(azul.*p[aá]lido|ausente)\b/.test(s)) return 0;

      // 1
      if (/(lento|\<\s*100|flex|irregular|mov\.\s*leve)/.test(s)) return 1;

      // 2
      if (/(completamente\s*rosa|≥|>=\s*100|arriba\s*de\s*100|>\s*=?\s*100|movimiento\s*activo|llanto\s*vigoroso|bueno.*llanto)/.test(s)) return 2;
        // ====== Exploración física: parser flexible (JSON, CSV, texto) ======
    

      return NaN;
    };

    const APSEL = (val, t) => (apIndex(val) === t ? 'sel' : '');

    // Coincide por número (0/1/2/3/4/5; también "1 - texto") o por texto, con o sin acentos
    function HIT(val, t, ...labels){
      const raw = (val ?? '').toString().trim();
      if (!raw) return false;
      const m = raw.match(/^(\d+)/);                // "2 - texto"
      if (m && Number(m[1]) === Number(t)) return true;
      if (!Number.isNaN(Number(raw)) && Number(raw) === Number(t)) return true;
      const norm = s => s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
      const v = norm(raw);
      return labels.some(lbl => norm(lbl) === v);
    }

    function parsePharma(val){
  const out=[];
  const push=(r={})=>{
    const row={
      hour:  safe(r.hour || r.hora || r.time || ''),   // ← añade r.time
      med:   safe(r.med  || r.medicamento || ''),
      dose:  safe(r.dose || r.dosis || ''),
      route: safe(r.route|| r.via || r.viaAdmin || r.viaAdministracion || ''),
      electric: safe(r.electric || r.terapia || r.terapiaElectrica || '')
    };
    if(Object.values(row).some(v=>v!=='')) out.push(row);
  };

  if(!val) return out;

  if(Array.isArray(val)){ val.slice(0,3).forEach(push); return out; }

  if(typeof val==='object'){
    if(Array.isArray(val.rows)){ val.rows.slice(0,3).forEach(push); return out; }
    [1,2,3].forEach(i=>push({
      hour:  val['hour'+i]||val['hora'+i]||val['time'+i],   // ← añade time1/time2/time3
      med:   val['med'+i]||val['medicamento'+i],
      dose:  val['dose'+i]||val['dosis'+i],
      route: val['route'+i]||val['via'+i]||val['viaAdmin'+i]||val['viaAdministracion'+i],
      electric: val['electric'+i]||val['terapia'+i]||val['terapiaElectrica'+i],
    }));
    return out;
  }

  const s=String(val).trim();
  try{ return parsePharma(JSON.parse(s)); }catch{}
  s.split(/\n+/).slice(0,3).forEach(line=>{
    const [hour,med,dose,route,electric]=line.split(/[;,|\t]+/);
    push({hour,med,dose,route,electric});
  });
  return out;
}



    
    // ¿La lista contiene el item? Acepta número (t), texto, arrays, objetos, CSV o JSON.
function HAS(val, t, ...labels){
  const norm = s => (s ?? '').toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  // por si viene un único valor, tratamos como HIT
  const maybe = (v) => {
    const s = (v ?? '').toString().trim();
    if (!s) return;
    // guarda texto completo
    bag.add(norm(s));
    // guarda número inicial "2 - algo"
    const m = s.match(/^(\d+)/); if (m) bag.add(m[1]);
  };

  const addObj = (o) => {
    // campos comunes para items { id, code, value, label... }
    const cand = o?.id ?? o?.key ?? o?.code ?? o?.value ?? o?.v ?? o?.abbr ?? o?.short ?? o?.name ?? o?.label;
    if (cand != null) maybe(cand);
    // si viene estructura tipo {selected:{...}} o booleans
    Object.entries(o || {}).forEach(([k,v])=>{
      if (v === true || v === 1 || v === '1') bag.add(norm(k));
    });
    (o?.items || o?.tokens || o?.selected || o?.types || []).forEach(maybe);
  };

  const bag = new Set();
  if (val == null) return false;

  if (Array.isArray(val)) { val.forEach((x)=> Array.isArray(x) || typeof x === 'object' ? addObj(x) : maybe(x)); }
  else if (typeof val === 'object') addObj(val);
  else {
    const s = String(val).trim();
    try { const j = JSON.parse(s); return HAS(j, t, ...labels); }
    catch {
      s.split(/[,\|;\/]+/).forEach(maybe); // CSV/pipe/semicolon
      maybe(s);
    }
  }

  // ¿coincide por número o por etiqueta?
  if (bag.has(String(t))) return true;
  const normLabels = labels.map(norm);
  for (const tok of bag) if (normLabels.includes(tok)) return true;

  // fallback: si viene como único valor “simple” (ej. "3" ó "Venturi")
  return HIT(val, t, ...labels);
}





    const prestadores = [record.intern, record.moreInterns, record.providers]
        .filter(Boolean).map(safe).join(', ');

    const studentCode = safe(record.studentCode || record.studentId || record.codigoEstudiante || '');

      
    // normalizador
    const norm = s => (s ?? '').toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

    // parser flexible para 'injuries' (JSON, CSV, texto)
    // parser flexible para 'injuries' (acepta OBJETO, ARRAY o STRING)
// parser flexible para 'injuries' — ahora soporta .types y expande "Texto (ABBR)"
function parseInjuries(raw) {
  const out = { tokens: new Set(), points: new Set() };
  const norm = s => (s ?? '').toString()
    .normalize('NFKD')                  // <- NFKD para deshacer ligaduras (ﬁ -> fi)
    .replace(/[\u0300-\u036f]/g,'')     // quitar acentos
    .toLowerCase().trim();

  const addTok = t => { const v = norm(t); if (v) out.tokens.add(v); };

  // si llega "Algo (XX)" añade: completo, "Algo" y "XX"
  const expandTypeToken = (t) => {
    const s = (t ?? '').toString().trim();
    if (!s) return;
    addTok(s);
    const m = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (m) {
      addTok(m[1]);          // texto sin paréntesis, p.ej. "Fracturas"
      addTok(m[2]);          // abreviatura, p.ej. "F" / "CD" / "MP"
    }
  };

  if (raw == null || raw === '') return out;

  // 1) ARRAY directo
  if (Array.isArray(raw)) { raw.forEach(expandTypeToken); return out; }

  // 2) OBJETO { types/tokens/items/selected/points... }
  if (typeof raw === 'object') {
    (raw.types || raw.tokens || raw.items || raw.selected || []).forEach(expandTypeToken);
    Object.entries(raw).forEach(([k, v]) => {
      if (v === true || v === 1 || v === '1') addTok(k);
    });
    (raw.points || raw.bodyPoints || raw.lesionPoints || []).forEach(p => out.points.add(p));
    return out;
  }

  // 3) STRING (JSON, CSV, texto)
  const s = String(raw).trim();
  try {
    const j = JSON.parse(s);
    const r = parseInjuries(j);
    r.tokens.forEach(x => out.tokens.add(x));
    r.points.forEach(x => out.points.add(x));
  } catch {
    s.split(/[,\|;\/\s]+/).forEach(expandTypeToken);
  }
  return out;
}



    // 15 ítems (etiqueta + abreviatura)
    const EF_ITEMS = [
      ['Deformidades (D)','D'],
      ['Contusiones (CD)','CD'],
      ['Abrasiones (A)','A'],
      ['Penetraciones (P)','PEN'],
      ['Movimiento paradójico (MP)','MP'],
      ['Crepitación (C)','C'],
      ['Heridas (H)','H'],
      ['Fracturas (F)','F'],
      ['Enfisema subcutáneo (ES)','ES'],
      ['Quemaduras (Q)','Q'],
      ['Laceraciones (L)','L'],
      ['Edema (E)','EDEMA'],
      ['Alteración de sensibilidad (AS)','AS'],
      ['Alteración de movilidad (AM)','AM'],
      ['Dolor (DO)','DO'],
    ];

function getEfSet(record){
  const norm = s => (s ?? '').toString()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().trim();


  const add = (set, v) => {
    if (v === undefined || v === null) return;
    // si es número, pásalo a string; si es objeto, intenta id/clave
    if (typeof v === 'object') {
      const candidate = v.id ?? v.key ?? v.code ?? v.value ?? v.v ?? v.abbr ?? v.short ?? v.name ?? v.label;
      if (candidate !== undefined) {
        const t = (candidate ?? '').toString().trim();
        if (t) set.add(norm(t));
      }
      return;
    }
    const s = (typeof v === 'number') ? String(v) : v;
    const t = (s ?? '').toString().trim();
    if (t) set.add(norm(t));
  };

  const CANDIDATES = [
    record.efTokens,
    record.exploracionFisica,
    record.physicalExploration,
    record.exploration,
    record.ef,
  ];

  const out = new Set();

  // 1) Campos dedicados (acepta array, objeto, string JSON, CSV, texto)
  for (const raw of CANDIDATES) {
    if (raw == null || raw === '') continue;

    if (Array.isArray(raw)) { raw.forEach(t => add(out, t)); continue; }

    if (typeof raw === 'object') {
      (raw.tokens || raw.items || raw.selected || []).forEach(t => add(out, t));
      for (const [k,v] of Object.entries(raw)) {
        if (v === true || v === 1 || v === '1') add(out, k);
      }
      continue;
    }

    const s = String(raw).trim();
    if (!s) continue;

    try {
      const j = JSON.parse(s);
      if (Array.isArray(j)) j.forEach(t => add(out, t));
      else if (j && typeof j === 'object') {
        (j.tokens || j.items || j.selected || []).forEach(t => add(out, t));
        for (const [k,v] of Object.entries(j)) {
          if (v === true || v === 1 || v === '1') add(out, k);
        }
      }
    } catch {
      s.split(/[,\|;\/\s]+/).forEach(t => add(out, t));
    }
  }

  // 2) También toma tokens que vengan dentro de "injuries"
  try {
    const inj = parseInjuries(record.injuries || record.injuryMarks || record.bodyMarks || '');
    inj.tokens.forEach(t => add(out, t));
  } catch {}

  return out;
}




/* ====== mapa de IDs -> coordenadas en % (ajústalo a tus IDs si aplica) ====== */
const BODY_POINTS = {
  head_f:[16,10], neck_f:[16,18], chest_l:[13,28], chest_r:[19,28],
  abdomen:[16,40], pelvis:[16,52], thigh_l:[13,64], thigh_r:[19,64],
  knee_l:[13,77], knee_r:[19,77], leg_l:[13,88], leg_r:[19,88],
  head_b:[66,10], neck_b:[66,18], scap_l:[63,28], scap_r:[69,28],
  lumbar:[66,44], gluteo:[66,55], thighl_b:[63,64], thighr_b:[69,64],
  kneel_b:[63,77], kneer_b:[69,77],
};
// si guardas números como ids…
const BODY_POINT_ALIASES = { '1':'head_f','2':'neck_f','3':'chest_l','4':'chest_r','5':'abdomen','6':'pelvis','7':'thigh_l','8':'thigh_r','9':'knee_l','10':'knee_r','11':'leg_l','12':'leg_r' };

/* ====== parser robusto de puntos ====== */
function extractMarks(record){
  const out = [];
  const src = record.injuries ?? record.injuryMarks ?? record.bodyMarks ?? null;

  const addXY = (x,y) => {
    let X = Number(x), Y = Number(y);
    if (!Number.isFinite(X) || !Number.isFinite(Y)) return;
    if (X <= 1 && Y <= 1) { X *= 100; Y *= 100; }   // 0..1 -> %
    X = Math.max(0, Math.min(100, X));
    Y = Math.max(0, Math.min(100, Y));
    out.push([X, Y]);
  };

  const addId = (id) => {
    const key = BODY_POINT_ALIASES[id] || id;
    const p = BODY_POINTS[key];
    if (p) out.push(p);
  };

  if (!src) return out;

  // 1) ARRAY directo
  if (Array.isArray(src)) {
    src.forEach(it => {
      if (Array.isArray(it) && it.length >= 2) addXY(it[0], it[1]);
      else if (it && typeof it === 'object' && ('x' in it) && ('y' in it)) addXY(it.x, it.y);
      else addId(String(it));
    });
    return out;
  }

  // 2) OBJETO { points/bodyPoints/lesionPoints: [...] }
  if (typeof src === 'object') {
    const arr = src.points || src.bodyPoints || src.lesionPoints || [];
    arr.forEach(it => {
      if (Array.isArray(it) && it.length >= 2) addXY(it[0], it[1]);
      else if (it && typeof it === 'object' && ('x' in it) && ('y' in it)) addXY(it.x, it.y);
      else addId(String(it));
    });
    return out;
  }

  // 3) STRING (JSON o "x:y" / "x,y" / ids)
  const raw = String(src).trim();
  if (!raw) return out;

  try {
    const j = JSON.parse(raw);
    return extractMarks({ injuries: j });
  } catch {
    raw.split(/[;|,\s]+/).forEach(tok => {
      const t = tok.trim();
      if (!t) return;
      const m = t.match(/^(\d+(?:\.\d+)?)[:x,](\d+(?:\.\d+)?)$/i);
      if (m) addXY(m[1], m[2]);
      else addId(t);
    });
    return out;
  }
}

// --- parser flexible de 3 filas de signos vitales ---
function parseVitals(val){
  const out = [];
  const push = (r={}) => {
    const row = {
      hour: safe(r.hour||r.hora||r.time||r.t||''),
      fr:   safe(r.fr||r.respRate||r.fResp||r.frecuenciaRespiratoria||''),
      fc:   safe(r.fc||r.heartRate||r.frecuenciaCardiaca||''),
      tas:  safe(r.tas||r.paSistolica||r.tensionSistolica||r.ta_s||''),
      tad:  safe(r.tad||r.paDiastolica||r.tensionDiastolica||r.ta_d||''),
      sao2: safe(r.sao2||r.spo2||r.sat||r.satO2||''),
      temp: safe(r.temp||r.temperatura||''),
      gluc: safe(r.gluc||r.glucosa||r.bg||''),
      ekg:  safe(r.ekg||r.ecg||''),
      neuro:safe(r.neuro||r.neurologico||r.avdi||''),
    };
    if (Object.values(row).some(v => (v ?? '').toString().trim() !== '')) out.push(row);
  };

  if (!val) return out;

  if (Array.isArray(val)) { val.slice(0,3).forEach(push); return out; }

  if (typeof val === 'object') {
    if (Array.isArray(val.rows)) { val.rows.slice(0,3).forEach(push); return out; }
    // Soporta hour1/fr1/... hour2/... hour3/...
    ['1','2','3'].forEach(n=>{
      push({
        hour: val['hour'+n] ?? val['hora'+n],
        fr:   val['fr'+n]   ?? val['frecuenciaRespiratoria'+n],
        fc:   val['fc'+n]   ?? val['frecuenciaCardiaca'+n],
        tas:  val['tas'+n]  ?? val['taS'+n] ?? val['paSistolica'+n],
        tad:  val['tad'+n]  ?? val['taD'+n] ?? val['paDiastolica'+n],
        sao2: val['sao2'+n] ?? val['spo2'+n] ?? val['satO2'+n] ?? val['sat'+n],
        temp: val['temp'+n] ?? val['temperatura'+n],
        gluc: val['gluc'+n] ?? val['glucosa'+n],
        ekg:  val['ekg'+n]  ?? val['ecg'+n],
        neuro:val['neuro'+n]?? val['neurologico'+n] ?? val['avdi'+n],
      });
    });
    return out;
  }

  const s = String(val).trim();
  try { return parseVitals(JSON.parse(s)); } catch {}
  s.split(/\n+/).slice(0,3).forEach(line=>{
    const [hour,fr,fc,tas,tad,sao2,temp,gluc,ekg,neuro] = line.split(/[;,|\t]+/);
    push({hour,fr,fc,tas,tad,sao2,temp,gluc,ekg,neuro});
  });
  return out;
}

// --- Neurológico A/V/D/I -> índice 1..4 (A=1,V=2,D=3,I=4) ---
function neuroIndex(v){
  const s = (v ?? '').toString().trim().toLowerCase();
  if (!s) return NaN;
  const m = s.match(/^(\d)/); if (m) { const n = Number(m[1]); if (n>=1 && n<=4) return n; }
  if (s.startsWith('a') || /alert/.test(s)) return 1;
  if (s.startsWith('v') || /verbal|voz/.test(s)) return 2;
  if (s.startsWith('d') || /dolor/.test(s)) return 3;
  if (s.startsWith('i') || /inconsc/.test(s)) return 4;
  return NaN;
}
const NEU = (v,t) => (neuroIndex(v) === t ? 'on' : '');

// atajo para obtener posibles fuentes en record
function $vitalsFrom(rec){
  return rec.vitals || rec.signosVitales || rec.vitalSigns || rec.monitoring || '';
}


  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  @page { size: 612pt 936pt; margin: 0; }
  html, body { height: 100%; }
  body { margin:0; padding:0; background:#fff; color:#111827;
         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
         -webkit-print-color-adjust: exact; }

  .frame{ box-sizing:border-box; width:calc(100% - 2cm); min-height:calc(100% - 2cm);
          margin:1cm; border:1px solid #111; padding:4px; }

  .h { display:grid; grid-template-columns: 72px 1fr 140px; align-items:center; gap:6px; }
  .logoBox{ height:42px; border:1px solid #D1D5DB; display:flex; align-items:center; justify-content:center; font-size:8px; color:#6b7280 }
  .title { text-align:center; }
  .title .u { font-weight:700; font-size:10.5pt; }
  .title .c { font-size:8.5pt; }
  .folio { display:grid; grid-template-columns:auto 1fr; align-items:center; gap:2px 6px;
           border:1px solid #D1D5DB; padding:4px 6px; border-radius:3px; }
  .folio .f1,.folio .f2{ font-weight:700; font-size:8pt; } .folio .n{ font-weight:800; font-size:11pt; letter-spacing:.3px }

  :root{ --base: 7.4pt; --mini: 6.8pt; }
  .box { border:1px solid #D1D5DB; border-radius:3px; margin-top:5px }
  .box > .head { background:#F3F4F6; padding:4px 6px; font-weight:700; font-size:8.2pt; border-bottom:1px solid #E5E7EB }
  .box .body { padding:4px 5px }
  table.form { width:100%; border-collapse:collapse; font-size:var(--base); table-layout:fixed; }
  table.form td, table.form th { border:1px solid #E5E7EB; padding:2px 3px; vertical-align:top; word-wrap:break-word }

  .label { font-size:var(--base); color:#374151; margin:0 0 1px 0; font-weight:600 }
  .val { font-size:var(--base); font-weight:600 }

  .opts3{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:2px }
  .opts5{ display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:2px }
  .opts2{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:2px }
  

  .opt{ min-width:0; display:flex; align-items:center; gap:3px; border:1px solid #D1D5DB;
        border-radius:2px; padding:1px 3px; min-height:14px; }
  .num{ display:inline-flex; align-items:center; justify-content:center;
        width:11px; height:11px; border:1px solid #9CA3AF; border-radius:2px; font-size:var(--mini); color:#374151; flex:0 0 auto; }
  .num--blank{border-color:transparent}
  .lbl{ flex:1; font-size:var(--base); overflow:hidden; white-space:nowrap; text-overflow:ellipsis }
  .cb{ display:inline-flex; align-items:center; justify-content:center; width:10px; height:10px;
       border:1px solid #374151; border-radius:2px; font-size:var(--mini); line-height:9px; color:#fff; margin-left:auto; flex:0 0 auto; }
  .cb.on{ background:#111827; border-color:#111827 }

  .veh{ display:grid; grid-template-columns: 1fr 58px; column-gap:6px; row-gap:2px; }
  .nobox{ display:flex; align-items:center; gap:3px; }
  .nobox span{ font-size:var(--mini); color:#374151 }
  .uline{ flex:1; border-bottom:1px solid #D1D5DB; min-height:10px; font-weight:600; font-size:var(--base) }

  .vstack{ display:grid; grid-template-rows:auto auto; row-gap:3px; }

  .w16{width:16%} .w8{width:8%} .w10{width:10%} .nowrap{white-space:nowrap}

  .box--soft .body{ background:#F7F7F7; } /* gris claro para mejorar lectura */
  /* ===== MODO COMPACTO (actívalo en <body class="compact">) ===== */
body.compact :root{ --base:6.9pt; --mini:6.2pt; }     /* tipografía apenas menor */

body.compact .h{ grid-template-columns:64px 1fr 120px; gap:4px; } /* encabezado más ceñido */
body.compact .box{ margin-top:3px; }
body.compact .box > .head{ padding:3px 5px; font-size:7.8pt; }
body.compact .box .body{ padding:2px 3px; }

body.compact table.form td,
body.compact table.form th{ padding:1px 2px; }        /* celdas más apretadas */
body.compact .label{ margin:0; line-height:1.05; }
body.compact .val{ line-height:1.05; }

body.compact .opt{ gap:2px; padding:0 2px; min-height:12px; }
body.compact .num{ width:9px; height:9px; }
body.compact .cb{ width:9px; height:9px; line-height:8px; }

body.compact .veh{ column-gap:4px; row-gap:1px; grid-template-columns:1fr 48px; }
body.compact .uline{ min-height:9px; }
/* ===== /MODO COMPACTO ===== */

/* ===== MODO SLIM para TODAS las casillas (opt/num/cb/lbl) ===== */
body.slim-opts .opts2,
body.slim-opts .opts3,
body.slim-opts .opts5{ justify-items:start; } /* evita que las casillas se estiren al 100% */

body.slim-opts .opt{
  gap:2px;
  padding:0 2px;         /* menos relleno horizontal */
  min-height:13px;       /* más bajitas */
  justify-self:start;    /* no ocupar todo el ancho de la celda del grid */
}

body.slim-opts .num{      /* cuadrito del número */
  width:8px; height:8px;
  font-size:5.6pt;
}

body.slim-opts .cb{       /* cuadrito del check */
  width:8px; height:8px;
  line-height:7px;
  font-size:5.6pt;
}

body.slim-opts .lbl{      /* texto de la opción */
  font-size:calc(var(--base) - 1pt);
  white-space:nowrap;
  text-overflow:ellipsis;
  overflow:hidden;
}

/* ===== Uniformar largo de las casillas (sobre slim-opts) ===== */
body.slim-opts {
  --opt-max: 120px;       /* ajusta este valor si quieres más/menos largo uniforme */
}

body.slim-opts .opt{
  box-sizing:border-box;
  width:100%;             /* ocupa todo el ancho de su celda de grid (uniforme por fila) */
  max-width: var(--opt-max);
  /* el resto ya viene de slim-opts: gap, padding, min-height, etc. */
}

body.slim-opts .opts2,
body.slim-opts .opts3,
body.slim-opts .opts5{
  justify-content:start;  /* al usar max-width, alinea los bloques a la izquierda */
  column-gap:4px;         /* separación pareja entre casillas */
}


/* Opcional: ULTRA delgado (aún más pequeño) — aplica también la clase 'xs' al body */
body.slim-opts.xs .num,
body.slim-opts.xs .cb{ width:7px; height:7px; font-size:5pt; line-height:6px; }
body.slim-opts.xs .opt{ min-height:10px; padding:0 1.5px; gap:1.5px; }
body.slim-opts.xs .lbl{ font-size:calc(var(--base) - 1.2pt); }

/* ===================== APGAR — un solo check a la DERECHA ===================== */
table.form.apgar th, table.form.apgar td { text-align:center; vertical-align:middle; }
table.form.apgar tr td:first-child { text-align:left; } /* columna PARÁMETROS */

/* No sombrear la celda seleccionada, pero SIN borrar el background-image */
table.form.apgar td.sel{
  background-color: transparent !important;   /* <- solo color de fondo */
  /* quita los !important innecesarios en lo demás */
  color: inherit;
  font-weight: inherit;
}

/* Reservar espacio para el check a la derecha en columnas 0/1/2 */
table.form.apgar tr td:nth-child(2),
table.form.apgar tr td:nth-child(3),
table.form.apgar tr td:nth-child(4) {
  padding-right:16px;
  background-position: right 3px center;   /* donde irá el check */
  background-repeat: no-repeat;
  background-size: 10px 10px;
}

/* Pintar el ÚNICO check como background-image (SVG), sin pseudo-elementos */
table.form.apgar tr td:nth-child(2).sel,
table.form.apgar tr td:nth-child(3).sel,
table.form.apgar tr td:nth-child(4).sel {
  /* cuadrito oscuro con palomita blanca, tamaño 10×10 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Crect x='0.5' y='0.5' width='9' height='9' rx='2' ry='2' fill='%23111827' stroke='%23111827' stroke-width='1'/%3E%3Cpath d='M2.2 5.2l1.6 1.8 3.5-3.8' fill='none' stroke='%23fff' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}
/* ============================================================================ */

/* lista vertical de opciones (una debajo de otra) */
.optsV{ display:grid; grid-auto-rows:auto; row-gap:2px }
/* === UN SOLO BLOQUE: PARTO + EVALUACIÓN INICIAL === */
.box.oneblock .body{ padding:4px 4px } /* aún más ceñido */

.oneblock .grid{
  display:grid;
  grid-template-columns: 0.95fr 1.05fr 1fr; /* 3 rieles; el 3ro lo usamos para APGAR y eval derecha */
  grid-auto-rows: minmax(0, auto);
  gap:4px 6px; /* vertical/horizontal */
}

/* celdas internas sin marco, todo dentro del borde de la box */
.oneblock .cell{ min-width:0 }

/* subtítulos internos (más chicos que .head) */
.oneblock .subhead{
  font-weight:700; font-size:7.6pt; margin:0 0 2px 0; color:#374151;
}

/* lista vertical de opciones (una debajo de otra) */
.optsV{ display:grid; grid-auto-rows:auto; row-gap:2px }

/* Aún más ceñido en modo compact */
body.compact .oneblock .grid{ gap:3px 4px }

/* ==== EVALUACIÓN INICIAL (5 columnas, compacto y sin huecos) ==== */
.box.eval{ --opt-max:132px; }                    /* ancho uniforme de casillas */
body.compact .box.eval{ --opt-max:136px; }       /* un pelín más en modo compacto */

.box.eval .body{ padding:4px 4px; background:#F7F7F7; }
.box.eval .grid{
  display:grid;
  /* 1 y 2 son más anchas para textos largos */
  grid-template-columns: 1.25fr 1.35fr 1.10fr 1.05fr 1.10fr;
  column-gap:6px; row-gap:4px;
}

/* grupos “título + opciones” muy pegados */
.box.eval .group{ margin-top:0; }
.box.eval .group + .group{ margin-top:4px; }     /* separación mínima entre grupos */
.box.eval .subhead{
  font-weight:700; font-size:7.6pt; color:#374151; margin:0 0 1px 0; line-height:1.1;
}
.box.eval .optsV{ display:grid; grid-auto-rows:auto; row-gap:1px; }

/* mismas casillas reutilizando tus estilos globales (slim-opts, etc.) */
/* ===== EXPLORACIÓN FÍSICA + ZONA DE LESIÓN ===== */
.box.phys .body{ padding:4px 5px; background:#fff; }
.box.phys .grid{
  display:grid;
  grid-template-columns: 1.1fr 1.1fr 200px; /* dos columnas de checks + imagen */
  column-gap:8px; row-gap:6px; align-items:start;
}

/* lista en columna, muy compacta */
.phys .group{ margin:0; }
.phys .subhead{ font-weight:700; font-size:8pt; color:#374151; margin:0 0 3px 0; }

/* Contenedor de la silueta: altura = alto real de la imagen (no fija) */
.bodymap{
  position: relative;
  width: 100%;
  border:1px solid #E5E7EB; border-radius:3px;
  background:#fff;
}

/* La imagen ocupa todo el ancho, mantiene proporción, define la altura del contenedor */
.bodymap .bm{
  display:block;
  width:100%;
  height:auto;          /* <- clave: el contenedor se hace alto por la imagen */
  object-fit:contain;
  pointer-events:none;
}

/* Marcadores */
.bodymap .mk{
  position:absolute;
  width:7px; height:7px; border-radius:50%;
  background:#111827; border:1px solid #111827;
  transform:translate(-50%,-50%);
}

/* ——— VITALS ULTRA COMPACTO ——— */
.box.vitals > .head{
  padding: 2px 4px;           /* menos alto del título */
  font-size: 7.4pt;
}

.box.vitals .body{
  padding: 2px 3px;           /* menos padding del contenedor */
}

table.form.vitals{
  font-size: 6.4pt;           /* base más pequeña sólo aquí */
}

/* Centrado total en SIGNOS VITALES */
table.form.vitals th,
table.form.vitals td{
  text-align: center !important;
  vertical-align: middle !important; /* sobreescribe el top global */
  line-height: 1.05;                 /* compacto pero centrado */
}

/* La 1ª columna (Hora) ya no a la izquierda */
table.form.vitals th:first-child,
table.form.vitals td:first-child{
  text-align: center !important;
}

/* Fila A/V/D/I más bajita pero centrada */
table.form.vitals .avdi th{
  padding-top: 0;
  padding-bottom: 0;
  line-height: 1;
}

/* Que el cuadrito del check quede EXACTAMENTE al centro */
.tcb{
  display: inline-grid;     /* mejor que inline-flex para centrar en celdas */
  place-items: center;
  width: 7px; height: 7px;
  line-height: 7px;
  font-size: 5pt;
  margin: 0 auto;           /* centra horizontal si la celda tuviera texto-align heredado */
}

.tcb.on{ background:#111827; }

/* SAMPLE compacto */
.box.sample { --base: 6.6pt; --mini: 6pt; }
.box.sample .body { padding: 3px 4px; }
table.form.sample td, table.form.sample th { padding: 1px 2px; }
.box.sample .label { margin: 0; font-size: var(--mini); }


/* --- forzar salto de página entre frames --- */
.frame + .frame{ page-break-before: always; }

/* ---- Page break ---- */
.pagebreak { page-break-before: always; }

/* ---- ATENCIÓN Y MANEJO (5 columnas) ---- */
.box.p2 .body{ padding:4px 5px; background:#fff; }
.box.p2 .grid{
  display:grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr; /* CINCO columnas */
  column-gap:8px;
  row-gap:6px;
  align-items:start;
}
.box.p2 .group{ margin:0; }
.box.p2 .group + .group{ margin-top:6px; }
.box.p2 .subhead{
  font-weight:700; font-size:7.6pt; color:#374151; margin:0 0 2px 0; line-height:1.1;
}
/* casillas angostas y uniformes en esta box */
.box.p2 { --opt-max: 150px; }          /* ajusta si necesitas */
.box.p2 .optsV .opt,
.box.p2 .opts2 .opt{ max-width: var(--opt-max); }

/* ===== CONDICIÓN DEL PACIENTE — MANEJO (gris) ===== */
.box.cond{ border:1px solid #D1D5DB; }
.box.cond > .head{ background:#F3F4F6; }
.box.cond .body{ background:#F7F7F7; padding:4px 5px; }

/* tipografías (igual que p2) */
.box.cond .subhead{
  font-weight:700; font-size:7.6pt; color:#374151;
  margin:0 0 2px 0; line-height:1.1;
}
.box.cond{ --opt-max:150px; }
.box.cond .optsV .opt, .box.cond .opts2 .opt{ max-width:var(--opt-max); }

/* rejillas */
.box.cond .grid-top{
  display:grid;
  grid-template-columns: repeat(5, 1fr);  /* 5 columnas */
  column-gap:8px; row-gap:6px; align-items:start;
}
.box.cond .grid-bottom{
  display:grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 columnas */
  column-gap:8px; row-gap:6px; align-items:start;
}

/* utilidades de colocación */
.box.cond .span2{ grid-column: span 2; }   /* p.ej. Hemorragias ocupa 2 */

table.form.manejo td:empty::after { content: "\\00A0"; } /* NBSP */

/* ===== Deslinde (fondo blanco) ===== */
.box.waiver > .head{ background:#F3F4F6; }
.box.waiver .body{ background:#fff; padding:6px 8px; }

/* línea con etiqueta a la izquierda y renglón subrayado al ancho */
.waiver-row{ margin:6px 0; }
.waiver-row > span{ font-size:var(--mini); color:#374151; margin-right:6px; white-space:nowrap; }
.waiver-row .uline{ display:block; width:100%; min-height:12px; border-bottom:1px solid #111827; }

.waiver-title{
  text-align:center; font-weight:700; font-size:7.8pt; margin:6px 0 4px; color:#111827;
}

.waiver-legal{
  font-size:7.2pt; line-height:1.25; color:#111827;
  text-align:center; margin:2px 0 8px;
  white-space:normal;
}

.sign-grid{
  display:grid; grid-template-columns:1fr 1fr; column-gap:12px; row-gap:8px; align-items:end;
}
.sigcard{ display:flex; flex-direction:column; }
.sigpad{
  border:1px solid #E5E7EB; border-radius:3px;
  height:58px;                 /* ← más baja que antes */
  background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden;
}
.sigpad svg{ max-width:100%; max-height:100%; }
.sigpad img{ max-width:100%; max-height:100%; object-fit:contain; }
.sigline{ border-top:1px solid #111827; margin-top:6px; height:0; }
.sigcap{ font-size:var(--mini); color:#374151; margin-top:2px; text-align:center; }
.sigcap{ font-size:var(--mini); color:#374151; margin-top:2px; text-align:center; }
.signame{ font-weight:600; font-size:7.2pt; color:#111827; margin-top:1px; }

/* Observaciones con caja más alta */
.uline--big{ min-height:36px; }

/* --- Bloque gris (transfer) --- */
.box.xfer .body{ background:#F3F4F6; padding:4px 6px; }

/* separador tenue */
.sepline{ height:1px; background:#D1D5DB; margin:6px 0; }

/* firmas compactas */
.sigpad{ height:38px; border:1px solid #E5E7EB; background:#fff; }
.sigpad.small{ height:32px; }                 /* un poco más baja */
.sigline{ border-bottom:1px solid #9CA3AF; margin-top:2px; }
.sigcap{ font-size:var(--mini); color:#374151; margin-top:2px; text-align:center; }
.submini{ font-size:7.2pt; color:#374151; font-weight:600; margin:6px 0 2px; }

/* util 2 columnas reutilizable en cualquier sección */
.grid2{
  display:flex;            /* fallback */
  gap:12px;
  align-items:start;
}
.grid2 > *{ flex:1 1 0; }

/* si hay soporte de grid, úsalo */
@supports (display: grid){
  .grid2{
    display:grid;
    grid-template-columns: 1fr 1fr;
  }
  .grid2 > *{ flex:unset; }
}

/* ===== INSUMOS (ultra compacto y multicolumna) ===== */
.box.supplies > .head{
  background:#F3F4F6;
  padding: 2px 4px;          /* ↓ menos alto del título */
  font-size: 7pt;            /* ↓ un pelín menor */
}
.box.supplies .body{
  padding: 2px 3px;          /* ↓ menos padding */
  background:#fff;
}

/* 4 columnas (si faltara espacio, cambia a 5 activando .cols5) */
.box.supplies .supgrid{
  columns: 4;
  column-gap: 6px;           /* ↓ separa un poco menos */
}

/* Cada renglón: más corto */
.box.supplies .supply{
  break-inside: avoid;
  display: grid;
  grid-template-columns: 16px 1fr 22px; /* 18→16 | 28→22 */
  align-items: center;
  font-size: 5.8pt;          /* 6.2→5.8 */
  line-height: 1.00;         /* 1.05→1.00 */
  padding: 0 2px;            /* 1px 2px → 0 2px */
  border-bottom: 0.5px solid #E5E7EB; /* 1px→0.5px (menor altura visual) */
}

.box.supplies .supply .num{
  text-align: right;
  padding-right: 3px;        /* 4→3 */
  color:#6B7280;
}

.box.supplies .supply .name{
  padding: 0 3px;            /* 4→3 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.box.supplies .supply .qty{
  text-align: center;
  font-weight: 600;          /* 700→600 para que no “engorde” la línea */
  border-left: 0.5px solid #E5E7EB;
  min-height: 7px;           /* 10→7 */
}

/* Si aún rozara la página 3, simplemente añade la clase cols5 al contenedor: */
/* <div class="box supplies cols5">… */
.box.supplies.cols5 .supgrid{ columns: 5; }






</style>
</head>

<body class="compact slim-opts">

<div class="frame">

<!-- ENCABEZADO -->
<div class="h">
  <div class="logoBox">LOGO 1</div>
  <div class="title">
    <div class="u">Universidad de Guadalajara</div>
    <div class="c">Centro Universitario de Ciencias Exactas e Ingenierías</div>
    <div class="c">Formato de Atención a Urgencias Prehospitalarias</div>
  </div>
  <div class="folio">
    <div class="f1">FOLIO</div><div class="n">${folio}</div>
    <div class="f2">N°</div><div></div>
  </div>
</div>

<!-- DATOS DEL SERVICIO -->
<div class="box">
  <div class="head">DATOS DEL SERVICIO</div>
  <div class="body">
    <table class="form">
      <tr>
        <td class="w16"><div class="label">Fecha</div><div class="val">${safe(record.date) || ''}</div></td>
        <td class="w8"><div class="label">Día</div><div class="val">${day}</div></td>
        <td style="width:14%"><div class="label">Mes</div><div class="val">${month}</div></td>  <!-- antes w8 -->
        <td style="width:18%"><div class="label">Año</div><div class="val">${year}</div></td>  <!-- antes w10 -->
        <td><div class="label nowrap">Día de la semana</div><div class="val">${safe(record.weekDay) || week}</div></td>
      </tr>


      <!-- Motivo -->
      <tr>
        <td colspan="5">
          <div class="label">Motivo de la atención</div>
          <div class="opts3">
            ${Opt('Enfermedad', IN(motivo,'Enfermedad'), '1')}
            ${Opt('Traumatismo', IN(motivo,'Traumatismo'), '2')}
            ${Opt('Gineco obstétrico', IN(motivo,'Gineco obstétrico','Gineco obstetrico','Gineco-obstétrico'), '3')}
          </div>
        </td>
      </tr>

      <!-- Ubicación -->
      <tr>
        <td colspan="5">
          <div class="label">Ubicación del servicio</div>
          <div class="opts5">
            ${Opt('Cucei', IN(campus,'Cucei','CUCEI'), '1')}
            ${Opt('Inst. Dep.', IN(campus,'Inst. Dep.','Instituto Dep.','Instituto Dep'), '2')}
            ${Opt('Politécnico', IN(campus,'Politécnico','Politecnico'), '3')}
            ${Opt('Vocacional', IN(campus,'Vocacional'), '4')}
            ${Opt('Prepa 12', IN(campus,'Prepa 12','Preparatoria 12'), '5')}
          </div>
        </td>
      </tr>

      <!-- Tipo de unidad + Operador + Prestadores -->
      <tr>
        <td colspan="3">
          <div class="label">Tipo de unidad</div>
          <div class="veh">
            <div>${Opt('Vehículo oficial', IN(unit,'Vehículo oficial','Vehiculo oficial','Oficial'), '1')}</div>
            <div>${NoBox(unitNoIf('Vehículo oficial','Vehiculo oficial','Oficial'))}</div>
            <div>${Opt('Cuatrimoto', IN(unit,'Cuatrimoto'), '2')}</div>
            <div>${NoBox(unitNoIf('Cuatrimoto'))}</div>
            <div>${Opt('Ambulancia', IN(unit,'Ambulancia'), '3')}</div>
            <div>${NoBox(unitNoIf('Ambulancia'))}</div>
            <div>${Opt('Ambulancia eléctrica', IN(unit,'Ambulancia eléctrica','Ambulancia electrica'), '4')}</div>
            <div>${NoBox(unitNoIf('Ambulancia eléctrica','Ambulancia electrica'))}</div>
            <div>${Opt('Otro', IN(unit,'Otro','Otros'), '5')}</div>
            <div>${NoBox(unitNoIf('Otro','Otros'))}</div>
          </div>
        </td>
        <td colspan="2">
          <div class="vstack">
            <div>
              <div class="label">Operador</div>
              <div class="val">${safe(record.operator)}</div>
            </div>
            <div>
              <div class="label">Prestadores del servicio</div>
              <div class="val">${prestadores}</div>
            </div>
          </div>
        </td>
      </tr>

      <!-- Media filiación -->
      <tr>
        <td colspan="5"><div class="label">Nombre o media filiación</div><div class="val">${safe(record.patientName || record.mediaFiliacion || '')}</div></td>
      </tr>

      <!-- Domicilio -->
      <tr>
        <td colspan="5"><div class="label">Domicilio</div><div class="val">${safe(record.address)}</div></td>
      </tr>

      <tr>
        <td colspan="5">
          <div class="label">Colonia</div>
          <div class="val">${safe(record.colony)}</div>
        </td>
      </tr>

      <!-- Municipio + Teléfono -->
    <tr>
      <td colspan="4">
        <div class="label">Municipio</div>
        <div class="val">${safe(record.municipality)}</div>
      </td>
      <!-- CAMBIA ESTA LÍNEA -->
      <td style="width:25%">
        <div class="label">Teléfono</div>
        <div class="val">${safe(record.phone)}</div>
      </td>
    </tr>

      <!-- Sexo + Edad + Red universitaria + Código (Código a la derecha) -->
      <tr>
        <td class="w8">
          <div class="label">Sexo</div>
          <div class="val">${safe(record.gender)}</div>
        </td>
        <td class="w10">
          <div class="label">Edad</div>
          <div class="val">${safe(record.age)}</div>
        </td>
        <td colspan="2">
          <div class="label nowrap">Perteneciente a la Red Universitaria</div>
          <div class="opts2 tight">
            ${Opt('Sí', IN(record.belongsToUniNet,'Sí','Si','Yes',true))}
            ${Opt('No', IN(record.belongsToUniNet,'No',false))}
          </div>
        </td>
        <td class="w10">
          <div class="label">Código</div>
          <div class="val">${studentCode}</div>
        </td>
      </tr>


      <!-- Adscripción (fila completa, sin Código) -->
      <tr>
        <td colspan="5">
          <div class="label">Adscripción</div>
          <div class="val">${safe(record.adscription)}</div>
        </td>
      </tr>
    </table>
    </div> <!-- /.body DATOS DEL SERVICIO -->
</div>  <!-- /.box  DATOS DEL SERVICIO -->

<!-- CAUSA TRAUMÁTICA / MECANISMO DE LESIÓN / CAUSA CLÍNICA -->
<div class="box box--soft">
  <div class="head">CAUSA TRAUMÁTICA, MECANISMO DE LESIÓN Y CAUSA CLÍNICA</div>
  <div class="body">
    <table class="form">
      <!-- Causa traumática (agente causal) — EN 2 FILAS + 3ra fila (11–15) -->
      <tr>
        <td colspan="4">
          <div class="label">Causa traumática (agente causal)</div>

          <!-- Fila 1: 1–5 -->
          <div class="opts5">
            ${Opt('Arma',
              IN(record.traumaAgent,'Arma') || IN(record.agenteCausal,'Arma') || IN(record.causaTraumatica,'Arma') || IN(record.trauma,'Arma')
            , '1')}
            ${Opt('Automotor',
              IN(record.traumaAgent,'Automotor') || IN(record.agenteCausal,'Automotor') || IN(record.causaTraumatica,'Automotor')
            , '2')}
            ${Opt('Maquinaria',
              IN(record.traumaAgent,'Maquinaria') || IN(record.agenteCausal,'Maquinaria') || IN(record.causaTraumatica,'Maquinaria')
            , '3')}
            ${Opt('Bicicleta',
              IN(record.traumaAgent,'Bicicleta') || IN(record.agenteCausal,'Bicicleta') || IN(record.causaTraumatica,'Bicicleta')
            , '4')}
            ${Opt('Herramienta',
              IN(record.traumaAgent,'Herramienta') || IN(record.agenteCausal,'Herramienta') || IN(record.causaTraumatica,'Herramienta')
            , '5')}
          </div>

          <!-- Fila 2: 6–10 -->
          <div class="opts5">
            ${Opt('Electricidad',
              IN(record.traumaAgent,'Electricidad') || IN(record.agenteCausal,'Electricidad') || IN(record.causaTraumatica,'Electricidad')
            , '6')}
            ${Opt('Fuego',
              IN(record.traumaAgent,'Fuego') || IN(record.agenteCausal,'Fuego') || IN(record.causaTraumatica,'Fuego')
            , '7')}
            ${Opt('Sustancia caliente',
              IN(record.traumaAgent,'Sustancia caliente') || IN(record.agenteCausal,'Sustancia caliente') || IN(record.causaTraumatica,'Sustancia caliente')
            , '8')}
            ${Opt('Producto biológico',
              IN(record.traumaAgent,'Producto biológico','Producto biologico') || IN(record.agenteCausal,'Producto biológico','Producto biologico') || IN(record.causaTraumatica,'Producto biológico','Producto biologico')
            , '9')}
            ${Opt('Sustancia tóxica',
              IN(record.traumaAgent,'Sustancia tóxica','Sustancia toxica') || IN(record.agenteCausal,'Sustancia tóxica','Sustancia toxica') || IN(record.causaTraumatica,'Sustancia tóxica','Sustancia toxica')
            , '10')}
          </div>
        </td>
      </tr>

      <!-- Fila 3: 11–15 -->
      <tr>
        <td colspan="4">
          <div class="opts5">
            ${Opt('Juguete',
              IN(record.traumaAgent,'Juguete') || IN(record.agenteCausal,'Juguete') || IN(record.causaTraumatica,'Juguete')
            , '11')}
            ${Opt('Explosión',
              IN(record.traumaAgent,'Explosión','Explosion') || IN(record.agenteCausal,'Explosión','Explosion') || IN(record.causaTraumatica,'Explosión','Explosion')
            , '12')}
            ${Opt('Ser humano',
              IN(record.traumaAgent,'Ser humano') || IN(record.agenteCausal,'Ser humano') || IN(record.causaTraumatica,'Ser humano')
            , '13')}
            ${Opt('Animal',
              IN(record.traumaAgent,'Animal') || IN(record.agenteCausal,'Animal') || IN(record.causaTraumatica,'Animal')
            , '14')}
            ${Opt('Otro',
              IN(record.traumaAgent,'Otro') || IN(record.agenteCausal,'Otro') || IN(record.causaTraumatica,'Otro')
            , '15')}
          </div>
        </td>
      </tr>

      <!-- Mecanismo de lesión + "Otro (15)" en la misma fila -->
      <tr>
        <td colspan="3">
          <div class="label">Mecanismo de lesión</div>
          <div class="uline">${safe(record.mechanism || record.mecanismo || record.mecanismoLesion || record.mecanismoDeLesion || '')}</div>
        </td>
        <td>
          <div class="label">Otro (15)</div>
          <div class="uline">${safe(record.traumaAgentOther || record.traumaOther || record.otroTrauma || '')}</div>
        </td>
      </tr>

      <!-- Causa clínica (origen probable) + línea para "12 Otro" a la derecha -->
      <tr>
        <td colspan="4">
          <div class="label">Causa clínica (origen probable)</div>
          <div class="opts5">
            ${Opt('Neurológica',
              IN(record.clinicalCause,'Neurológica','Neurologica') || IN(record.causaClinica,'Neurológica','Neurologica') || IN(record.origenProbable,'Neurológica','Neurologica')
            , '1')}
            ${Opt('Cardiovascular',
              IN(record.clinicalCause,'Cardiovascular') || IN(record.causaClinica,'Cardiovascular') || IN(record.origenProbable,'Cardiovascular')
            , '2')}
            ${Opt('Respiratorio',
              IN(record.clinicalCause,'Respiratorio') || IN(record.causaClinica,'Respiratorio') || IN(record.origenProbable,'Respiratorio')
            , '3')}
            ${Opt('Metabólico',
              IN(record.clinicalCause,'Metabólico','Metabolico') || IN(record.causaClinica,'Metabólico','Metabolico') || IN(record.origenProbable,'Metabólico','Metabolico')
            , '4')}
            ${Opt('Digestiva',
              IN(record.clinicalCause,'Digestiva') || IN(record.causaClinica,'Digestiva') || IN(record.origenProbable,'Digestiva')
            , '5')}
            ${Opt('Urogenital',
              IN(record.clinicalCause,'Urogenital') || IN(record.causaClinica,'Urogenital') || IN(record.origenProbable,'Urogenital')
            , '6')}
            ${Opt('Gineco obstétrica',
              IN(record.clinicalCause,'Gineco obstétrica','Gineco obstetrica','Gineco-obstétrica') || IN(record.causaClinica,'Gineco obstétrica','Gineco obstetrica','Gineco-obstétrica') || IN(record.origenProbable,'Gineco obstétrica','Gineco obstetrica','Gineco-obstétrica')
            , '7')}
            ${Opt('Psico emotiva',
              IN(record.clinicalCause,'Psico emotiva','Psico-emotiva') || IN(record.causaClinica,'Psico emotiva','Psico-emotiva') || IN(record.origenProbable,'Psico emotiva','Psico-emotiva')
            , '8')}
            ${Opt('Músculo esquelético',
              IN(record.clinicalCause,'Músculo esquelético','Musculo esqueletico') || IN(record.causaClinica,'Músculo esquelético','Musculo esqueletico') || IN(record.origenProbable,'Músculo esquelético','Musculo esqueletico')
            , '9')}
            ${Opt('Infecciosa',
              IN(record.clinicalCause,'Infecciosa') || IN(record.causaClinica,'Infecciosa') || IN(record.origenProbable,'Infecciosa')
            , '10')}
            ${Opt('Oncológico',
              IN(record.clinicalCause,'Oncológico','Oncologico') || IN(record.causaClinica,'Oncológico','Oncologico') || IN(record.origenProbable,'Oncológico','Oncologico')
            , '11')}
            ${Opt('Otro',
              IN(record.clinicalCause,'Otro') || IN(record.causaClinica,'Otro') || IN(record.origenProbable,'Otro')
            , '12')}

            <!-- Línea a la derecha del "12 Otro" (misma fila, debajo del 8) -->
            <div class="nobox" style="grid-column: 3 / 6;">
              <span>12 Otro</span>
              <div class="uline">${safe(record.clinicalOther12 || record.clinicalOther || record.otroClinico || '')}</div>
            </div>
          </div>
        </td>
      </tr>

      <!-- Especifique (línea) -->
      <tr>
        <td colspan="4">
          <div class="nobox"><span>Especifique</span><div class="uline">${safe(record.clinicalOther || record.especifiqueClinico || '')}</div></div>
        </td>
      </tr>
    </table>
  </div>
</div>

<!-- PARTO (compacto; casillas angostas; fechas debajo de Subsecuente; tabla optimizada) -->
<div class="box">
  <div class="head">PARTO</div>
  <div class="body">
    <table class="form">
      <tr>
        <!-- IZQUIERDA: Producto + Sexo + Apgar (angosto) -->
        <td style="width:16%">
          <div class="label">Producto</div>
          <div style="max-width:120px">
            ${Opt('Vivo',
              IN((record.birthProduct||record.product||record.producto||record.resultadoParto),'Vivo')
            , '1')}
            ${Opt('Muerto',
              IN((record.birthProduct||record.product||record.producto||record.resultadoParto),'Muerto')
            , '2')}
          </div>

          <div class="label" style="margin-top:2px">Sexo</div>
          <div style="max-width:120px">
            ${Opt('Masc.',
              IN((record.newbornSex||record.sexoBebe||record.babySex||record.sexoRn),'Masc.','Masculino','M')
            , '1')}
            ${Opt('Femenino',
              IN((record.newbornSex||record.sexoBebe||record.babySex||record.sexoRn),'Femenino','F')
            , '2')}
          </div>

          <div class="label" style="margin-top:4px">Apgar</div>
          <div class="nobox" style="max-width:140px"><span>1 min</span><div class="uline">${safe(record.apgar1 || record.apgar_1 || record.apgar_01 || '')}</div></div>
          <div class="nobox" style="max-width:140px"><span>5 min</span><div class="uline">${safe(record.apgar5 || record.apgar_5 || record.apgar_05 || '')}</div></div>
          <div class="nobox" style="max-width:140px"><span>10 min</span><div class="uline">${safe(record.apgar10 || record.apgar_10 || '')}</div></div>
        </td>

        <!-- CENTRO: Subsecuente (Para y Aborto debajo de Cesárea) + Fechas debajo -->
        <td style="width:26%">
          <div class="label">Subsecuente</div>
          <div class="nobox"><span>Gesta</span><div class="uline">${safe(record.gesta || record.gestas || '')}</div></div>
          <div class="nobox"><span>Cesárea</span><div class="uline">${safe(record.cesarea || record.cesárea || record.numCesareas || '')}</div></div>
          <div class="nobox"><span>Para</span><div class="uline">${safe(record.para || record.partos || '')}</div></div>
          <div class="nobox"><span>Aborto</span><div class="uline">${safe(record.aborto || record.abortos || '')}</div></div>

          <!-- Fechas debajo de Subsecuente -->
          <div class="nobox" style="margin-top:2px">
            <span>Fecha última menstruación</span>
            <div class="uline">${safe(record.fum || record.fechaUltimaMenstruacion || record.fechaUM || '')}</div>
          </div>
          <div class="nobox">
            <span>Fecha probable de parto</span>
            <div class="uline">${safe(record.fpp || record.fechaProbableParto || record.fechaPP || '')}</div>
          </div>
        </td>

        <!-- DERECHA: Tabla APGAR (fuente pequeña; 0/1/2 más anchas) -->
        <td>
          <table class="form apgar" style="font-size:calc(var(--mini) - 0.3pt); line-height:1.12; margin-top:0">
            <tr>
              <th style="width:34%">PARÁMETROS</th>
              <th style="width:18%">0</th>
              <th style="width:24%">1</th>
              <th style="width:24%">2</th>
            </tr>
            <tr>
              <td>COLORACIÓN</td>
              <td class="${APSEL(record.paramColoracion,0)}">Azul pálido</td>
              <td class="${APSEL(record.paramColoracion,1)}">Cuerpo rosa; manos/pies azules</td>
              <td class="${APSEL(record.paramColoracion,2)}">Completamente rosa</td>
            </tr>
            <tr>
              <td>FRECUENCIA CARDÍACA</td>
              <td class="${APSEL(record.paramFrecuenciaCardiaca,0)}">Ausente</td>
              <td class="${APSEL(record.paramFrecuenciaCardiaca,1)}">Lento (&lt;100)</td>
              <td class="${APSEL(record.paramFrecuenciaCardiaca,2)}">&ge; 100</td>
            </tr>
            <tr>
              <td>TONO MUSCULAR</td>
              <td class="${APSEL(record.paramTonoMuscular,0)}">Flácido</td>
              <td class="${APSEL(record.paramTonoMuscular,1)}">Flex. en extremidades</td>
              <td class="${APSEL(record.paramTonoMuscular,2)}">Movimiento activo</td>
            </tr>
            <tr>
              <td>RESPUESTA A ESTÍMULOS</td>
              <td class="${APSEL(record.paramRespuestaEstimulos,0)}">Ausente</td>
              <td class="${APSEL(record.paramRespuestaEstimulos,1)}">Mov. leve, llanto</td>
              <td class="${APSEL(record.paramRespuestaEstimulos,2)}">Llanto vigoroso</td>
            </tr>
            <tr>
              <td>ESFUERZO RESPIRATORIO</td>
              <td class="${APSEL(record.paramEsfuerzoRespiratorio,0)}">Ausente</td>
              <td class="${APSEL(record.paramEsfuerzoRespiratorio,1)}">Lento / irregular</td>
              <td class="${APSEL(record.paramEsfuerzoRespiratorio,2)}">Bueno, llanto</td>
            </tr>
          </table>
        </td>
      </tr>
  </table>
  </div> <!-- /.body PARTO -->
  </div>  <!-- /.box  PARTO -->
  <!-- EVALUACIÓN INICIAL (5 columnas compactas) -->
  <div class="box eval">
      <div class="head">EVALUACIÓN INICIAL</div>
      <div class="body">
        <div class="grid">

          <!-- Col 1: Evaluación inicial + Circulación -->
          <div>
            <div class="group">
              <div class="subhead">Evaluación inicial</div>
              <div class="optsV">
                ${Opt('Consciente',                    HIT(record.evalInicial,1,'Consciente'), '1')}
                ${Opt('Respuesta a estímulo verbal',   HIT(record.evalInicial,2,'Respuesta a estímulo verbal','Respuesta a estimulo verbal'), '2')}
                ${Opt('Respuesta a estímulo doloroso', HIT(record.evalInicial,3,'Respuesta a estímulo doloroso','Respuesta a estimulo doloroso'), '3')}
                ${Opt('Inconsciente',                  HIT(record.evalInicial,4,'Inconsciente'), '4')}
              </div>
            </div>

            <div class="group">
              <div class="subhead">Circulación</div>
              <div class="optsV">
                ${Opt('Carotídeo',               HIT(record.circulacionItem,1,'Carotídeo','Carotideo'), '1')}
                ${Opt('Radial',                  HIT(record.circulacionItem,2,'Radial'), '2')}
                ${Opt('Paro cardiorespiratorio', HIT(record.circulacionItem,3,'Paro cardiorespiratorio'), '3')}
              </div>
            </div>
          </div>

          <!-- Col 2: Ventilación + Vía aérea (debajo, como pediste) -->
          <div>
            <div class="group">
              <div class="subhead">Ventilación</div>
              <div class="optsV">
                ${Opt('Automatismo regular',     HIT(record.ventilacionItem,1,'Automatismo regular'), '1')}
                ${Opt('Automatismo irregular',   HIT(record.ventilacionItem,2,'Automatismo irregular'), '2')}
                ${Opt('Ventilación rápida',      HIT(record.ventilacionItem,3,'Ventilación rápida','Ventilacion rapida'), '3')}
                ${Opt('Ventilación superficial', HIT(record.ventilacionItem,4,'Ventilación superficial','Ventilacion superficial'), '4')}
                ${Opt('Apnea',                   HIT(record.ventilacionItem,5,'Apnea'), '5')}
              </div>
            </div>

            <div class="group">
              <div class="subhead">Vía aérea</div>
              <div class="optsV">
                ${Opt('Permeable',    HIT(record.viaAereaItem,1,'Permeable'), '1')}
                ${Opt('Comprometida', HIT(record.viaAereaItem,2,'Comprometida'), '2')}
              </div>
            </div>
          </div>

          <!-- Col 3: Ruidos respiratorios + Características (debajo) -->
          <div>
            <div class="group">
              <div class="subhead">Ruidos respiratorios</div>
              <div class="optsV">
                ${Opt('Normales',    HIT(record.ruidosRespItem,1,'Ruidos respiratorios normales','Normales'), '1')}
                ${Opt('Disminuidos', HIT(record.ruidosRespItem,2,'Ruidos respiratorios disminuidos','Disminuidos'), '2')}
                ${Opt('Ausentes',    HIT(record.ruidosRespItem,3,'Ruidos respiratorios ausentes','Ausentes'), '3')}
              </div>
            </div>

            <div class="group">
              <div class="subhead">Características</div>
              <div class="optsV">
                ${Opt('Eutérmica', HIT(record.caracterItem,1,'Eutérmica','Eutermica'), '1')}
                ${Opt('Caliente',  HIT(record.caracterItem,2,'Caliente'), '2')}
                ${Opt('Fría',      HIT(record.caracterItem,3,'Fría','Fria'), '3')}
                ${Opt('Diaforesis',HIT(record.caracterItem,4,'Diaforesis'), '4')}
              </div>
            </div>
          </div>

          <!-- Col 4: Reflejo de deglución + Lado + Sitio -->
          <div>
            <div class="group">
              <div class="subhead">Reflejo de deglución</div>
              <div class="optsV">
                ${Opt('Ausente',  HIT(record.reflejoDegItem,1,'Ausente'), '1')}
                ${Opt('Presente', HIT(record.reflejoDegItem,2,'Presente'), '2')}
              </div>
            </div>

            <div class="group">
              <div class="subhead">Lado</div>
              <div class="optsV">
                ${Opt('Derecho',   HIT(record.pulmLadoItem,1,'Derecho'), '1')}
                ${Opt('Izquierdo', HIT(record.pulmLadoItem,2,'Izquierdo'), '2')}
              </div>
            </div>

            <div class="group">
              <div class="subhead">Sitio</div>
              <div class="optsV">
                ${Opt('Apical', HIT(record.pulmParteItem,1,'Apical'), '1')}
                ${Opt('Base',   HIT(record.pulmParteItem,2,'Base'), '2')}
              </div>
            </div>
          </div>

          <!-- Col 5: Calidad + Piel -->
          <div>
            <div class="group">
              <div class="subhead">Calidad</div>
              <div class="optsV">
                ${Opt('Rápido',    HIT(record.calidadItem,1,'Rápido','Rapido'), '1')}
                ${Opt('Lento',     HIT(record.calidadItem,2,'Lento'), '2')}
                ${Opt('Rítmico',   HIT(record.calidadItem,3,'Rítmico','Ritmico'), '3')}
                ${Opt('Arrítmico', HIT(record.calidadItem,4,'Arrítmico','Arritmico'), '4')}
              </div>
            </div>

            <div class="group">
              <div class="subhead">Piel</div>
              <div class="optsV">
                ${Opt('Normal',    HIT(record.pielItem,1,'Normal'), '1')}
                ${Opt('Pálida',    HIT(record.pielItem,2,'Pálida','Palida'), '2')}
                ${Opt('Cianótica', HIT(record.pielItem,3,'Cianótica','Cianotica'), '3')}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
<!-- EXPLORACIÓN FÍSICA -->
<div class="box phys">
  <div class="head">EXPLORACIÓN FÍSICA</div>
  <div class="body">
    ${(() => {
      // preparar datos EF
      const inj = parseInjuries(record.injuries || record.injuryMarks || '');
      const EFSET = getEfSet(record);
      const isOn = (n, label, abbr) => {
        const norm = s => (s ?? '').toString().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
        const labelPlain = label.replace(/\s*\(.+\)\s*/g,'');
        const paren = (label.match(/\(([^)]+)\)/)?.[1] || '').trim();
        const aliases = [String(n), norm(paren), norm(abbr), norm(label), norm(labelPlain)];
        return aliases.some(a => a && EFSET.has(a));
      };
      const left  = EF_ITEMS.slice(0, 8).map((it, i) => Opt(it[0], isOn(i+1, it[0], it[1]), String(i+1))).join('');
      const right = EF_ITEMS.slice(8).map((it, idx) => {
        const n = idx + 9; return Opt(it[0], isOn(n, it[0], it[1]), String(n));
      }).join('');

      return `
        <div class="grid">
          <div>
            <div class="group">
              <div class="subhead">Exploración física (1–8)</div>
              <div class="optsV">${left}</div>
            </div>
          </div>
          <div>
            <div class="group">
              <div class="subhead">Exploración física (9–15)</div>
              <div class="optsV">${right}</div>
            </div>
          </div>
          <div>
            <div class="bodymap">
              <img class="bm" src=${JSON.stringify(record.bodyImage)} alt="">
              ${extractMarks(record).map(([x,y]) => `<span class="mk" style="left:${x}%;top:${y}%"></span>`).join('')}
            </div>
          </div>
        </div>`;
    })()}

    <!-- SIGNOS VITALES Y MONITOREO -->
    <div class="box vitals">
      <div class="head">Signos vitales y monitoreo</div>
      <div class="body">
        <table class="form vitals">
          <tr>
            <th style="width:9%">Hora</th>
            <th style="width:6%">FR</th>
            <th style="width:6%">FC</th>
            <th style="width:8%">TAS</th>
            <th style="width:8%">TAD</th>
            <th style="width:7%">SaO₂</th>
            <th style="width:7%">Temp</th>
            <th style="width:7%">Gluc</th>
            <th style="width:8%">EKG</th>
            <th colspan="4">Neurológico</th>
          </tr>
          <tr class="avdi">
            <th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>
            <th>A</th><th>V</th><th>D</th><th>I</th>
          </tr>
          ${(() => {
            const rows = parseVitals($vitalsFrom(record));
            const cell = (v) => safe(v) || '';
            const rowHtml = (r) => `
              <tr>
                <td>${cell(r.hour)}</td>
                <td>${cell(r.fr)}</td>
                <td>${cell(r.fc)}</td>
                <td>${cell(r.tas)}</td>
                <td>${cell(r.tad)}</td>
                <td>${cell(r.sao2)}</td>
                <td>${cell(r.temp)}</td>
                <td>${cell(r.gluc)}</td>
                <td>${cell(r.ekg)}</td>
                <td><span class="tcb ${NEU(r.neuro,1)}">${NEU(r.neuro,1)?'✔':''}</span></td>
                <td><span class="tcb ${NEU(r.neuro,2)}">${NEU(r.neuro,2)?'✔':''}</span></td>
                <td><span class="tcb ${NEU(r.neuro,3)}">${NEU(r.neuro,3)?'✔':''}</span></td>
                <td><span class="tcb ${NEU(r.neuro,4)}">${NEU(r.neuro,4)?'✔':''}</span></td>
              </tr>`;
            return [0,1,2].map(i => rowHtml(rows[i] || {})).join('');
          })()}
        </table>
      </div>
    </div>

    <!-- SAMPLE (compacto) -->
    <div class="box sample">
      <div class="head">SAMPLE</div>
      <div class="body">
        <table class="form sample">
          <tr>
            <td colspan="3">
              <div class="label">Signos y síntomas</div>
              <div class="uline">${safe(record.sampleSignsSymptoms)}</div>
            </td>
            <td colspan="2">
              <div class="label">Alergias</div>
              <div class="uline">${safe(record.sampleAllergies)}</div>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <div class="label">Medicamentos</div>
              <div class="uline">${safe(record.sampleMedications)}</div>
            </td>
            <td colspan="2">
              <div class="label">Hora de última ingesta</div>
              <div class="uline">${safe(record.sampleLastIntakeTime)}</div>
            </td>
          </tr>
          <tr>
            <td colspan="5">
              <div class="label">Patologías</div>
              <div class="uline">${safe(record.samplePathologies)}</div>
            </td>
          </tr>
          <tr>
            <td colspan="5">
              <div class="label">Eventos previos relacionados</div>
              <div class="uline">${safe(record.sampleEvents)}</div>
            </td>
          </tr>
        </table>
      </div>
    </div>

</div> <!-- /.body box phys -->
  </div>   <!-- /.box  box phys -->

</div>     <!-- /.frame -->


<!-- ========== PÁGINA 2 ========== -->
<div class="pagebreak"></div>

<div class="frame">
  <div class="box p2">
  <div class="head">ATENCIÓN Y MANEJO</div>
  <div class="body">
    <div class="grid">

      <!-- Col 1: Condición + Triage -->
      <div>
        <div class="group">
          <div class="subhead">Condición del paciente</div>
          <div class="opts2">
            ${Opt('Crítico',    HIT(record.patientCondition||record.condicionPaciente,1,'Crítico','Critico'),'1')}
            ${Opt('No crítico', HIT(record.patientCondition||record.condicionPaciente,2,'No crítico','No critico'),'2')}
          </div>
          <div class="opts2" style="margin-top:2px">
            ${Opt('Estable',    HIT(record.stability||record.estabilidad,1,'Estable'),'1')}
            ${Opt('Inestable',  HIT(record.stability||record.estabilidad,2,'Inestable'),'2')}
          </div>
        </div>

        <div class="group" style="margin-top:8px">
          <div class="subhead">Triage</div>
          <div class="opts2">
            ${Opt('Rojo',     HIT(record.triageColor||record.triage||record.colorTriage,1,'Rojo'),'1')}
            ${Opt('Amarillo', HIT(record.triageColor||record.triage||record.colorTriage,2,'Amarillo'),'2')}
          </div>
          <div class="opts2" style="margin-top:2px">
            ${Opt('Verde',    HIT(record.triageColor||record.triage||record.colorTriage,3,'Verde'),'3')}
            ${Opt('Negra',    HIT(record.triageColor||record.triage||record.colorTriage,4,'Negra','Negro'),'4')}
          </div>
        </div>
      </div>

      <!-- Col 2: Vía aérea -->
      <div>
        <div class="group">
          <div class="subhead">Vía aérea</div>
          <div class="optsV">
            ${Opt('Aspiración',                   HAS(record.airway||record.viaAerea,1,'Aspiración','Aspiracion'),'1')}
            ${Opt('Cánula orofaríngea',           HAS(record.airway||record.viaAerea,2,'Cánula orofaríngea','Canula orofaringea'),'2')}
            ${Opt('Cánula nasofaríngea',          HAS(record.airway||record.viaAerea,3,'Cánula nasofaríngea','Canula nasofaringea'),'3')}
            ${Opt('Intubación endotraqueal',      HAS(record.airway||record.viaAerea,4,'Intubación endotraqueal','Intubacion endotraqueal'),'4')}
            ${Opt('Mascarilla laríngea',          HAS(record.airway||record.viaAerea,5,'Mascarilla laríngea','Mascarilla laringea'),'5')}
            ${Opt('Combitubo',                    HAS(record.airway||record.viaAerea,6,'Combitubo'),'6')}
            ${Opt('Cricotirodotomía por punción', HAS(record.airway||record.viaAerea,7,'Cricotirodotomía por punción','Cricotirodotomia por puncion'),'7')}
          </div>
        </div>
      </div>

      <!-- Col 3: Glasgow + Control cervical -->
      <div>
        <div class="group">
          <div class="subhead">Glasgow</div>
          <div class="nobox" style="max-width:160px">
            <span></span><div class="uline">${safe(record.glasgow || record.escalaGlasgow || '')}</div>
          </div>
        </div>
        <div class="group" style="margin-top:8px">
          <div class="subhead">Control cervical</div>
          <div class="optsV">
            ${Opt('Manual',          HIT(record.cervicalControl||record.controlCervical,1,'Manual'),'1')}
            ${Opt('Collarín rígido', HIT(record.cervicalControl||record.controlCervical,2,'Collarín rígido','Collarin rigido'),'2')}
            ${Opt('Collarín blando', HIT(record.cervicalControl||record.controlCervical,3,'Collarín blando','Collarin blando'),'3')}
          </div>
        </div>
      </div>

      <!-- Col 4: Asistencia ventilatoria + Descompresión pleural bajo "Vol" -->
      <div>
        <div class="group">
          <div class="subhead">Asistencia ventilatoria</div>
          <div class="optsV">
            ${Opt('BVM',                   HIT(record.ventilationAssist||record.asistenciaVentilatoria||record.asistVent,1,'BVM','Bolsa-válvula-mascarilla','Bolsa valvula mascarilla'),'1')}
            ${Opt('Ventilador automático', HIT(record.ventilationAssist||record.asistenciaVentilatoria||record.asistVent,2,'Ventilador automático','Ventilador automatico'),'2')}
          </div>
          <div class="nobox" style="max-width:200px; margin-top:2px">
            <span>Frec</span>
            <div class="uline">${safe(record.ventilationFreq || record.frecuenciaVentilatoria || '')}</div>
          </div>
          <div class="nobox" style="max-width:200px">
            <span>Vol</span>
            <div class="uline">${safe(record.ventilationVol || record.volumenVentilatorio || '')}</div>
          </div>
          <div class="group" style="margin-top:6px">
            <div class="subhead">Descompresión pleural</div>
            <div class="opts2">
              ${Opt('Derecho',   HIT(record.pleuralDecompression||record.decompresionPleural,1,'Derecho'),'1')}
              ${Opt('Izquierdo', HIT(record.pleuralDecompression||record.decompresionPleural,2,'Izquierdo'),'2')}
            </div>
          </div>
        </div>
      </div>

      <!-- Col 5: Oxigenoterapia -->
      <div>
        <div class="group">
          <div class="subhead">Oxigenoterapia</div>
          <div class="optsV">
            ${Opt('Puntas nasales',            HAS(record.oxygenTherapy||record.oxigenoterapia,1,'Puntas nasales'),'1')}
            ${Opt('Mascarilla simple',         HAS(record.oxygenTherapy||record.oxigenoterapia,2,'Mascarilla simple'),'2')}
            ${Opt('Mascarilla con reservorio', HAS(record.oxygenTherapy||record.oxigenoterapia,3,'Mascarilla con reservorio'),'3')}
            ${Opt('Mascarilla venturi',        HAS(record.oxygenTherapy||record.oxigenoterapia,4,'Mascarilla venturi','Venturi'),'4')}
          </div>
          <div class="nobox" style="max-width:220px; margin-top:2px">
            <span>Lts x min</span>
            <div class="uline">${safe(record.oxygenLpm || record.lpm || record.oxigenoLpm || '')}</div>
          </div>
        </div>
      </div>

    </div><!-- /.grid -->
  </div><!-- /.body -->
</div><!-- /.box -->

<div class="box cond">
  <div class="head">CONDICIÓN DEL PACIENTE — MANEJO</div>
  <div class="body">

    <!-- ARRIBA: 5 columnas -->
    <div class="grid-top">
      <!-- Col 1: Hemorragias (1–3) -->
      <div class="group">
        <div class="subhead">Control de hemorragias</div>
        <div class="optsV">
          ${Opt('Presión directa',   HAS(record.hemorrhageControl,1,'Presión directa','Presion directa'),'1')}
          ${Opt('Presión indirecta', HAS(record.hemorrhageControl,2,'Presión indirecta','Presion indirecta'),'2')}
          ${Opt('Gravedad',          HAS(record.hemorrhageControl,3,'Gravedad'),'3')}
        </div>
      </div>

      <!-- Col 2: Hemorragias (4–6) -->
      <div class="group">
        <div class="subhead" style="visibility:hidden">.</div>
        <div class="optsV">
          ${Opt('Vendaje compresivo', HAS(record.hemorrhageControl,4,'Vendaje compresivo'),'4')}
          ${Opt('Crioterapia',        HAS(record.hemorrhageControl,5,'Crioterapia'),'5')}
          ${Opt('Hemostático',        HAS(record.hemorrhageControl,6,'Hemostático','Hemostatico'),'6')}
        </div>
      </div>

      <!-- Col 3: Vías venosas -->
      <div class="group">
        <div class="subhead">Vías venosas</div>
        <div class="optsV">
          <div class="nobox"><span>1 Línea IV #</span><div class="uline">${safe(record.ivLines)}</div></div>
          <div class="nobox"><span>2 Catéter #</span><div class="uline">${safe(record.catheterNum)}</div></div>
          <div class="nobox" style="margin-top:2px"><span>Cantidad</span><div class="uline">${safe(record.solutionAmount)}</div></div>
          <div class="nobox"><span>Infusiones</span><div class="uline">${safe(record.solutionInfusions)}</div></div>
        </div>
      </div>

      <!-- Col 4: Tipo de soluciones (1–3) -->
      <div class="group">
        <div class="subhead">Tipo de soluciones</div>
        <div class="optsV">
          ${Opt('Hartman',     HAS(record.solutionType,1,'Hartman','Hartmann'),'1')}
          ${Opt('NACL 0.9%',   HAS(record.solutionType,2,'NACL 0.9%','NaCl 0.9','Sol CS 0.9%'),'2')}
          ${Opt('Mixta',       HAS(record.solutionType,3,'Mixta'),'3')}
        </div>
      </div>

      <!-- Col 5: Tipo de soluciones (4–5) -->
      <div class="group">
        <div class="subhead" style="visibility:hidden">Tipo de soluciones</div>
        <div class="optsV">
          ${Opt('Glucosa 5%',  HAS(record.solutionType,4,'Glucosa 5%','DX 5%'),'4')}
          ${Opt('Otra',        HAS(record.solutionType,5,'Otra','Otro'),'5')}
        </div>
      </div>
    </div>


    <!-- TABLA: 3 filas fijas -->
    <div class="group" style="margin-top:6px">
      <div class="subhead">Manejo farmacológico y terapia eléctrica</div>
      <table class="form manejo">
        <tr>
          <th>Hora</th><th>Medicamento</th><th>Dosis</th><th>Vía de admin</th><th>Terapia eléctrica</th>
        </tr>
        ${(() => {
        const src = record.pharmaTherapyRows || record.pharma || record.manejoFarm || '';
        const rows = parsePharma(src);

        // ⬇️ Cambia esta línea
        // const cell = v => safe(v) || '';
        const cell = v => (safe(v) ? safe(v) : '&nbsp;');  // ← NBSP mantiene altura

        const rowHtml = r => `
          <tr>
            <td>${cell(r.hour)}</td>
            <td>${cell(r.med)}</td>
            <td>${cell(r.dose)}</td>
            <td>${cell(r.route)}</td>
            <td>${cell(r.electric)}</td>
          </tr>`;
        return [0,1,2].map(i => rowHtml(rows[i] || {})).join('');   // SIEMPRE 3 filas
      })()}


      </table>
    </div>

    <!-- ABAJO: 3 columnas -->
    <div class="grid-bottom" style="margin-top:6px">
      <div class="group">
        <div class="subhead">RCP</div>
        <div class="optsV">
          ${Opt('RCP básica',   HIT(record.rcp,1,'RCP básica','RCP basica','Básica','Basica'),'1')}
          ${Opt('RCP avanzada', HIT(record.rcp,2,'RCP avanzada','Avanzada'),'2')}
        </div>
      </div>

      <div class="group">
        <div class="subhead">Inmovilización</div>
        <div class="optsV">
          ${Opt('Inmovilización de extremidades',
            HAS(record.immobilization,3,'Inmovilización de extremidades','Inmovilizacion de extremidades','Extremidades')
            || IN(record.immobilization,'Sí','Si','True','1'),
          '3')}
          ${Opt('Inmovilización en FEL',
            HAS(record.immobilization,4,'Inmovilización en FEL','Inmovilizacion en FEL','FEL')
            || /(^|[,;|\s])fel($|[,;|\s])/i.test((record.immobilization??'').toString()),
          '4')}
        </div>
      </div>

      <div class="group">
        <div class="subhead">Curación / Vendaje</div>
        <div class="optsV">
          ${Opt('Curación',
            HAS(record.curation,5,'Curación','Curacion') || IN(record.curation,'Sí','Si','True','1'),
          '5')}
          ${Opt('Vendaje',
            HAS(record.bandage,6,'Vendaje') || IN(record.bandage,'Sí','Si','True','1'),
          '6')}
        </div>
      </div>
    </div>

  </div>
</div>

<!-- === BLOQUE BLANCO — DESLINDE / INSTITUCIÓN / FIRMAS === -->
<div class="box waiver">
  <div class="body">
    <table class="form">
      <!-- Institución (arriba) -->
      <tr>
        <td>
          <div class="label">Institución a la que se traslada el paciente</div>
          <div class="uline">${safe(record.institution)}</div>
        </td>
      </tr>

      <!-- Título y texto legal (exacto) -->
      <tr>
        <td>
          <div class="waiver-title">Negativa a recibir atención o ser trasladado (deslinde de responsabilidad)</div>
          <div class="waiver-txt">
            Mediante la presente declaro que no acepto el  tratamiento y/o traslado a un hospital y reconozco que el personal del Centro Universitario de Ciencias
            Exactas e Ingenierías me recomendó lo anterior, por lo que eximo  a dicho personal y a la Universidad de Guadalajara de la de responsabilidad que pudiera
            derivar de haber respetado y cumplido mi decisión
          </div>
        </td>
      </tr>

      <!-- Nombres + Firmas (Paciente / Testigo) con el MISMO diseño que ya usas -->
      <tr>
        <td>
          <div class="grid2" style="margin-top:8px">
            <!-- Paciente (columna izquierda) -->
            <div>
              <div class="nobox">
                <span>Nombre / Firma / Paciente</span>
                <div class="uline">${safe(record.patientName)}</div>
              </div>
              <div class="sigpad small">
                ${record.patientSignatureSvg ? record.patientSignatureSvg : '&nbsp;'}
              </div>
              <div class="sigcap">Firma</div>
            </div>

            <!-- Testigo (columna derecha) -->
            <div>
              <div class="nobox">
                <span>Nombre / Firma / Testigo</span>
                <div class="uline">${safe(record.witnessName)}</div>
              </div>
              <div class="sigpad small">
                ${record.witnessSignatureSvg ? record.witnessSignatureSvg : '&nbsp;'}
              </div>
              <div class="sigcap">Firma</div>
            </div>
          </div>
        </td>
      </tr>

      <!-- Observaciones (abajo) -->
      <tr>
        <td>
          <div class="label">Observaciones</div>
          <div class="uline">${safe(record.observations)}</div>
          <div class="uline">&nbsp;</div>
        </td>
      </tr>
    </table>
  </div>
</div>

<!-- === BLOQUE EN GRIS — DEPENDENCIAS Y PERTENENCIAS (sin título) === -->
<div class="box xfer">
  <div class="body">
    <table class="form">
      <tr>
        <td colspan="2">
          <div class="label">Dependencias públicas que atendieron el incidente</div>
          <div class="uline">${safe(record.dependencies)}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="label">Dependencia</div>
          <div class="uline">${safe(record.dependencies)}</div>
        </td>
      </tr>
      <tr>
        <td style="width:32%">
          <div class="label">Número de unidades</div>
          <div class="uline">${safe(record.units)}</div>
        </td>
        <td>
          <div class="label">Nombre del encargado y/o oficiales</div>
          <div class="uline">${safe(record.officerName)}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="label">Pertenencias</div>
          <div class="uline">${safe(record.belongings)}</div>
          <div class="uline">&nbsp;</div>
          <div class="uline">&nbsp;</div>
        </td>
      </tr>
    </table>

    <div class="sepline"></div>

    <div class="nobox">
      <span>Nombre / Firma / Quien recibe las pertenencias</span>
      <div class="uline">${safe(record.receiver)}</div>
    </div>

    <div class="grid2" style="margin-top:8px">
      <!-- Columna: Entrega paciente -->
      <div>
        <div class="submini">Entrega paciente</div>
        <div class="nobox"><span>Nombre completo</span><div class="uline">${safe(record.patientName)}</div></div>
        <div class="sigpad small">${record.paramedicSignatureSvg ? record.paramedicSignatureSvg : '&nbsp;'}</div>
        <div class="sigcap">Firma</div>
      </div>

      <!-- Columna: Médico que recibe -->
      <div>
        <div class="submini">Médico que recibe</div>
        <div class="nobox"><span>Nombre completo</span><div class="uline">${safe(record.doctorName)}</div></div>
        <div class="sigpad small">${record.doctorSignatureSvg ? record.doctorSignatureSvg : '&nbsp;'}</div>
        <div class="sigcap">Firma</div>
      </div>
    </div>
  </div>
</div>


<!-- === BLOQUE BLANCO — INSUMOS (flujo en columnas para caber en el espacio) === -->
<div class="box supplies">
  <div class="head">Insumos utilizados</div>
  <div class="body">
    <div class="supgrid">
      ${renderSupplies(record)}
    </div>
  </div>
</div>



</div><!-- /.frame -->
<!-- ========== /PÁGINA 2 ========== -->


</body></html>
`;
}

let BODY_DATA_URI = '';

async function ensureBodyImage(prefDataUri = '') {

  if (prefDataUri && prefDataUri.startsWith('data:image')) return prefDataUri;
  if (BODY_DATA_URI) return BODY_DATA_URI;

  try {
    const asset = Asset.fromModule(bodyPng);
    await asset.downloadAsync();
    const local = asset.localUri || asset.uri;
    const b64 = await FileSystem.readAsStringAsync(local, { encoding: FileSystem.EncodingType.Base64 });
    BODY_DATA_URI = `data:image/png;base64,${b64}`;
    return BODY_DATA_URI;
  } catch (e) {
    // fallback: un SVG muy simple para no dejar el cuadro vacío
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400">
      <rect x="1" y="1" width="198" height="398" rx="6" fill="#fff" stroke="#E5E7EB"/>
      <text x="100" y="200" text-anchor="middle" font-size="10" fill="#9CA3AF">body.png</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(fallback)}`;
  }
}

/* ----------- Guardar en Descargas (Android) ----------- */
const ANDROID_DOWNLOADS_URI =
  'content://com.android.externalstorage.documents/document/primary:Download';

async function saveToDownloadsAndroid(tempUri, filename) {
  let perm = await StorageAccessFramework.requestDirectoryPermissionsAsync(ANDROID_DOWNLOADS_URI)
    .catch(() => ({ granted: false }));
  if (!perm?.granted) {
    perm = await StorageAccessFramework.requestDirectoryPermissionsAsync().catch(() => null);
  }
  if (!perm?.granted) {
    const dest = FileSystem.documentDirectory + filename;
    await FileSystem.copyAsync({ from: tempUri, to: dest });
    return dest;
  }
  const base64 = await FileSystem.readAsStringAsync(tempUri, { encoding: FileSystem.EncodingType.Base64 });
  const fileUri = await StorageAccessFramework.createFileAsync(perm.directoryUri, filename, 'application/pdf');
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return fileUri;
}

// API pública 
export async function generateExpedientePdf(recordId) {
  const rec = (await getRecordById(recordId)) || {};
  const pe  = (await getPatientEvaluationById(recordId)) || {};
  const fe  = (await getFirstEvaluationById(recordId)) || {};
  const px  = (await getPhysicalExplorationById(recordId)) || {};
  const pc  = (await getPatientConditionById(recordId)) || {};
  const tr = (await getPatientTransferById(recordId)) || {};
  const pt = (await getPatientTransferById(recordId)) || {};
  

  const bodyImageDataUri = await ensureBodyImage(px.bodyImage || rec.bodyImage || '');

  

  // maapea columnas de patient_evaluations nombres que usa HTML
  // Utilidades
const pick = v => (v ?? '').toString().trim();
const nonEmpty = v => {
  if (v == null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
};

// 1) Trae desde las tablas dedicadas
const vsRows = await getVitalSignsByRecordId(recordId);      // vital_signs
const sampleRow = await getSampleNotesById(recordId);        // sample_notes

// Objeto plano para el template
//const suppliesQty = Object.fromEntries(SUPPLIES_MAP);

// Normaliza los vitales de la tabla a lo que parseVitals capta
const VITALS_DB = Array.isArray(vsRows) && vsRows.length
  ? { rows: vsRows
        .sort((a,b)=> (a.rowIndex??0) - (b.rowIndex??0))
        .slice(0,3) // mostramos hasta 3 filas
        .map(({hour, fr, fc, tas, tad, sao2, temp, gluc, ekg, neuro}) => ({
          hour: pick(hour), fr: pick(fr), fc: pick(fc),
          tas: pick(tas), tad: pick(tad), sao2: pick(sao2),
          temp: pick(temp), gluc: pick(gluc), ekg: pick(ekg), neuro: pick(neuro),
        }))
    }
  : '';

// SAMPLE directo de sample_notes (nota: meds / relatedEvents)
const SAMPLE_DB = sampleRow ? {
  signsSymptoms:  pick(sampleRow.signsSymptoms),
  allergies:      pick(sampleRow.allergies),
  medications:    pick(sampleRow.meds),            // <-- columna "meds"
  pathologies:    pick(sampleRow.pathologies),
  lastIntakeTime: pick(sampleRow.lastIntakeTime),
  events:         pick(sampleRow.relatedEvents),   // <-- columna "relatedEvents"
} : null;

// 2) Mantiene compatibilidad con los campos  en pe/fe/rec
function normalizeIndexedVitals(obj = {}) {
  const out = {...obj};
  const entries = Object.entries(obj);
  const MAP = [
    { re:/^(hour|hora|time|t)[\s_]?(\d)$/i,         mk:(i)=>'hour'+i },
    { re:/^(fr|fresp|frecuenciarespiratoria)[\s_]?(\d)$/i, mk:(i)=>'fr'+i },
    { re:/^(fc|fcard|frecuenciacardiaca)[\s_]?(\d)$/i,     mk:(i)=>'fc'+i },
    { re:/^(tas|ta[\s_]?s|pa[\s_]?sistolica|tension[\s_]?sistolica)[\s_]?(\d)$/i, mk:(i)=>'tas'+i },
    { re:/^(tad|ta[\s_]?d|pa[\s_]?diastolica|tension[\s_]?diastolica)[\s_]?(\d)$/i, mk:(i)=>'tad'+i },
    { re:/^(sao2|spo2|sat[\s_]?o2|sat)[\s_]?(\d)$/i, mk:(i)=>'sao2'+i },
    { re:/^(temp|temperatura)[\s_]?(\d)$/i,         mk:(i)=>'temp'+i },
    { re:/^(gluc|glucosa|bg)[\s_]?(\d)$/i,          mk:(i)=>'gluc'+i },
    { re:/^(ekg|ecg)[\s_]?(\d)$/i,                  mk:(i)=>'ekg'+i },
    { re:/^(neuro|neurologico|avdi)[\s_]?(\d)$/i,   mk:(i)=>'neuro'+i },
  ];
  for (const [k,v] of entries) {
    for (const {re,mk} of MAP) {
      const m = k.match(re);
      if (m) { const alias = mk(m[2]); if (out[alias] === undefined) out[alias] = v; }
    }
  }
  return out;
}
function buildVitalsFallback(...cands) {
  for (const c of cands) {
    if (!c) continue;
    const n = normalizeIndexedVitals(c);
    if (['hour1','fr1','fc1','tas1','tad1','sao21','temp1','gluc1','ekg1','neuro1'].some(k => nonEmpty(n[k])))
      return n;
  }
  return '';
}
function buildSample(pe, fe, rec) {
  const sblk = pe?.sample ?? fe?.sample ?? rec?.sample ?? {};
  const fromBlock = {
    signsSymptoms:  pick(sblk.S ?? sblk.s ?? sblk.signsSymptoms ?? sblk.signos ?? sblk.signosSintomas ?? ''),
    allergies:      pick(sblk.A ?? sblk.a ?? sblk.allergies ?? sblk.alergias ?? ''),
    medications:    pick(sblk.M ?? sblk.m ?? sblk.medications ?? sblk.medicamentos ?? ''),
    pathologies:    pick(sblk.P ?? sblk.p ?? sblk.pathologies ?? sblk.patologias ?? sblk.padecimientos ?? ''),
    lastIntakeTime: pick(sblk.L ?? sblk.l ?? sblk.lastIntakeTime ?? sblk.ultimaIngesta ?? sblk.lastMeal ?? ''),
    events:         pick(sblk.E ?? sblk.e ?? sblk.events ?? sblk.eventos ?? sblk.eventsRelated ?? ''),
  };
  return {
    signsSymptoms:  pick(pe?.sampleSignsSymptoms ?? pe?.signsSymptoms ?? fromBlock.signsSymptoms ??
                         fe?.sampleSignsSymptoms ?? fe?.signsSymptoms ??
                         rec?.sampleSignsSymptoms ?? rec?.signsSymptoms ?? ''),
    allergies:      pick(pe?.sampleAllergies ?? pe?.allergies ?? fromBlock.allergies ??
                         fe?.sampleAllergies ?? fe?.allergies ??
                         rec?.sampleAllergies ?? rec?.allergies ?? ''),
    medications:    pick(pe?.sampleMedications ?? pe?.medications ?? pe?.medicamentos ?? fromBlock.medications ??
                         fe?.sampleMedications ?? fe?.medications ??
                         rec?.sampleMedications ?? rec?.medications ?? rec?.medicamentos ?? ''),
    pathologies:    pick(pe?.samplePathologies ?? pe?.pathologies ?? pe?.padecimientos ?? fromBlock.pathologies ??
                         fe?.samplePathologies ?? fe?.pathologies ??
                         rec?.samplePathologies ?? rec?.pathologies ?? rec?.padecimientos ?? ''),
    lastIntakeTime: pick(pe?.sampleLastIntakeTime ?? pe?.lastIntake ?? pe?.horaUltimaIngesta ?? fromBlock.lastIntakeTime ??
                         fe?.sampleLastIntakeTime ?? fe?.lastIntake ??
                         rec?.sampleLastIntakeTime ?? rec?.lastIntake ?? rec?.horaUltimaIngesta ?? ''),
    events:         pick(pe?.sampleEvents ?? pe?.eventsRelated ?? fromBlock.events ??
                         fe?.sampleEvents ?? fe?.eventsRelated ??
                         rec?.sampleEvents ?? rec?.eventsRelated ?? ''),
  };
}

// 3) Selecciona fuente final (prioriza tablas dedicadas)
let VITALS = VITALS_DB;
if (!nonEmpty(VITALS)) {
  VITALS =
    pe?.vitals ?? pe?.signosVitales ?? pe?.vitalSigns ?? pe?.monitoring ??
    fe?.vitals ?? fe?.signosVitales ?? fe?.vitalSigns ?? fe?.monitoring ??
    rec?.vitals ?? rec?.signosVitales ?? rec?.vitalSigns ?? rec?.monitoring ?? '';
}
if (!nonEmpty(VITALS)) VITALS = buildVitalsFallback(pe, fe, rec);

// SAMPLE: prioriza sample_notes; si vacío, usa compatibilidad
const SAMPLE = (SAMPLE_DB && Object.values(SAMPLE_DB).some(nonEmpty))
  ? SAMPLE_DB
  : buildSample(pe, fe, rec);

  
console.log('VITALS fuente →', Array.isArray(VITALS?.rows) ? `rows:${VITALS.rows.length}` : typeof VITALS);
console.log('SAMPLE (norm) →', SAMPLE);

// Segunda pagina

// devuelve el primer candidato no null/undefined/'' sin convertirlo a string
const rawFirst = (...cands) => {
  for (const v of cands) {
    if (v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '')) return v;
  }
  return '';
};
// ----- Insumos (simple) -----
// ---- Normalizador y mapas para resolver nombre -> índice (1..N)
const canon = s => (s ?? "")
  .toString()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // sin acentos
  .toLowerCase()
  .replace(/[%/._\-]+/g, " ")     // separadores % / . _ -
  .replace(/\b09\b/g, "0 9")      // 09 -> 0 9 (para 0.9%)
  .replace(/\bn95\b/g, "n 95")    // n95 -> n 95 (para N-95)
  .replace(/\s+/g, " ")
  .trim();

const INDEX_BY_CANON = new Map(SUPPLY_LABELS.map((name,i)=>[canon(name), i+1]));

// Casos especiales que vienen pegados en la BD
const KEY_ALIASES = {
  guantes_desechablespares: "Guantes desechables/pares",
  guantes_esterilespares:   "Guantes estériles/pares",
};

// ---- Construcción robusta de suppliesQty (objeto { índice: cantidad })
const suppliesQty = {};
let raw;
try { raw = await getDeployedResourcesByRecordId?.(recordId); } catch {}
if (!raw) {
  try { raw = await getDeployedResources?.(recordId); } catch {}
}
console.log("DeployedResources raw →", raw);

// a) Si viene como OBJETO tipo { clave_snake: qty, ... }
if (raw && typeof raw === "object" && !Array.isArray(raw)) {
  for (const [k, v] of Object.entries(raw)) {
    if (k === "recordId") continue;
    const qty = Number(v);
    if (!(qty > 0)) continue;
    const keyCanon = canon(KEY_ALIASES[k] || k);
    const idx = INDEX_BY_CANON.get(keyCanon);
    if (idx) suppliesQty[idx] = (suppliesQty[idx] || 0) + qty;
    else console.log("INSUMO SIN MATCH →", k, "→", keyCanon);
  }
// b) Si viniera como ARREGLO de filas
} else if (Array.isArray(raw)) {
  raw.forEach(r => {
    const label = r.label ?? r.name ?? r.insumo ?? r.recurso ?? r.resource;
    const idBD  = r.resourceId ?? r.resource_id ?? r.id;
    const qty   = Number(r.qty ?? r.quantity ?? r.cantidad ?? r.value ?? r.q ?? r.amount);
    if (!(qty > 0)) return;

    let idx = INDEX_BY_CANON.get(canon(label));
    if (!idx && Number.isFinite(+idBD) && +idBD >= 1 && +idBD <= SUPPLY_LABELS.length) idx = +idBD;
    if (idx) suppliesQty[idx] = (suppliesQty[idx] || 0) + qty;
    else console.log("INSUMO SIN MATCH (array) →", { idBD, label, qty });
  });
}

// c) Fallback a datos embebidos en el record si BD vino vacía
if (!Object.keys(suppliesQty).length) {
  const candidates = [rec.deployedResources, rec.supplies, rec.insumos, rec.resourcesUsed];
  for (const src of candidates) {
    if (!src) continue;
    if (typeof src === "object" && !Array.isArray(src)) {
      for (const [k,v] of Object.entries(src)) {
        const qty = Number(typeof v === "object" ? (v.qty ?? v.cantidad ?? v.value ?? v.q) : v);
        if (!(qty > 0)) continue;
        const idx = /^\d+$/.test(k) ? +k : INDEX_BY_CANON.get(canon(k));
        if (idx) suppliesQty[idx] = (suppliesQty[idx] || 0) + qty;
      }
    } else if (Array.isArray(src)) {
      src.forEach(it => {
        const qty = Number(it?.qty ?? it?.cantidad ?? it?.value ?? it?.q);
        if (!(qty > 0)) return;
        const idx = INDEX_BY_CANON.get(canon(it?.label ?? it?.name ?? it?.insumo ?? it?.resource ?? it?.item));
        if (idx) suppliesQty[idx] = (suppliesQty[idx] || 0) + qty;
      });
    } else if (typeof src === "string") {
      const s = src.trim(); if (!s) continue;
      try {
        const j = JSON.parse(s);
        candidates.push(j); // reinyecta y que lo procese alguna rama
      } catch {
        s.split(/[,\n;]+/).forEach(tok=>{
          const [k,v] = tok.split(/[:=]/).map(t=>t?.trim());
          const qty = Number(v ?? 1);
          if (!(qty > 0)) return;
          const idx = /^\d+$/.test(k) ? +k : INDEX_BY_CANON.get(canon(k));
          if (idx) suppliesQty[idx] = (suppliesQty[idx] || 0) + qty;
        });
      }
    }
  }
}
console.log("suppliesQty (final) →", suppliesQty);


console.log('suppliesQty calculado →', suppliesQty);            // ← LOG 2




  const merged = {
    ...rec,

    // ---- Causa traumática / mecanismo / clínica
    traumaAgent:        pick(pe.traumaCause),
    traumaAgentOther:   pick(pe.otherTraumaCause),
    mechanism:          pick(pe.injuryMechanism),
    clinicalCause:      pick(pe.clinicalCause),
    clinicalOther12:    pick(pe.otherClinicalCause),
    clinicalOther:      pick(pe.specificCause),

    // ---- Parto
    birthProduct:       pick(pe.deliveryProduct),
    product:            pick(pe.deliveryProduct),   
    producto:           pick(pe.deliveryProduct),   
    newbornSex:         pick(pe.deliverySex),
    apgar1:             pick(pe.apgarMinute1),
    apgar5:             pick(pe.apgarMinute5),
    apgar10:            pick(pe.apgarMinute10),
    gesta:              pick(pe.gesta),
    para:               pick(pe.para),
    cesarea:            pick(pe.cesarean),
    'cesárea':          pick(pe.cesarean),
    aborto:             pick(pe.abortion),
    fum:                pick(pe.lastCycleDate),
    fechaUltimaMenstruacion: pick(pe.lastCycleDate),
    fpp:                pick(pe.birthDate),
    fechaProbableParto: pick(pe.birthDate),

    // ---- Selecciones de la tabla APGAR (0/1/2)
    paramColoracion:           pick(pe.paramColoracion),
    paramFrecuenciaCardiaca:   pick(pe.paramFrecuenciaCardiaca),
    paramTonoMuscular:         pick(pe.paramTonoMuscular),
    paramRespuestaEstimulos:   pick(pe.paramRespuestaEstimulos),
    paramEsfuerzoRespiratorio: pick(pe.paramEsfuerzoRespiratorio),

        // ---- First evaluation (bloque de la foto)
    evalInicial:       pick(fe.evaluationItem),
    ventilacionItem:   pick(fe.ventilationItem),
    circulacionItem:   pick(fe.circulationItem),
    viaAereaItem:      pick(fe.airRouteItem),
    reflejoDegItem:    pick(fe.swallowingReflexItem),
    ruidosRespItem:    pick(fe.respSoundsItem),
    pulmLadoItem:      pick(fe.lungSideItem),
    pulmParteItem:     pick(fe.lungPartItem),
    calidadItem:       pick(fe.qualityItem),
    pielItem:          pick(fe.skinItem),
    caracterItem:      pick(fe.characteristicsItem),

    // ====== Exploración física (tabla physical_explorations)
    injuries:     pick(px.injuries),      // puede ser JSON o CSV
    pupils:       pick(px.pupils || ''),  // si tu UI guarda pupilas aparte; si no, puede ir dentro del JSON de injuries
    bodyImage:    pick(px.bodyImage || rec.bodyImage || ''), // data:image/png;base64,... (opcional)

    bodyImage: bodyImageDataUri,

    injuries: (px.injuries ?? px.injuryMarks ?? ''),

  bodyImage: bodyImageDataUri,

  efTokens: (px.efTokens ?? px.exploracionFisica ?? px.exploration ?? px.physicalExploration ?? ''),

      // ---- Signos vitales (Array/Objeto/String/JSON)
    vitals:        VITALS,
    signosVitales: VITALS,
    vitalSigns:    VITALS,
    monitoring:    VITALS,

    // ====== SAMPLE (todas las variantes) ======
    sampleSignsSymptoms:  pick(SAMPLE.signsSymptoms),
    sampleAllergies:      pick(SAMPLE.allergies),
    sampleMedications:    pick(SAMPLE.medications),
    samplePathologies:    pick(SAMPLE.pathologies),
    sampleLastIntakeTime: pick(SAMPLE.lastIntakeTime),
    sampleEvents:         pick(SAMPLE.events),

    // ===== Página 2: Condición / Triage / Vía aérea / Ventilación / Oxígeno =====
    patientCondition: pick(
      pc.criticality, pc.condicionPaciente,
      pe.patientCondition, pe.condicionPaciente,
      fe.patientCondition, fe.condicionPaciente,
      rec.patientCondition, rec.condicionPaciente, ''
    ),

    stability: pick(
      pc.stability, pc.estabilidad,
      pe.stability, pe.estabilidad,
      fe.stability, fe.estabilidad,
      rec.stability, rec.estabilidad, ''
    ),

    triageColor: pick(
      pc.patientColor, pc.triage, pc.colorTriage,
      pe.triageColor, pe.triage, pe.colorTriage,
      fe.triageColor, fe.triage, fe.colorTriage,
      rec.triageColor, rec.triage, rec.colorTriage, ''
    ),

    glasgow: pick(
      pc.glasgow, pc.escalaGlasgow,
      pe.glasgow, pe.escalaGlasgow,
      fe.glasgow, fe.escalaGlasgow,
      rec.glasgow, rec.escalaGlasgow, ''
    ),

    airway: rawFirst(
      pc.airway, pc.viaAerea,
      pe.airway, pe.viaAerea,
      fe.airway, fe.viaAerea,
      rec.airway, rec.viaAerea, ''
    ),

    cervicalControl: pick(
      pc.cervical, pc.controlCervical,
      pe.cervicalControl, pe.controlCervical,
      fe.cervicalControl, fe.controlCervical,
      rec.cervicalControl, rec.controlCervical, ''
    ),

    ventilationAssist: pick(
      pc.ventilatoryHelp, pc.asistenciaVentilatoria, pc.asistVent,
      pe.ventilationAssist, pe.asistenciaVentilatoria, pe.asistVent,
      fe.ventilationAssist, fe.asistenciaVentilatoria, fe.asistVent,
      rec.ventilationAssist, rec.asistenciaVentilatoria, rec.asistVent, ''
    ),

    ventilationFreq: pick(
      pc.ventFrequency, pc.frecuenciaVentilatoria,
      pe.ventilationFreq, pe.frecuenciaVentilatoria,
      fe.ventilationFreq, fe.frecuenciaVentilatoria,
      rec.ventilationFreq, rec.frecuenciaVentilatoria, ''
    ),

    ventilationVol: pick(
      pc.ventVolume, pc.volumenVentilatorio,
      pe.ventilationVol, pe.volumenVentilatorio,
      fe.ventilationVol, fe.volumenVentilatorio,
      rec.ventilationVol, rec.volumenVentilatorio, ''
    ),

    oxygenTherapy: rawFirst(
      pc.oxygenTherapy, pc.oxigenoterapia,
      pe.oxygenTherapy, pe.oxigenoterapia,
      fe.oxygenTherapy, fe.oxigenoterapia,
      rec.oxygenTherapy, rec.oxigenoterapia, ''
    ),

    oxygenLpm: pick(
      pc.oxygenLpm, pc.lpm, pc.oxigenoLpm,
      pe.oxygenLpm, pe.lpm, pe.oxigenoLpm,
      fe.oxygenLpm, fe.lpm, fe.oxigenoLpm,
      rec.oxygenLpm, rec.lpm, rec.oxigenoLpm, ''
    ),

    // Si en patient_conditions no hubo descompresión, queda vacío.
    pleuralDecompression: pleuralFromPatientCond(pc) || pick(
      pe.pleuralDecompression, pe.decompresionPleural,
      fe.pleuralDecompression, fe.decompresionPleural,
      rec.pleuralDecompression, rec.decompresionPleural, ''
    ),

          // --- Condición del paciente — manejo (patient_conditions)
          hemorrhageControl: rawFirst(pc.hemorrhageCtrl, rec.hemorrhageCtrl, ''),
          ivLines:           pick(pc.ivLines || pc.lineaIv || ''),
          catheterNum:       pick(pc.catheterNum || pc.cateterNum || pc.cateter || ''),
          solutionType:      rawFirst(pc.solutionType, pc.tipoSoluciones, ''),
          solutionAmount:    pick(pc.solutionAmount || pc.cantidad || ''),
          solutionInfusions: pick(pc.solutionInfusions || pc.infusiones || ''),
          pharmaTherapyRows: rawFirst(pc.pharmaTherapyRows, rec.pharmaTherapyRows, ''),
          rcp:               pick(pc.rcp || rec.rcp || ''),
          immobilization:    rawFirst(pc.immobilization, pc.inmovilizacion, ''),
          curation:          pick(pc.curation || pc.curacion || ''),
          bandage:           pick(pc.bandage || pc.vendaje || ''),
          pharmaTime:        pick(pc.time || rec.time || ''),  

          bodyImage: bodyImageDataUri,

          //transfer_from:    safe(tr.fromLocation),
          transfer_to:      safe(tr.toLocation),
          transfer_reason:  safe(tr.reason),
          transfer_institution: safe(tr.institution),
          observations:     safe(tr.observations ?? rec.observations ?? ''),
          patientName:      safe(tr.patientName ?? rec.patientName ?? ''),

          witnessName:      safe(tr.witnessName || ''),

          // Firmas en SVG (se incrustan sin tocar):
          patientSignatureSvg:  (tr.patientSignatureSvg   ?? ''),
          witnessSignatureSvg:  (tr.witnessSignatureSvg   ?? ''),

          dependencies:          safe(pt.dependencies ?? rec.dependencies ?? ''),
          units:                 safe(pt.units ?? rec.units ?? ''),
          officerName:           safe(pt.officerName ?? rec.officerName ?? ''),
          belongings:            safe(pt.belongings ?? rec.belongings ?? ''),
          receiver:              safe(pt.receiver ?? rec.receiver ?? ''),
          patientName:           safe(pt.patientName ?? rec.patientName ?? ''),
          doctorName:            safe(pt.doctorName ?? rec.doctorName ?? ''),
          // firmas (reutilizamos las SVG ya guardadas)
          paramedicSignatureSvg:   pt.paramedicSignatureSvg ?? rec.paramedicSignatureSvg ?? '',
          doctorSignatureSvg:    pt.doctorSignatureSvg ?? rec.doctorSignatureSvg ?? '',


          suppliesQty,



      

  };
console.log('APGAR DB →', {
  coloracion: pe.paramColoracion,
  fc: pe.paramFrecuenciaCardiaca,
  tono: pe.paramTonoMuscular,
  resp: pe.paramRespuestaEstimulos,
  esf: pe.paramEsfuerzoRespiratorio,

  
});

console.log('BODY IMG →', (merged.bodyImage || '').slice(0, 30));

console.log('EF TOKENS RAW →', px.efTokens ?? px.exploracionFisica ?? px.exploration ?? px.physicalExploration);
console.log('INJURIES RAW →', px.injuries ?? px.injuryMarks);

console.log('VITALS (raw) →', VITALS);
console.log('SAMPLE (raw) →', SAMPLE);
  const html = makeTopHTML(merged);

  // OFICIO: 8.5" x 13" -> 612 x 936 pt
  const width = 8.5 * 72;
  const height = 13 * 72;

  const { uri: tempUri } = await Print.printToFileAsync({ html, width, height });
  const filename = `Expediente_${recordId}_top_${new Date().toISOString().slice(0,10)}.pdf`;

  if (Platform.OS === 'android') {
    const finalUri = await saveToDownloadsAndroid(tempUri, filename);
    return finalUri;
  } else {
    try {
      await Sharing.shareAsync(tempUri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Compartir expediente',
      });
    } catch {}
    return tempUri;
  }
}
function pleuralFromPatientCond(pc){
      const dec = (pc?.decompression ?? '').toString().trim();
      if (!dec || /^0|no|false$/i.test(dec)) return '';     // no hubo descompresión
      const s = (pc?.side ?? '').toString().toLowerCase().trim();
      if (/^(1|der|derecho)/.test(s)) return '1';
      if (/^(2|izq|izquier)/.test(s)) return '2';
      return ''; // lado desconocido
    }
// Acepta únicamente data-URI válidas para imágenes
const ensureImage = (u='') => {
  const s = (u ?? '').toString().trim();
  return s.startsWith('data:image') ? s : '';
};
// alias

// normalizador básico para comparar etiquetas
const _norm = s => (s ?? '').toString()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

// Dado un "source" heterogéneo, intenta leer la cantidad de un ítem por índice/etiqueta
function _qtyFromSource(src, idx, label){
  if (!src && src !== 0) return 0;

  // si viene como string, intenta parsear JSON
  if (typeof src === 'string'){
    const t = src.trim(); if (!t) return 0;
    try { return _qtyFromSource(JSON.parse(t), idx, label); } catch { return 0; }
  }

  // si viene como número
  if (typeof src === 'number') return src;

  // si viene como array de objetos/pares
  if (Array.isArray(src)){
    for (const it of src){
      if (it == null) continue;
      // soporta varios nombres de campos
      const id = it.id ?? it.num ?? it.index ?? it.key;
      const lab = it.label ?? it.name ?? it.item ?? it.insumo;
      const q   = it.qty ?? it.q ?? it.amount ?? it.cantidad ?? it.cant;
      if (id != null && Number(id) === idx && q != null) return Number(q) || 0;
      if (lab && _norm(lab) === _norm(label) && q != null) return Number(q) || 0;
      // también soporta formato {label: 'X', value: 2}
      if (lab && (it.value != null) && _norm(lab) === _norm(label)) return Number(it.value) || 0;
      // formato plano [ { '91': 2 } ]
      if (typeof it === 'object'){
        if (it[idx] != null) return Number(it[idx]) || 0;
        const key = Object.keys(it).find(k => _norm(k) === _norm(label));
        if (key) return Number(it[key]) || 0;
      }
    }
    return 0;
  }

  // si viene como objeto { 1:2, "Agua inyectable 500 ml": 1, ... }
  if (typeof src === 'object'){
    // por índice
    if (src[idx] != null){
      const v = src[idx];
      if (typeof v === 'object') return Number(v.qty ?? v.q ?? v.cantidad ?? v.amount ?? 0) || 0;
      return Number(v) || 0;
    }
    // por etiqueta
    const k = Object.keys(src).find(k => _norm(k) === _norm(label));
    if (k){
      const v = src[k];
      if (typeof v === 'object') return Number(v.qty ?? v.q ?? v.cantidad ?? v.amount ?? 0) || 0;
      return Number(v) || 0;
    }
  }

  return 0;
}

// Busca en múltiples campos posibles del record
function getSupplyQty(record, idx, label){
  const sources = [
    record.deployedResources, record.supplies, record.insumos,
    record.resources, record.materialUsed, record.resourcesUsed,
    record.insumosUsados, record.material, record.materiales
  ];
  for (const s of sources){
    const q = _qtyFromSource(s, idx, label);
    if (q) return q;           // sólo pinta si hay cantidad > 0
  }
  return '';                    // vacío si 0/ausente
}

// Genera las filas para la tabla (usa tu DEPLOYED_RESOURCE_LABELS)
function renderSupplyRows(record){
  return SUPPLY_LABELS.map((name, i) => {
    const idx = i + 1;
    const qty = getSupplyQty(record, idx, name);
    return `
      <tr>
        <td class="numcol">${idx}</td>
        <td class="namecol">${name}</td>
        <td class="qtycol">${qty !== '' ? qty : ''}</td>
      </tr>`;
  }).join('');
}


// ===== Insumos: lista segura =====
// Si tienes la lista en otro archivo y la importas, bastaría con:
//   import { DEPLOYED_RESOURCE_LABELS } from '...';
// y puedes dejar SUPPLY_LABELS = DEPLOYED_RESOURCE_LABELS;
// Aquí lo hacemos tolerante: usa la global si existe; si no, usa fallback local.
// ===== Insumos: lista (local/backup) =====
/* ====== INSUMOS: catálogo + helpers robustos ====== */

// 2.1 Catálogo (usa el global si existe; si no, fallback local)
const SUPPLY_LABELS = Array.isArray(globalThis.DEPLOYED_RESOURCE_LABELS)
  ? globalThis.DEPLOYED_RESOURCE_LABELS
  : [
    // ——— Material y consumibles
    'Agua inyectable 500 ml','Agua oxigenada','Agujas 20x32','Algodón paquete','Bata desechable',
    'Bolsa negra','Bolsa roja','Bolsa amarilla','Burn free gel','Campos estériles',
    'Cánula blanda de aspiración','Cánulas nasofaríngeas','Cánulas orofaríngeas','Cánula yankawer',
    'Catéter #12','Catéter #14','Catéter #16','Catéter #18','Catéter #20','Catéter #22','Catéter #24',
    'Cinta Transpore 3m 1”','Cinta Transpore 3m 2”',
    'Collarines desechables','Cubrebocas','Desinfectante p/ manos','Desinfectante p/ superficies',
    'Fijador de TE adulto','Fijador de TE pediátrico','Gasas estériles','Gasas no estériles',
    'Guantes estériles/pares','Guantes desechables/pares','Hojas de bisturí #20','Jalea hidrosoluble',
    'Jeringa 1 ml','Jeringa 3 ml','Jeringa 5 ml','Jeringa 10 ml','Jeringa 20 ml','Jeringa asepto',
    'Lentes de protección','Lancetas p/glucómetro','Ligadura umbilical','Manguera p/aspirador','Tegaderm',
    'Mascarilla laríngea','Mascarilla Hudson','Mascarilla N-95','Mascarilla O2 adulto','Mascarilla O2 ped.',
    'Microgoteros','Normogoteros','Perilla','Pañales adulto','Puntas nasales adulto','Rastrillos',
    'Sábanas quirúrgicas','Sábanas térmicas','Sábanas desechables',
    'Sol CS 0.9% 1000 ml','Sol CS 0.9% 500 ml','Sol CS 0.9% 250 ml',
    'Sol HL 1000 ml','Sol HL 500 ml','Sol HL 250 ml',
    'Sol DX 1000 ml','Sol DX 500 ml','Sol DX 250 ml','Sol DX 50 ml',
    'Sol Gelafundin 500 ml','Sol Isodine 500 ml','Sol jabón quir. 500 ml',
    'Tiras reactivas','Torundero con alcohol','Torundero seco','Tubos endotraqueales',
    'Venda #5','Venda #10','Venda #15','Venda #20','Venda #30',
    'Electrodos adulto','Electrodos pediátrico','Gel conductivo','Quick clot',
    // ——— Medicamentos
    'Adrenalina 1 mg Amp','Agua inyectable Amp','Aspirina 100 mg Tab caja','Aspirina 500 mg Tab caja',
    'Avapena 1 mg Amp','Avapena 20 mg Amp','Butilhioscina 20 mg Amp','Captopril 25 mg Tab Amp',
    'Clorfenamina 10 mg Amp','Clorfenamina 500 mg Tab Amp','Cloruro de sodio 0.9% Amp',
    'Clonixinato 1 mg Amp','Dextrosa 0.5/2.5 mg Amp','Dexametasona 8 mg Amp','Diazepam 10 mg Amp',
    'Diclofenaco 75 mg Amp','Dx L 50% de 50 ml','Electrolitos orales','Fenitoína sódica','Flixotide Sol',
    'Furosemida 20 mg Amp','Hidrocortisona 100 mg Amp','Hidrocortisona 500 mg Amp','Isosorbide 5 mg',
    'Isosorbida Dinitrato Spray','Ketorolaco 30 mg Amp','Meclixina/piridoxina/lido Amp','Metamizol Sódico 1 gr Amp',
    'Metoclopramida 10 mg Amp','Midazolam 15 mg Amp','Omeprazol 40 mg Amp','Oxitocina Sui Amp','Panclasa 40 mg Amp',
    'Paracetamol Gotas','Paracetamol 500 mg Tab','Salbutamol  5 mg','Salbutamol aerosol','Sulfato de magnesio 1 gr',
    'Trinitrato de glicerilo Perlas','Hidralazina','Fitomenadiona',
  ];

// 2.2 Normalizadores y mapas nombre↔id
const _n = s => (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const NAME_TO_ID = new Map(SUPPLY_LABELS.map((name,i)=>[_n(name), i+1]));
const idFromLabel = (label) => NAME_TO_ID.get(_n(label)) ?? null;

// 2.3 Convierte múltiples formatos a un Map { id -> qty }
function buildSuppliesQtyMap(...sources){
  const map = new Map();
  const add = (id, qty) => {
    const k = Number(id), n = Number(qty);
    if (!Number.isFinite(k) || k < 1) return;
    if (!Number.isFinite(n) || n <= 0) return;
    map.set(k, (map.get(k) || 0) + n); // suma cantidades si vienen repetidas
  };

  for (const src of sources){
    if (!src) continue;

    // a) Array de filas/objetos
    if (Array.isArray(src)){
      src.forEach(r=>{
        const id = r?.resourceId ?? r?.resource_id ?? r?.id ?? idFromLabel(r?.label ?? r?.name ?? r?.insumo);
        const q  = r?.qty ?? r?.cantidad ?? r?.amount ?? r?.q ?? r?.value;
        add(id, q);
      });
      continue;
    }

    // b) Objeto: { "12": 3, "Guantes desechables/pares": 2, "12": {qty:3} }
    if (typeof src === 'object'){
      for (const [k,v] of Object.entries(src)){
        if (/^\d+$/.test(k)) add(Number(k), (typeof v==='object') ? (v.qty ?? v.cantidad ?? v.value) : v);
        else add(idFromLabel(k), (typeof v==='object') ? (v.qty ?? v.cantidad ?? v.value) : v);
      }
      continue;
    }

    // c) String JSON o CSV tipo "12:2, 25:1" o "Guantes=2"
    if (typeof src === 'string'){
      const s = src.trim(); if (!s) continue;
      try { buildSuppliesQtyMap(JSON.parse(s)).forEach((v,k)=>add(k,v)); }
      catch {
        s.split(/[,\n;]+/).forEach(tok=>{
          const [k,v] = tok.split(/[:=]/).map(t=>t?.trim());
          if (!k) return;
          if (/^\d+$/.test(k)) add(Number(k), v ?? 1);
          else add(idFromLabel(k), v ?? 1);
        });
      }
    }
  }
  return map;
}

// 2.4 Renderer para el layout en columnas (.supply)
function renderSupplies(record){
  const Q = record.suppliesQty || {};
  return SUPPLY_LABELS.map((name, i) => {
    const id  = i + 1;
    const qty = Q[id] ?? Q[String(id)] ?? '';
    return `
      <div class="supply">
        <span class="num">${String(id).padStart(2,'0')}</span>
        <span class="name">${name}</span>
        <span class="qty">${qty}</span>
      </div>`;
  }).join('');
}



// normalizador para nombres
const normName = (s) => (s ?? '').toString()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[\s/_\-\.]+/g,' ').trim();

/** Devuelve un Map con cantidades indexadas por:
 *  - número: "1", "2", ...
 *  - nombre normalizado: "n:<nombre>"
 * Acepta: objeto { "12": 3, "Guantes...": 2 }, array de objetos, o string (CSV/JSON):
 *  "12:3; 13:1"  |  "Guantes desechables/pares=2"
 */
function parseSupplyMap(record){
  const raw = record.supplies ?? record.insumos ?? record.deployedResources ?? record.resourcesUsed ?? '';
  const map = new Map();
  const addNum = (k, q) => {
    const n = Number(q); if (Number.isFinite(n) && n > 0) map.set(String(k), n);
  };
  const addName = (name, q) => {
    const n = Number(q); if (Number.isFinite(n) && n > 0) map.set('n:'+normName(name), n);
  };

  if (!raw && typeof raw !== 'number') return map;

  let data = raw;
  if (typeof raw === 'string'){
    try { data = JSON.parse(raw); } catch { /* seguirá como texto */ }
  }

  if (Array.isArray(data)){
    data.forEach(it=>{
      if (!it) return;
      if (typeof it === 'object'){
        const id   = it.id ?? it.no ?? it.num ?? it.index ?? it.code;
        const name = it.name ?? it.label ?? it.item ?? it.insumo ?? it.recurso;
        const qty  = it.qty ?? it.quantity ?? it.cantidad ?? it.q;
        if (id   != null) addNum(id, qty);
        if (name != null) addName(name, qty);
      } else {
        const s = String(it);
        const m = s.match(/^\s*(\d+)\s*[:x-]\s*(\d+)\s*$/i);
        if (m) addNum(m[1], m[2]);
      }
    });
    return map;
  }

  if (data && typeof data === 'object'){
    for (const [k,v] of Object.entries(data)){
      if (typeof v === 'object'){
        const q = v.qty ?? v.quantity ?? v.cantidad ?? v.q ?? v.value;
        addNum(k, q);
        if (v.name || v.label || v.item || v.insumo) addName(v.name ?? v.label ?? v.item ?? v.insumo, q);
      } else {
        addNum(k, v);
      }
      // también permite llave por nombre
      if (isNaN(Number(k))) addName(k, (typeof v === 'object') ? (v.qty ?? v.cantidad ?? v.value) : v);
    }
    return map;
  }

  // Texto plano tipo "12:3; Guantes=2"
  String(raw).split(/[;\n,]+/).forEach(line=>{
    const s = line.trim(); if (!s) return;
    let m = s.match(/^(\d+)\s*[:x-]\s*(\d+)\s*$/);    // "12:3"
    if (m){ addNum(m[1], m[2]); return; }
    m = s.match(/^(.+?)\s*[:=]\s*(\d+)\s*$/);         // "Guantes=2"
    if (m){ addName(m[1], m[2]); }
  });
  return map;
}



const qtyFromMap = (map, idx, name) =>
  map.get(String(idx)) ?? map.get('n:'+normName(name)) ?? '';



export { generateExpedientePdf as generateExpedientePDF };