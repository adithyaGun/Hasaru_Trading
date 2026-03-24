/**
 * Login & Auth Debug Test Script
 * Run from the project root: node test-login.js
 * No extra packages needed — uses Node.js built-in http module.
 */

const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:5000/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const url = new URL(API_BASE + path);
    const lib = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const GREEN  = (s) => `\x1b[32m${s}\x1b[0m`;
const RED    = (s) => `\x1b[31m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const CYAN   = (s) => `\x1b[36m${s}\x1b[0m`;
const BOLD   = (s) => `\x1b[1m${s}\x1b[0m`;

const pass = (label) => `${GREEN('✔ PASS')} ${label}`;
const fail = (label) => `${RED('✘ FAIL')} ${label}`;

// ─── tests ──────────────────────────────────────────────────────────────────

async function testHealth() {
  console.log(BOLD('\n══════════════════════════════════════'));
  console.log(BOLD(' 1. Backend Reachability'));
  console.log(BOLD('══════════════════════════════════════'));
  try {
    const r = await request('GET', '/products?limit=1', null, null);
    if (r.status < 500) {
      console.log(pass(`Backend reachable — HTTP ${r.status}`));
    } else {
      console.log(fail(`Backend returned HTTP ${r.status}`));
      console.log(RED('Full response:'), JSON.stringify(r.body, null, 2));
    }
  } catch (e) {
    console.log(fail(`Cannot connect to ${API_BASE}`));
    console.log(RED(`Error: ${e.message}`));
    console.log(YELLOW('\n→ Is the backend running?  cd backend && node server.js'));
    process.exit(1);
  }
}

async function testLogin(email, password, expectedRole) {
  const r = await request('POST', '/auth/login', { email, password });
  const ok = r.status === 200 && r.body.success === true;
  const roleOk = ok && r.body.data?.user?.role === expectedRole;

  const label = `${email} (expected role: ${expectedRole})`;

  if (!ok) {
    console.log(fail(label));
    console.log(RED(`  HTTP ${r.status} — ${r.body.message || JSON.stringify(r.body)}`));
    return null;
  }

  const user = r.body.data.user;
  const token = r.body.data.token;
  if (!roleOk) {
    console.log(fail(label));
    console.log(RED(`  Login OK but role mismatch — got "${user.role}", expected "${expectedRole}"`));
  } else {
    console.log(pass(label));
    console.log(`  name=${user.name}  role=${user.role}  id=${user.id}`);
  }
  return token;
}

async function testBatchLogins() {
  console.log(BOLD('\n══════════════════════════════════════'));
  console.log(BOLD(' 2. Seed User Credentials (Batch)'));
  console.log(BOLD('══════════════════════════════════════'));

  const seeds = [
    { email: 'admin@hasarutrading.com',  password: 'password123', role: 'admin' },
    { email: 'sales1@hasarutrading.com', password: 'password123', role: 'sales_staff' },
    { email: 'sales2@hasarutrading.com', password: 'password123', role: 'sales_staff' },
    { email: 'customer1@email.com',       password: 'password123', role: 'customer' },
    { email: 'customer2@email.com',       password: 'password123', role: 'customer' },
  ];

  let adminToken = null;
  for (const s of seeds) {
    const token = await testLogin(s.email, s.password, s.role);
    if (s.role === 'admin' && token) adminToken = token;
  }
  return adminToken;
}

async function testWrongCredentials() {
  console.log(BOLD('\n══════════════════════════════════════'));
  console.log(BOLD(' 3. Wrong Credentials (should fail)'));
  console.log(BOLD('══════════════════════════════════════'));

  const r = await request('POST', '/auth/login', { email: 'admin@hasarutrading.com', password: 'wrongpassword' });
  if (r.status === 401) {
    console.log(pass(`Correctly rejected wrong password — HTTP 401`));
  } else {
    console.log(fail(`Expected 401, got HTTP ${r.status} — ${r.body.message}`));
  }

  const r2 = await request('POST', '/auth/login', { email: 'nobody@example.com', password: 'password123' });
  if (r2.status === 401) {
    console.log(pass(`Correctly rejected unknown email — HTTP 401`));
  } else {
    console.log(fail(`Expected 401, got HTTP ${r2.status} — ${r2.body.message}`));
  }
}

async function testProtectedRoute(token) {
  console.log(BOLD('\n══════════════════════════════════════'));
  console.log(BOLD(' 4. Protected Route (JWT)'));
  console.log(BOLD('══════════════════════════════════════'));

  // Without token — should be 401
  const r1 = await request('GET', '/auth/profile', null, null);
  if (r1.status === 401) {
    console.log(pass(`No token → 401 Unauthorized`));
  } else {
    console.log(fail(`No token should return 401, got ${r1.status}`));
  }

  // With valid token — should be 200
  const r2 = await request('GET', '/auth/profile', null, token);
  if (r2.status === 200 && r2.body.success) {
    console.log(pass(`Valid token → 200 OK  (name: ${r2.body.data?.name})`));
  } else {
    console.log(fail(`Valid token → HTTP ${r2.status} — ${r2.body.message}`));
  }

  // With garbage token — should be 401
  const r3 = await request('GET', '/auth/profile', null, 'garbage.token.here');
  if (r3.status === 401) {
    console.log(pass(`Invalid token → 401 Unauthorized`));
  } else {
    console.log(fail(`Invalid token should return 401, got ${r3.status}`));
  }
}

async function testChangePassword(token) {
  console.log(BOLD('\n══════════════════════════════════════'));
  console.log(BOLD(' 5. Change Password Field Name Bug'));
  console.log(BOLD('══════════════════════════════════════'));

  // OLD bug: sending "currentPassword" — backend expects "oldPassword"
  const r1 = await request('PUT', '/auth/change-password',
    { currentPassword: 'password123', newPassword: 'password123' }, token);
  if (!r1.body.success) {
    console.log(pass(`Bug confirmed: "currentPassword" field correctly rejected — ${r1.body.message}`));
  } else {
    console.log(fail('"currentPassword" should have been rejected (bug still present!)'));
  }

  // FIXED: sending "oldPassword"
  const r2 = await request('PUT', '/auth/change-password',
    { oldPassword: 'password123', newPassword: 'password123' }, token);
  if (r2.status === 200 && r2.body.success) {
    console.log(pass(`Fix works: "oldPassword" field accepted — ${r2.body.message}`));
  } else {
    console.log(fail(`Fix broken: "oldPassword" still failing — HTTP ${r2.status} — ${r2.body.message}`));
  }
}

async function testValidation() {
  console.log(BOLD('\n══════════════════════════════════════'));
  console.log(BOLD(' 6. Login Validation'));
  console.log(BOLD('══════════════════════════════════════'));

  const cases = [
    { body: {}, label: 'Empty body' },
    { body: { email: 'notanemail', password: '123' }, label: 'Invalid email format' },
    { body: { email: 'admin@hasarutrading.com' }, label: 'Missing password' },
    { body: { password: 'password123' }, label: 'Missing email' },
  ];

  for (const c of cases) {
    const r = await request('POST', '/auth/login', c.body);
    if (r.status === 400) {
      console.log(pass(`${c.label} → 400 Bad Request`));
    } else if (r.status === 401) {
      console.log(pass(`${c.label} → 401 Unauthorized`));
    } else {
      console.log(fail(`${c.label} → HTTP ${r.status} (expected 400/401)`));
      if (r.body.message) console.log(`  ${RED(r.body.message)}`);
    }
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(CYAN(BOLD('\n  Hasaru Trading — Login & Auth Debug Test')));
  console.log(CYAN(`  API: ${API_BASE}\n`));

  try {
    await testHealth();
    const adminToken = await testBatchLogins();
    await testWrongCredentials();
    if (adminToken) {
      await testProtectedRoute(adminToken);
      await testChangePassword(adminToken);
    } else {
      console.log(YELLOW('\n⚠ Skipping JWT & change-password tests — no admin token obtained'));
    }
    await testValidation();

    console.log(BOLD('\n══════════════════════════════════════'));
    console.log(BOLD(' Done.'));
    console.log(BOLD('══════════════════════════════════════\n'));
  } catch (e) {
    console.error(RED(`\nUnhandled error: ${e.message}`));
    console.error(e.stack);
    process.exit(1);
  }
}

main();
