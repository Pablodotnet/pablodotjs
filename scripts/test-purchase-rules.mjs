// Run against a Firestore emulator loaded with firestore.rules:
// FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/test-purchase-rules.mjs
import assert from 'node:assert/strict'

const host = process.env.FIRESTORE_EMULATOR_HOST
assert.ok(host, 'FIRESTORE_EMULATOR_HOST is required; never run against production.')
const project = 'demo-navidad'
const base = `http://${host}/v1/projects/${project}/databases/(default)/documents`

function token(uid) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
    sub: uid, user_id: uid, aud: project,
    iss: `https://securetoken.google.com/${project}`,
    iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600,
  })}.`
}

function fields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key,
    typeof value === 'boolean' ? { booleanValue: value }
      : typeof value === 'number' ? { integerValue: String(value) }
        : { stringValue: value },
  ]))
}

async function request(path, uid, method = 'GET', data, mask = []) {
  const params = new URLSearchParams()
  for (const key of mask) params.append('updateMask.fieldPaths', key)
  return fetch(`${base}/${path}?${params}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(uid ? { Authorization: `Bearer ${uid === 'admin' ? 'owner' : token(uid)}` } : {}),
    },
    ...(data ? { body: JSON.stringify({ fields: fields(data) }) } : {}),
  })
}

let checks = 0
async function expect(response, status) {
  assert.equal(response.status, status, await response.text())
  checks++
}

const prefix = `purchase-test-${Date.now()}`
const owner = `${prefix}-owner`
const buyer = `${prefix}-buyer`
const other = `${prefix}-other`
const wish = `wishes/${prefix}`
const wishData = {
  ownerUid: owner, ownerName: 'Familiar', familyCode: prefix,
  titulo: 'Regalo', url: 'https://example.com/regalo', tienda: 'otro', createdAt: Date.now(),
}
const created = []
try {
  for (const [uid, familyCode] of [[owner, prefix], [buyer, prefix], [other, 'otra-familia']]) {
    created.push(`users/${uid}`)
    await expect(await request(`users/${uid}`, 'admin', 'PATCH', { uid, familyCode }), 200)
  }
  created.push(wish)
  // Legacy wishes without comprado remain purchasable.
  await expect(await request(wish, owner, 'PATCH', wishData), 200)
  await expect(await request(wish, buyer), 200)
  await expect(await request(wish, other), 403)
  await expect(await request(wish, null), 403)
  const familyQuery = {
    structuredQuery: {
      from: [{ collectionId: 'wishes' }],
      where: { compositeFilter: { op: 'AND', filters: [
        { fieldFilter: { field: { fieldPath: 'ownerUid' }, op: 'EQUAL', value: { stringValue: owner } } },
        { fieldFilter: { field: { fieldPath: 'familyCode' }, op: 'EQUAL', value: { stringValue: prefix } } },
      ] } },
    },
  }
  for (const [uid, status] of [[owner, 200], [buyer, 200], [other, 403]]) {
    await expect(await fetch(`${base}:runQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token(uid)}` },
      body: JSON.stringify(familyQuery),
    }), status)
  }
  await expect(await request(wish, owner, 'PATCH', { comprado: true }, ['comprado']), 403)
  await expect(await request(wish, other, 'PATCH', { comprado: true }, ['comprado']), 403)
  await expect(await request(wish, null, 'PATCH', { comprado: true }, ['comprado']), 403)
  await expect(await request(wish, buyer, 'PATCH', { comprado: 'true' }, ['comprado']), 403)
  await expect(await request(wish, buyer, 'PATCH', { comprado: true, titulo: 'Alterado' }, ['comprado', 'titulo']), 403)
  await expect(await request(wish, buyer, 'PATCH', { comprado: true, buyerUid: buyer }, ['comprado', 'buyerUid']), 403)
  await expect(await request(wish, buyer, 'PATCH', { ownerUid: buyer }, ['ownerUid']), 403)

  // Concurrent purchase attempts: only one state transition can succeed.
  const purchases = await Promise.all([
    request(wish, buyer, 'PATCH', { comprado: true }, ['comprado']),
    request(wish, buyer, 'PATCH', { comprado: true }, ['comprado']),
  ])
  assert.deepEqual(purchases.map((r) => r.status).sort(), [200, 403])
  checks++
  const saved = await (await request(wish, buyer)).json()
  assert.deepEqual(saved.fields, fields({ ...wishData, comprado: true }))
  checks++
  await expect(await request(wish, buyer, 'PATCH', { comprado: false }, ['comprado']), 403)
  await expect(await request(wish, owner, 'PATCH', { comprado: false }, ['comprado']), 403)
  await expect(await request(wish, owner, 'PATCH', { titulo: 'Nuevo título' }, ['titulo']), 200)
  await expect(await request(wish, buyer, 'DELETE'), 403)
  await expect(await request(wish, owner, 'DELETE'), 200)
  await expect(await request(wish, owner, 'PATCH', { ...wishData, comprado: true }), 403)
  await expect(await request(wish, owner, 'PATCH', { ...wishData, buyerUid: buyer }), 403)
  await expect(await request(wish, buyer, 'PATCH', wishData), 403)
  console.log(`${checks} purchase rule checks passed.`)
} finally {
  for (const path of created) await request(path, 'admin', 'DELETE')
}
