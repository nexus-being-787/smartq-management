import { query } from '../lib/db';
import { Token, TokenPriority, TokenStatus } from '@smartq/types';
import { sortQueue, classifyPriority, estimateWaitMinutes } from '@smartq/queue-logic';

function mapToken(row: any): Token {
  return {
    id: row.id,
    number: row.number,
    displayNumber: row.display_number,
    patientId: row.patient_id,
    departmentId: row.department_id,
    doctorId: row.doctor_id,
    status: row.status as TokenStatus,
    priority: row.priority as TokenPriority,
    issuedAt: row.issued_at.toISOString(),
    calledAt: row.called_at?.toISOString(),
    consultedAt: row.consulted_at?.toISOString(),
    noShowCount: row.no_show_count,
    estimatedWaitMinutes: 0, // Calculated below
    queuePosition: 0, // Calculated below
  };
}

export const issueToken = async (payload: {
  patientId: string;
  departmentId: string;
  doctorId?: string;
  isEmergency?: boolean;
  isSenior?: boolean;
}): Promise<Token> => {
  const deptRes = await query('SELECT code FROM departments WHERE id = $1', [payload.departmentId]);
  const deptCode = deptRes.rows[0]?.code || 'Q';

  const countRes = await query(
    `SELECT COUNT(*) FROM tokens 
     WHERE department_id = $1 AND issued_at >= CURRENT_DATE`,
    [payload.departmentId]
  );
  const nextNumber = parseInt(countRes.rows[0].count) + 1;
  const displayNumber = `${deptCode}-${nextNumber.toString().padStart(3, '0')}`;

  const priority = classifyPriority({
    isEmergency: payload.isEmergency,
    isSenior: payload.isSenior,
  });

  const result = await query(
    `INSERT INTO tokens (number, display_number, patient_id, department_id, doctor_id, priority, status) 
     VALUES ($1, $2, $3, $4, $5, $6, 'ISSUED') 
     RETURNING *`,
    [nextNumber, displayNumber, payload.patientId, payload.departmentId, payload.doctorId, priority]
  );

  return mapToken(result.rows[0]);
};

export const getQueueForDepartment = async (departmentId: string): Promise<Token[]> => {
  const result = await query(
    `SELECT * FROM tokens 
     WHERE department_id = $1 AND (status = 'ISSUED' OR status = 'CALLED') 
     AND issued_at >= CURRENT_DATE 
     ORDER BY issued_at ASC`,
    [departmentId]
  );
  
  const rawTokens = result.rows.map(mapToken);
  const sortedTokens = sortQueue(rawTokens);

  // Add position and ETA
  return sortedTokens.map((token, index) => {
    const position = index + 1;
    const waitTime = estimateWaitMinutes(position, 10); // 10 min avg
    return { ...token, queuePosition: position, estimatedWaitMinutes: waitTime };
  });
};

export const updateTokenStatus = async (
  id: string, 
  status: TokenStatus
): Promise<Token | null> => {
  const result = await query(
    `UPDATE tokens SET status = $1, 
     called_at = CASE WHEN $1 = 'CALLED' THEN datetime('now') ELSE called_at END,
     consulted_at = CASE WHEN $1 = 'IN_CONSULTATION' THEN datetime('now') ELSE consulted_at END
     WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] ? mapToken(result.rows[0]) : null;
};
