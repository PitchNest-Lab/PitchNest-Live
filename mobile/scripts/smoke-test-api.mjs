/**
 * Production API smoke test for mobile app endpoints.
 * Run: node scripts/smoke-test-api.mjs
 */
const API = process.env.EXPO_PUBLIC_API_URL || 'https://pitchnest-live.onrender.com';
const email = `mobile-smoke-${Date.now()}@pitchnest.test`;
const password = 'SmokeTest123!';
const name = 'Mobile Smoke Test';

async function req(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

function assert(label, condition, detail = '') {
  if (!condition) throw new Error(`${label} failed${detail ? `: ${detail}` : ''}`);
  console.log(`✓ ${label}`);
}

async function main() {
  console.log(`Testing ${API}\n`);

  const health = await req('/health');
  assert('Health check', health.ok, String(health.data));

  const signup = await req('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  assert('Signup', signup.ok, JSON.stringify(signup.data));
  const { token, user } = signup.data;
  assert('Signup token', !!token);
  assert('Signup user id', !!user?.id);

  const me = await req('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert('Auth me', me.ok && me.data.email === email);

  const profile = await req('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      startup_name: 'Smoke Startup',
      industry: 'SaaS & Enterprise',
      goal: 'Test mobile',
    }),
  });
  assert('Profile save', profile.ok, JSON.stringify(profile.data));

  const sessions = await req('/api/sessions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert('Sessions list', sessions.ok && Array.isArray(sessions.data));

  const decks = await req('/api/decks', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert('Decks list', decks.ok && Array.isArray(decks.data));

  const deleted = await req('/api/auth/account', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
  assert('Delete account', deleted.ok, JSON.stringify(deleted.data));

  console.log('\nAll mobile API smoke tests passed.');
}

main().catch((err) => {
  console.error('\n✗', err.message);
  process.exit(1);
});
