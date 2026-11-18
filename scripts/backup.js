import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import mongoose from 'mongoose';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'cyberthink';

if (!uri) {
  console.error('ERROR: MONGODB_URI no esta definida.');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = resolve(root, 'backups', stamp);

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function main() {
  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 15000,
  });

  const db = mongoose.connection.db;
  const collections = (await db.listCollections().toArray())
    .map((collection) => collection.name)
    .sort();

  mkdirSync(outDir, { recursive: true });

  const manifest = {
    createdAt: new Date().toISOString(),
    database: db.databaseName,
    collections: [],
  };

  for (const name of collections) {
    const docs = await db.collection(name).find({}).toArray();
    const json = JSON.stringify(docs, null, 2);
    const file = resolve(outDir, `${name}.json`);

    writeFileSync(file, json, 'utf8');

    manifest.collections.push({
      name,
      documents: docs.length,
      bytes: statSync(file).size,
      sha256: sha256(readFileSync(file)),
    });
  }

  writeFileSync(
    resolve(outDir, '_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );

  const errors = [];

  for (const entry of manifest.collections) {
    const raw = readFileSync(resolve(outDir, `${entry.name}.json`), 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length !== entry.documents) {
      errors.push(`${entry.name}: la cantidad de documentos no coincide`);
    }

    if (sha256(Buffer.from(raw, 'utf8')) !== entry.sha256) {
      errors.push(`${entry.name}: el hash no coincide`);
    }
  }

  console.log(`Respaldo: ${outDir}`);
  console.log(`Base de datos: ${manifest.database}`);

  for (const entry of manifest.collections) {
    console.log(`- ${entry.name}: ${entry.documents} documentos (${entry.bytes} bytes)`);
  }

  if (errors.length) {
    console.error('Verificacion FALLIDA:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(2);
  }

  console.log('Verificacion: OK');
}

try {
  await main();
} catch (error) {
  console.error('ERROR durante el respaldo:', error.message);
  process.exit(1);
} finally {
  await mongoose.disconnect().catch(() => {});
}
