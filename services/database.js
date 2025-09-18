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
      status           TEXT    NOT NULL
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
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);

  // 3) Patient conditions
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS patient_conditions (
      id               INTEGER PRIMARY KEY,
      stability        TEXT,
      patientColor     TEXT,
      airway           TEXT,
      decompression    TEXT,
      side             TEXT,
      cervical         TEXT,
      ventilatoryHelp  TEXT,
      oxygenTherapy    TEXT,
      hemorrhageCtrl   TEXT,
      solutionType     TEXT,
      rcp              TEXT,
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
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS deployed_resources (
      recordId                    INTEGER PRIMARY KEY,
      agua_inyectable_500ml       INTEGER NOT NULL DEFAULT 0,
      agua_oxigenada              INTEGER NOT NULL DEFAULT 0,
      agujas_20x32                INTEGER NOT NULL DEFAULT 0,
      algodon_paquete             INTEGER NOT NULL DEFAULT 0,
      bata_desechable             INTEGER NOT NULL DEFAULT 0,
      bolsa_negra                 INTEGER NOT NULL DEFAULT 0,
      bolsa_roja                  INTEGER NOT NULL DEFAULT 0,
      bolsa_amarilla              INTEGER NOT NULL DEFAULT 0,
      bum_free_gel                INTEGER NOT NULL DEFAULT 0,
      campos_esteriles            INTEGER NOT NULL DEFAULT 0,
      canula_blanda_de_aspiracion INTEGER NOT NULL DEFAULT 0,
      canulas_nasofaringeas       INTEGER NOT NULL DEFAULT 0,
      canulas_orofaringeas        INTEGER NOT NULL DEFAULT 0,
      canula_yankawer             INTEGER NOT NULL DEFAULT 0,
      cateter_12                  INTEGER NOT NULL DEFAULT 0,
      cateter_14                  INTEGER NOT NULL DEFAULT 0,
      cateter_16                  INTEGER NOT NULL DEFAULT 0,
      cateter_18                  INTEGER NOT NULL DEFAULT 0,
      cateter_20                  INTEGER NOT NULL DEFAULT 0,
      cateter_22                  INTEGER NOT NULL DEFAULT 0,
      cateter_24                  INTEGER NOT NULL DEFAULT 0,
      cinta_transporte_3m_1       INTEGER NOT NULL DEFAULT 0,
      cinta_transporte_3m_2       INTEGER NOT NULL DEFAULT 0,
      collarines_desechables      INTEGER NOT NULL DEFAULT 0,
      cubrebocas                  INTEGER NOT NULL DEFAULT 0,
      desinfectante_para_manos    INTEGER NOT NULL DEFAULT 0,
      desinfectante_para_superficies INTEGER NOT NULL DEFAULT 0,
      fijador_de_te_adulto        INTEGER NOT NULL DEFAULT 0,
      fijador_de_te_pediatrico    INTEGER NOT NULL DEFAULT 0,
      gasas_esteriles             INTEGER NOT NULL DEFAULT 0,
      gasas_no_esteriles          INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (recordId) REFERENCES records(id)
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
    phone, rightful
  } = record;

  const [result] = await database.executeSql(
    `INSERT INTO records (
       date, time, weekDay, attentionReason, serviceLocation,
       vehicleType, vehicleNum, operator, intern, moreInterns,
       affiliation, gender, age, address, colony,
       municipality, phone, rightful, status
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
    [
      date, time, weekDay, attentionReason, serviceLocation,
      vehicleType, vehicleNum, operator, intern, moreInterns,
      affiliation, gender, age, address, colony,
      municipality, phone, rightful, status
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
const DEPLOYED_COLUMNS = new Set([
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

// Normaliza una clave (ya sea etiqueta o nombre de columna) a una columna válida del schema
const normalizeColumn = (key) => {
  if (!key) return null;
  const raw = String(key);
  if (DEPLOYED_COLUMNS.has(raw)) return raw;        // ya coincide con el schema
  const norm = toColumnName(raw);                   // normaliza etiquetas con acentos/espacios
  return DEPLOYED_COLUMNS.has(norm) ? norm : null;  // solo si existe en whitelist
};

/**
 * Actualiza deployed_resources para un recordId.
 * Acepta:
 *  - Objeto:  { columna_schema_o_etiqueta: cantidad, ... }
 *  - Arreglo: [{ name|col: 'Etiqueta o columna', quantity|qty|value: n }, ...]
 * Siempre crea la fila (INSERT OR IGNORE) y hace UN solo UPDATE.
 */
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

  if (pairs.length === 0) {
    console.log('ℹ️ updateDeployedResources: nada que actualizar');
    return;
  }

  // Un solo UPDATE
  const setClause = pairs.map(([c]) => `"${c}" = ?`).join(', ');
  const values = pairs.map(([, v]) => v);

  console.log('🛠 UPDATE deployed_resources SET', setClause, 'WHERE recordId =', recordId, 'vals=', values);

  await db.executeSql(
    `UPDATE deployed_resources SET ${setClause} WHERE recordId = ?;`,
    [...values, recordId]
  );

  console.log(`✏️ deployed_resources[${recordId}] actualizado:`, Object.fromEntries(pairs));

  // (opcional) lee la fila para verificar
  const [check] = await db.executeSql(
    `SELECT * FROM deployed_resources WHERE recordId = ?;`,
    [recordId]
  );
  if (check.rows.length) {
    const row = check.rows.item(0);
    console.log('📦 fila luego del UPDATE:', row);
  }
}

// Lee la fila completa
export async function getDeployedResourcesById(recordId) {
  const db = await initDatabase();
  const [res] = await db.executeSql(
    `SELECT * FROM deployed_resources WHERE recordId = ?;`,
    [recordId]
  );
  return res.rows.length ? res.rows.item(0) : null;
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



// Funciones de sesión global
export function getSessionRecordId() {
  return _sessionRecordId;
}

export function setSessionRecordId(id) {
  _sessionRecordId = id;
}
