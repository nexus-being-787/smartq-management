import { query } from '../lib/db';
import { StaffUser } from '@smartq/types';

export const createStaff = async (staff: Omit<StaffUser, 'id'> & { authUserId: string }): Promise<StaffUser> => {
  const result = await query(
    `INSERT INTO staff_users (auth_user_id, name, employee_id, role, department_id, is_active) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [staff.authUserId, staff.name, staff.employeeId, staff.role, staff.departmentId, staff.isActive]
  );
  return mapStaffUser(result.rows[0]);
};

export const updateStaffStaff = async (id: string, staff: Partial<StaffUser>): Promise<StaffUser | null> => {
  const updates: string[] = [];
  const values: any[] = [id];
  let i = 2;

  if (staff.name) { updates.push(`name = $${i++}`); values.push(staff.name); }
  if (staff.employeeId) { updates.push(`employee_id = $${i++}`); values.push(staff.employeeId); }
  if (staff.role) { updates.push(`role = $${i++}`); values.push(staff.role); }
  if (staff.departmentId) { updates.push(`department_id = $${i++}`); values.push(staff.departmentId); }
  if (staff.isActive !== undefined) { updates.push(`is_active = $${i++}`); values.push(staff.isActive); }

  if (updates.length === 0) return getStaffById(id);

  const result = await query(
    `UPDATE staff_users SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0] ? mapStaffUser(result.rows[0]) : null;
};

function mapStaffUser(row: any): StaffUser {
  return {
    id: row.id,
    name: row.name,
    employeeId: row.employee_id,
    role: row.role,
    departmentId: row.department_id,
    isActive: row.is_active,
    lastLogin: row.last_login?.toISOString(),
  };
}

export const getAllStaff = async (): Promise<StaffUser[]> => {
  const result = await query('SELECT * FROM staff_users ORDER BY name');
  return result.rows.map(mapStaffUser);
};

export const getStaffById = async (id: string): Promise<StaffUser | null> => {
  const result = await query('SELECT * FROM staff_users WHERE id = $1', [id]);
  return result.rows[0] ? mapStaffUser(result.rows[0]) : null;
};
