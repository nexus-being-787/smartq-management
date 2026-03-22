// Supabase auth client — calls GoTrue REST API directly (no package required)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ session: SupabaseSession | null; error: string | null }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { session: null, error: data.error_description ?? data.msg ?? 'Sign in failed' };
    }

    return { session: data as SupabaseSession, error: null };
  } catch (err) {
    return { session: null, error: 'Network error — please check your connection.' };
  }
}

export async function getStaffRole(
  userId: string,
  accessToken: string,
): Promise<{ role: string | null; error: string | null }> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/staff_users?auth_user_id=eq.${userId}&select=role,is_active&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      return { role: null, error: 'Could not fetch staff profile.' };
    }

    const rows: Array<{ role: string; is_active: boolean }> = await res.json();

    if (!rows.length) {
      return { role: null, error: 'No staff profile found for this account.' };
    }

    if (!rows[0].is_active) {
      return { role: null, error: 'Your account has been deactivated. Contact an administrator.' };
    }

    return { role: rows[0].role, error: null };
  } catch {
    return { role: null, error: 'Network error fetching staff profile.' };
  }
}
