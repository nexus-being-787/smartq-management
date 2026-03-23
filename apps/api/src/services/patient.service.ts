import { query } from '../lib/db';
import { Patient } from '@smartq/types';

function mapPatient(row: any): Patient {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    age: row.age,
    gender: row.gender,
    isReturning: true, // simplified
    medicalHistory: row.medical_history,
    allergies: row.allergies,
  };
}

export const getPatientById = async (id: string): Promise<Patient | null> => {
  const result = await query('SELECT * FROM patients WHERE id = $1', [id]);
  return result.rows[0] ? mapPatient(result.rows[0]) : null;
};

export const getPatientByMobile = async (mobile: string): Promise<Patient | null> => {
  const result = await query('SELECT * FROM patients WHERE mobile = $1', [mobile]);
  return result.rows[0] ? mapPatient(result.rows[0]) : null;
};

export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
  const result = await query(
    `INSERT INTO patients (name, mobile, age, gender, medical_history, allergies) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [patient.name, patient.mobile, patient.age, patient.gender, patient.medicalHistory, patient.allergies]
  );
  return mapPatient(result.rows[0]);
};
