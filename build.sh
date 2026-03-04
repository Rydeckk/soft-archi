#!/bin/bash
set -e

echo "=== Build Backend ==="
cd backend
npm ci
npx prisma generate
npm run build
cd ..

echo "=== Build Frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Build Mailer ==="
cd mailer
npm ci
npm run build
cd ..

echo "=== Build complete ==="
