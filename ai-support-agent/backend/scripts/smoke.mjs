/**
 * Local smoke test — run: npm run smoke (from backend/)
 * Requires the API server on PORT (default 5000) and a valid .env.
 */
const API = process.env.SMOKE_API_URL ?? 'http://localhost:5000';

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: res.status, data };
}

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`  ✓ ${message}`);
}

async function main() {
  console.log(`\nSmoke test → ${API}\n`);

  const health = await request('GET', '/health');
  assert(health.status === 200, `health status ${health.status}`);
  pass('/health returns 200');

  const email = `smoke-${Date.now()}@test.local`;
  const password = 'SmokeTest@2026!';

  const register = await request('POST', '/api/auth/business/register', {
    name: 'Smoke Test Co',
    email,
    password,
  });
  assert(register.status === 201, `register status ${register.status}`);
  const reg = register.data;
  assert(Boolean(reg.accessToken), 'missing accessToken');
  pass('business registration');

  const token = reg.accessToken;
  const widgetKey = reg.business.widgetKey;

  const conversations = await request('GET', '/api/conversations?page=1&pageSize=5', undefined, token);
  assert(conversations.status === 200, `conversations status ${conversations.status}`);
  const convPage = conversations.data;
  assert(Array.isArray(convPage.items), 'conversations.items missing');
  assert(typeof convPage.total === 'number', 'conversations.total missing');
  pass('paginated conversations list');

  const analytics = await request('GET', '/api/business/analytics?days=30', undefined, token);
  assert(analytics.status === 200, `analytics status ${analytics.status}`);
  assert(analytics.data.days === 30, 'analytics days filter');
  pass('analytics with date window');

  const widgetSession = await request('POST', '/api/widget/session', { widgetKey });
  assert(widgetSession.status === 200, `widget session status ${widgetSession.status}`);
  assert(Boolean(widgetSession.data.sessionToken), 'missing sessionToken');
  pass('widget session minting');

  const widgetStart = await request(
    'POST',
    '/api/widget/conversation/start',
    { customerName: 'Smoke Visitor' }
  );
  assert(widgetStart.status === 401, `unauthenticated widget start should 401, got ${widgetStart.status}`);
  pass('widget routes reject missing session');

  const profile = await request('GET', '/api/business/profile', undefined, token);
  assert(profile.status === 200, `profile status ${profile.status}`);
  pass('authenticated business profile');

  console.log('\nAll REST smoke checks passed.\n');
  console.log('Socket auth: run `npm run smoke:socket` next.\n');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
