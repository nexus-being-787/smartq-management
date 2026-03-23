import { query } from '../lib/db';
import { Doctor } from '@smartq/types';

function mapDoctor(row: any): Doctor {
  return {
    id: row.id,
    name: row.name,
    specialization: row.specialization,
    departmentId: row.department_id,
    status: row.status,
    todayServed: 0,
    todayPending: 0,
    averageConsultMinutes: 10, // Default
  };
}

export const getAllDoctors = async (): Promise<Doctor[]> => {
  const result = await query(
    `SELECT d.*, dept.name as department_name 
     FROM doctors d 
     JOIN departments dept ON d.department_id = dept.id 
     ORDER BY d.name`
  );
  return result.rows.map(mapDoctor);
};

export const getDoctorById = async (id: string): Promise<Doctor | null> => {
  const result = await query('SELECT * FROM doctors WHERE id = $1', [id]);
  return result.rows[0] ? mapDoctor(result.rows[0]) : null;
};

export const updateDoctorStatus = async (id: string, status: string): Promise<Doctor | null> => {
  const result = await query(
    'UPDATE doctors SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] ? mapDoctor(result.rows[0]) : null;
};
