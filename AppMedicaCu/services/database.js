// services/database.js
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

let db = null;
let _sessionRecordId = null; // Mantiene el ID de la sesión hasta que se pulse “Nuevo”

// Convierte la etiqueta de recurso en el nombre de columna
// Convierte la etiqueta de recurso en el nombre de columna
const toColumnName = label =>
  String(label)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_ ]/g, '')   // <— permite "_"
    .trim()
    .replace(/\s+/g, '_');



export async function initDatabase() {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'appmedica.db', location: 'default' });

  await ensureDeployedResourcesTable(db);

  // 1) Tabla principal
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS records (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      date             TEXT    NOT NULL,
      time             TEXT    NOT NULL,
      weekDay          TEXT,
      attentionReason  TEXT,
      serviceLocation  TEXT,
      vehicleType      TEXT,
      vehicleNum       TEXT,
      operator         TEXT,
      intern           TEXT,
      moreInterns      TEXT,
      affiliation      TEXT,
      gender           TEXT,
      age              TEXT,
      address          TEXT,
      colony           TEXT,
      municipality     TEXT,
      phone            TEXT,
      rightful         TEXT,
      status           TEXT    NOT NULL,
      belongsToUniNet  TEXT,   -- 'Si' | 'No'
      adscription      TEXT,
      code             TEXT
    );
  `);

  // 2) Patient evaluations
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS patient_evaluations (
      id                   INTEGER PRIMARY KEY,
      traumaCause          TEXT,
      otherTraumaCause     TEXT,
      injuryMechanism      TEXT,
      clinicalCause        TEXT,
      otherClinicalCause   TEXT,
      specificCause        TEXT,
      deliveryProduct      TEXT,
      deliverySex          TEXT,
      apgarMinute1         TEXT,
      apgarMinute5         TEXT,
      apgarMinute10        TEXT,
      gesta                TEXT,
      para                 TEXT,
      cesarean             TEXT,
      abortion             TEXT,
      lastCycleDate        TEXT,
      birthDate            TEXT,
      paramColoracion           TEXT,
      paramFrecuenciaCardiaca   TEXT,
      paramTonoMuscular         TEXT,
      paramRespuestaEstimulos   TEXT,
      paramEsfuerzoRespiratorio TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);

  // 3) Patient conditions
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS patient_conditions (
      id               INTEGER PRIMARY KEY,
      stability          TEXT,
      patientColor       TEXT,
      airway             TEXT,
      decompression      TEXT,
      side               TEXT,
      cervical           TEXT,
      ventilatoryHelp    TEXT,
      oxygenTherapy      TEXT,
      hemorrhageCtrl     TEXT,
      solutionType       TEXT,
      rcp                TEXT,
      criticality        TEXT,
      glasgow            TEXT,
      ventFrequency      TEXT,
      ventVolume         TEXT,
      oxygenLpm          TEXT,
      ivLines            TEXT,
      catheterNum        TEXT,
      solutionAmount     TEXT,
      solutionInfusions  TEXT,
      pharmaTherapyRows  TEXT,
      immobilization     TEXT,
      curation           TEXT,
      bandage            TEXT,
      time               TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);

  // 4) First evaluations
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS first_evaluations (
      id                   INTEGER PRIMARY KEY,
      evaluationItem       TEXT,
      ventilationItem      TEXT,
      circulationItem      TEXT,
      airRouteItem         TEXT,
      respSoundsItem       TEXT,
      lungSideItem         TEXT,
      lungPartItem         TEXT,
      qualityItem          TEXT,
      swallowingReflexItem TEXT,
      skinItem             TEXT,
      characteristicsItem  TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);


// 5) Patient transfers
await db.executeSql(`
  CREATE TABLE IF NOT EXISTS patient_transfers (
    id               INTEGER PRIMARY KEY,
    fromLocation     TEXT,
    toLocation       TEXT,
    reason           TEXT,
    vehicleUsed      TEXT,
    institution      TEXT,
    patientName      TEXT,
    witnessName      TEXT,
    observations     TEXT,
    dependencies     TEXT,
    units            TEXT,
    officerName      TEXT,
    belongings       TEXT,
    receiver         TEXT,
    paramedicName    TEXT,
    doctorName       TEXT,

    -- Firmas integradas en el schema
    patientSignatureSvg   TEXT,
    paramedicSignatureSvg TEXT,
    doctorSignatureSvg    TEXT,
    witnessSignatureSvg TEXT,

    FOREIGN KEY (id) REFERENCES records(id)
  );
`);



  // 6) Physical explorations (con columna injuries)
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS physical_explorations (
      id               INTEGER PRIMARY KEY,
      head             TEXT,
      neck             TEXT,
      chest            TEXT,
      abdomen          TEXT,
      limbs            TEXT,
      neurological     TEXT,
      injuries         TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);

  // 7) deployed_resources: UNA FILA por expediente, UNA COLUMNA por recurso
  // Catálogo canónico (SIN duplicados, con “Transpore”, etc.)
  


      // --- Signos vitales (múltiples filas por expediente) ---
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS vital_signs (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        recordId  INTEGER NOT NULL,
        rowIndex  INTEGER NOT NULL,
        hour      TEXT,
        fr        TEXT,
        fc        TEXT,
        tas       TEXT,
        tad       TEXT,
        sao2      TEXT,
        temp      TEXT,
        gluc      TEXT,
        ekg       TEXT,
        neuro     TEXT,  -- 'A' | 'V' | 'D' | 'I'
        UNIQUE(recordId, rowIndex),
        FOREIGN KEY(recordId) REFERENCES records(id)
      );
    `);

    // --- SAMPLE (una fila por expediente) ---
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS sample_notes (
        id                INTEGER PRIMARY KEY, -- = recordId
        signsSymptoms     TEXT,
        meds              TEXT,
        allergies         TEXT,
        pathologies       TEXT,
        lastIntakeTime    TEXT,
        relatedEvents     TEXT,
        FOREIGN KEY (id) REFERENCES records(id)
      );
    `);


  console.log('✅ Todas las tablas están listas');
  return db;
}

// Inserta expediente padre
export async function insertRecord(record, status = 'pending') {
  const database = await initDatabase();
  const {
    date, time, weekDay, attentionReason, serviceLocation,
    vehicleType, vehicleNum, operator, intern, moreInterns,
    affiliation, gender, age, address, colony, municipality,
    phone, rightful,belongsToUniNet, adscription, code,
  } = record;

  const [result] = await database.executeSql(
    `INSERT INTO records (
       date, time, weekDay, attentionReason, serviceLocation,
       vehicleType, vehicleNum, operator, intern, moreInterns,
       affiliation, gender, age, address, colony,
       municipality, phone, rightful,
       belongsToUniNet, adscription, code,
       status
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
    [
      date, time, weekDay, attentionReason, serviceLocation,
      vehicleType, vehicleNum, operator, intern, moreInterns,
      affiliation, gender, age, address, colony,
      municipality, phone, rightful,
      belongsToUniNet, adscription, code,
      status
    ]
  );

  console.log('🆔 Nuevo expediente con ID:', result.insertId);
  return result.insertId;
}

// Crea stubs (incluido deployed_resources) — sólo ID en cada tabla hija
export async function createAllStubs(recordId) {
  const db = await initDatabase();
  const simples = [
    'patient_evaluations',
    'patient_conditions',
    'first_evaluations',
    'patient_transfers',
    'physical_explorations'
  ];
  for (let t of simples) {
    await db.executeSql(
      `INSERT OR IGNORE INTO ${t} (id) VALUES (?);`,
      [recordId]
    );
  }
  // Stub único para deployed_resources
  await db.executeSql(
    `INSERT OR IGNORE INTO deployed_resources (recordId) VALUES (?);`,
    [recordId]
  );
  await db.executeSql(`INSERT OR IGNORE INTO sample_notes (id) VALUES (?);`,
    [recordId]);
// vital_signs no requiere stub; se upserta por fila

}

// Actualiza estado en records
export async function updateRecord(recordId, fieldsObj) {
  const db = await initDatabase();
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fieldsObj);
  await db.executeSql(
    `UPDATE records SET ${cols} WHERE id = ?;`,
    [...vals, recordId]
  );
  console.log(`✏️ records[${recordId}] actualizado`);
}

// Lista blanca: columnas EXACTAS de deployed_resources
const DEPLOYED_COLUMNSSSS = new Set([
  'agua_inyectable_500ml','agua_oxigenada','agujas_20x32','algodon_paquete',
  'bata_desechable','bolsa_negra','bolsa_roja','bolsa_amarilla','bum_free_gel',
  'campos_esteriles','canula_blanda_de_aspiracion','canulas_nasofaringeas',
  'canulas_orofaringeas','canula_yankawer','cateter_12','cateter_14','cateter_16',
  'cateter_18','cateter_20','cateter_22','cateter_24','cinta_transporte_3m_1',
  'cinta_transporte_3m_2','collarines_desechables','cubrebocas',
  'desinfectante_para_manos','desinfectante_para_superficies',
  'fijador_de_te_adulto','fijador_de_te_pediatrico','gasas_esteriles',
  'gasas_no_esteriles'
]);
const DEPLOYED_RESOURCE_LABELS = [
    // ——— Material y consumibles
    'Agua inyectable 500 ml','Agua oxigenada','Agujas 20x32','Algodón paquete','Bata desechable',
    'Bolsa negra','Bolsa roja','Bolsa amarilla','Burn free gel','Campos estériles',
    'Cánula blanda de aspiración','Cánulas nasofaríngeas','Cánulas orofaríngeas','Cánula yankawer',
    'Catéter #12','Catéter #14','Catéter #16','Catéter #18','Catéter #20','Catéter #22','Catéter #24',
    'Cinta Transpore 3m 1”','Cinta Transpore 3m 2”',
    'Collarines desechables','Cubrebocas','Desinfectante p/ manos','Desinfectante p/ superficies',
    'Fijador de TE adulto','Fijador de TE pediátrico','Gasas estériles','Gasas no estériles',
    'Guantes estériles/pares','Guantes desechables/pares', // ← añadimos desechables
    'Hojas de bisturí #20','Jalea hidrosoluble',
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
/// Lista blanca dinámica basada en el catálogo
const ALLOWED_COLS = new Set(DEPLOYED_RESOURCE_LABELS.map(toColumnName));

// Normaliza una clave (etiqueta o nombre) a una columna válida del schema
function normalizeColumn(k) {
  const col = toColumnName(k);
  return ALLOWED_COLS.has(col) ? col : null;
}

export async function updateDeployedResources(recordId, data) {
  const db = await initDatabase();

  // Asegurar fila del expediente
  await db.executeSql(
    `INSERT OR IGNORE INTO deployed_resources (recordId) VALUES (?);`,
    [recordId]
  );

  // Normaliza a pares [columna válida, valor]
  const pairs = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      if (!item) continue;
      const col = normalizeColumn(item.col ?? item.name);
      if (!col) continue;
      const val = Number(item.qty ?? item.quantity ?? item.value ?? 0) || 0;
      pairs.push([col, val]);
    }
  } else if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) {
      const col = normalizeColumn(k);
      if (!col) continue;
      const val = Number(v ?? 0) || 0;
      pairs.push([col, val]);
    }
  }

  if (pairs.length === 0) return;

  const setClause = pairs.map(([c]) => `"${c}" = ?`).join(', ');
  const values = pairs.map(([, v]) => v);

  await db.executeSql(
    `UPDATE deployed_resources SET ${setClause} WHERE recordId = ?;`,
    [...values, recordId]
  );
}

export async function getDeployedResourcesById(recordId) {
  const db = await initDatabase();
  const [res] = await db.executeSql(
    `SELECT * FROM deployed_resources WHERE recordId = ?;`,
    [recordId]
  );
  return res.rows.length ? res.rows.item(0) : null;
}
// Construye el DDL completo con todas las columnas (INTEGER DEFAULT 0)
    async function ensureDeployedResourcesTable(db) {
      const cols = Array.from(new Set(DEPLOYED_RESOURCE_LABELS))  // por si acaso
        .map(label => `${toColumnName(label)} INTEGER NOT NULL DEFAULT 0`);
      const ddl = `
        CREATE TABLE IF NOT EXISTS deployed_resources (
          recordId INTEGER PRIMARY KEY,
          ${cols.join(',\n      ')},
          FOREIGN KEY (recordId) REFERENCES records(id)
        );
      `;
      await db.executeSql(ddl);
    }

export async function updatePatientEvaluation(recordId, fieldsObj) {
  const database = await initDatabase();
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fieldsObj);
  await database.executeSql(
    `UPDATE patient_evaluations SET ${cols} WHERE id = ?;`,
    [...vals, recordId]
  );
  console.log(`✏️ patient_evaluations[${recordId}] actualizado`);
}

export async function updatePatientCondition(recordId, fieldsObj) {
  const database = await initDatabase();
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fieldsObj);
  await database.executeSql(
    `UPDATE patient_conditions SET ${cols} WHERE id = ?;`,
    [...vals, recordId]
  );
  console.log(`✏️ patient_conditions[${recordId}] actualizado`);
}

export async function updateFirstEvaluation(recordId, fieldsObj) {
  const database = await initDatabase();
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fieldsObj);
  await database.executeSql(
    `UPDATE first_evaluations SET ${cols} WHERE id = ?;`,
    [...vals, recordId]
  );
  console.log(`✏️ first_evaluations[${recordId}] actualizado`);
}

export async function updatePatientTransfer(recordId, fieldsObj) {
  const database = await initDatabase();
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fieldsObj);
  await database.executeSql(
    `UPDATE patient_transfers SET ${cols} WHERE id = ?;`,
    [...vals, recordId]
  );
  console.log(`✏️ patient_transfers[${recordId}] actualizado`);
}

export async function updatePhysicalExploration(recordId, fieldsObj) {
  const database = await initDatabase();
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fieldsObj);
  await database.executeSql(
    `UPDATE physical_explorations SET ${cols} WHERE id = ?;`,
    [...vals, recordId]
  );
  console.log(`✏️ physical_explorations[${recordId}] actualizado`);
}


export async function getSavedRecords() {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM records WHERE status = 'saved' ORDER BY id DESC;`
  );
  const list = [];
  for (let i = 0; i < result.rows.length; i++) {
    list.push(result.rows.item(i));
  }
  return list;
}

export async function getPendingRecords() {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM records WHERE status = 'pending' ORDER BY id DESC;`
  );
  const list = [];
  for (let i = 0; i < result.rows.length; i++) {
    list.push(result.rows.item(i));
  }
  return list;
}

export async function getRecordById(recordId) {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM records WHERE id = ?;`,
    [recordId]
  );
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

export async function getPatientEvaluationById(recordId) {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM patient_evaluations WHERE id = ?;`,
    [recordId]
  );
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

export async function getPatientConditionById(recordId) {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM patient_conditions WHERE id = ?;`,
    [recordId]
  );
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

export async function getFirstEvaluationById(recordId) {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM first_evaluations WHERE id = ?;`,
    [recordId]
  );
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

export async function getPatientTransferById(recordId) {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM patient_transfers WHERE id = ?;`,
    [recordId]
  );
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

export async function getPhysicalExplorationById(recordId) {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM physical_explorations WHERE id = ?;`,
    [recordId]
  );
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

// ---- VITAL SIGNS ----
export async function getVitalSignsByRecordId(recordId) {
  const database = await initDatabase();
  const [res] = await database.executeSql(
    `SELECT * FROM vital_signs WHERE recordId = ? ORDER BY rowIndex ASC;`,
    [recordId]
  );
  const rows = [];
  for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
  return rows;
}

export async function updateVitalSigns(recordId, rows) {
  const database = await initDatabase();
  // Upsert por fila
  const sql = `
    INSERT OR REPLACE INTO vital_signs
      (id, recordId, rowIndex, hour, fr, fc, tas, tad, sao2, temp, gluc, ekg, neuro)
    VALUES (
      COALESCE((SELECT id FROM vital_signs WHERE recordId = ? AND rowIndex = ?), NULL),
      ?,?,?,?,?,?,?,?,?,?,?,?
    );
  `;
  for (const r of rows) {
    await database.executeSql(sql, [
      recordId, r.rowIndex,
      recordId, r.rowIndex, r.hour || '', r.fr || '', r.fc || '', r.tas || '',
      r.tad || '', r.sao2 || '', r.temp || '', r.gluc || '', r.ekg || '', r.neuro || ''
    ]);
  }
}

// ---- SAMPLE ----
export async function getSampleNotesById(recordId) {
  const database = await initDatabase();
  const [res] = await database.executeSql(
    `SELECT * FROM sample_notes WHERE id = ?;`, [recordId]
  );
  return res.rows.length ? res.rows.item(0) : null;
}

export async function updateSampleNotes(recordId, fieldsObj) {
  const database = await initDatabase();
  await database.executeSql(`INSERT OR IGNORE INTO sample_notes (id) VALUES (?);`, [recordId]);
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fieldsObj);
  await database.executeSql(`UPDATE sample_notes SET ${cols} WHERE id = ?;`, [...vals, recordId]);
}


// Funciones de sesión global
export function getSessionRecordId() {
  return _sessionRecordId;
}

export function setSessionRecordId(id) {
  _sessionRecordId = id;
}
