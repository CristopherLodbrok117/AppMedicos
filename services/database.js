// services/database.js

import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

let db = null;

/**
 * Inicializa (o abre) la base de datos y crea la tabla `records` si no existe.
 */
export async function initDatabase() {
  if (db) return db;
  try {
    db = await SQLite.openDatabase({ name: 'appmedica.db', location: 'default' });
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS records (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        date             TEXT,
        time             TEXT,
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
        status           TEXT
      );
    `);
    console.log('✅ Tabla records lista');
    return db;
  } catch (error) {
    console.error('❌ Error initDatabase:', error);
    throw error;
  }
}

/**
 * Inserta un nuevo registro en `records`.
 * @param {object} record — campos sin `id` ni `status`
 * @param {'saved'|'pending'} status
 * @returns {Promise<number>} insertId
 */
export async function insertRecord(record, status = 'saved') {
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

  console.log('🆔 Registro insertado con ID:', result.insertId);
  return result.insertId;
}
