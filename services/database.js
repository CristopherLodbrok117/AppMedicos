// services/database.js
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

let db = null;
let sessionRecordId = null;

/** Devuelve la ID actual de la sesión (o null) */
export function getSessionRecordId() {
  return sessionRecordId;
}

/** Establece la ID de la sesión */
export function setSessionRecordId(id) {
  sessionRecordId = id;
}

export async function initDatabase() {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'appmedica.db', location: 'default' });

  // tabla principal
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      weekDay TEXT,
      attentionReason TEXT,
      serviceLocation TEXT,
      vehicleType TEXT,
      vehicleNum TEXT,
      operator TEXT,
      intern TEXT,
      moreInterns TEXT,
      affiliation TEXT,
      gender TEXT,
      age TEXT,
      address TEXT,
      colony TEXT,
      municipality TEXT,
      phone TEXT,
      rightful TEXT,
      status TEXT NOT NULL
    );
  `);

  // tablas hijas
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS patient_evaluations (
      id INTEGER PRIMARY KEY,
      traumaCause TEXT,
      otherTraumaCause TEXT,
      injuryMechanism TEXT,
      clinicalCause TEXT,
      otherClinicalCause TEXT,
      specificCause TEXT,
      deliveryProduct TEXT,
      deliverySex TEXT,
      apgarMinute1 TEXT,
      apgarMinute5 TEXT,
      apgarMinute10 TEXT,
      gesta TEXT,
      para TEXT,
      cesarean TEXT,
      abortion TEXT,
      lastCycleDate TEXT,
      birthDate TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS patient_conditions (
      id INTEGER PRIMARY KEY,
      stability TEXT,
      patientColor TEXT,
      airway TEXT,
      decompression TEXT,
      side TEXT,
      cervical TEXT,
      ventilatoryHelp TEXT,
      oxygenTherapy TEXT,
      hemorrhageCtrl TEXT,
      solutionType TEXT,
      rcp TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS first_evaluations (
      id INTEGER PRIMARY KEY,
      evaluationItem TEXT,
      ventilationItem TEXT,
      circulationItem TEXT,
      airRouteItem TEXT,
      respSoundsItem TEXT,
      lungSideItem TEXT,
      lungPartItem TEXT,
      qualityItem TEXT,
      swallowingReflexItem TEXT,
      skinItem TEXT,
      characteristicsItem TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS patient_transfers (
      id INTEGER PRIMARY KEY,
      fromLocation TEXT,
      toLocation TEXT,
      reason TEXT,
      vehicleUsed TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS physical_explorations (
      id INTEGER PRIMARY KEY,
      head TEXT,
      neck TEXT,
      chest TEXT,
      abdomen TEXT,
      limbs TEXT,
      neurological TEXT,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS deployed_resources (
      id INTEGER PRIMARY KEY,
      resourceName TEXT,
      quantity INTEGER,
      FOREIGN KEY (id) REFERENCES records(id)
    );
  `);

  return db;
}

export async function insertRecord(record, status = 'pending') {
  const database = await initDatabase();
  const vals = [
    record.date, record.time, record.weekDay, record.attentionReason, record.serviceLocation,
    record.vehicleType, record.vehicleNum, record.operator, record.intern, record.moreInterns,
    record.affiliation, record.gender, record.age, record.address, record.colony,
    record.municipality, record.phone, record.rightful, status
  ];
  const [res] = await database.executeSql(
    `INSERT INTO records (
      date, time, weekDay, attentionReason, serviceLocation,
      vehicleType, vehicleNum, operator, intern, moreInterns,
      affiliation, gender, age, address, colony,
      municipality, phone, rightful, status
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
    vals
  );
  const newId = res.insertId;
  setSessionRecordId(newId);
  return newId;
}

export async function createAllStubs(recordId) {
  const database = await initDatabase();
  const tables = [
    'patient_evaluations',
    'patient_conditions',
    'first_evaluations',
    'patient_transfers',
    'physical_explorations',
    'deployed_resources'
  ];
  for (const t of tables) {
    await database.executeSql(
      `INSERT OR IGNORE INTO ${t} (id) VALUES (?);`,
      [recordId]
    );
  }
}

export async function updateRecord(recordId, fieldsObj) {
  const database = await initDatabase();
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(fieldsObj), recordId];
  await database.executeSql(
    `UPDATE records SET ${cols} WHERE id = ?;`,
    vals
  );
}

export async function updatePatientEvaluation(recordId, fieldsObj) {
  const database = await initDatabase();
  const cols = Object.keys(fieldsObj).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(fieldsObj), recordId];
  await database.executeSql(
    `UPDATE patient_evaluations SET ${cols} WHERE id = ?;`,
    vals
  );
}

export async function getRecordById(recordId) {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM records WHERE id = ?;`,
    [recordId]
  );
  return result.rows.length ? result.rows.item(0) : null;
}

export async function getPatientEvaluationById(recordId) {
  const database = await initDatabase();
  const [result] = await database.executeSql(
    `SELECT * FROM patient_evaluations WHERE id = ?;`,
    [recordId]
  );
  return result.rows.length ? result.rows.item(0) : null;
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
