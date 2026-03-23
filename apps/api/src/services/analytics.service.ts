import { query } from '../lib/db';
import { DailyStats } from '@smartq/types';

export const getDailyStats = async (date: string): Promise<DailyStats> => {
  const result = await query(
    `SELECT 
      COUNT(*) as total_tokens,
      COUNT(*) FILTER (WHERE status = 'COMPLETED' OR status = 'REFERRED' OR status = 'ADMITTED') as total_served,
      COUNT(*) FILTER (WHERE status = 'NO_SHOW') as total_no_shows,
      COUNT(*) FILTER (WHERE status = 'CANCELLED') as total_cancelled
     FROM tokens 
     WHERE issued_at >= $1::date AND issued_at < ($1::date + interval '1 day')`,
    [date]
  );

  const stats = result.rows[0];
  return {
    date,
    totalTokens: parseInt(stats.total_tokens) || 0,
    totalServed: parseInt(stats.total_served) || 0,
    totalNoShows: parseInt(stats.total_no_shows) || 0,
    totalCancelled: parseInt(stats.total_cancelled) || 0,
    averageWaitMinutes: 15, // TODO: calculate accurately
    averageConsultMinutes: 10,
    peakHour: 11,
  };
};
