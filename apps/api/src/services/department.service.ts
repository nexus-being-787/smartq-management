import { query } from '../lib/db';
import { Department } from '@smartq/types';

function mapDepartment(row: any): Department {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    currentQueueLength: 0, // Calculated separately
    estimatedWaitMinutes: 0, // Calculated separately
    isActive: row.is_active,
    doctors: [], // Joined separately if needed
  };
}

export const getAllDepartments = async (): Promise<Department[]> => {
  const result = await query(
    'SELECT * FROM departments WHERE is_active = true ORDER BY name'
  );
  return result.rows.map(mapDepartment);
};

export const getDepartmentById = async (id: string): Promise<Department | null> => {
  const result = await query('SELECT * FROM departments WHERE id = $1', [id]);
  return result.rows[0] ? mapDepartment(result.rows[0]) : null;
};
