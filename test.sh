#!/bin/bash
set -e

echo "=== Backend Unit Tests ==="
cd backend
npm ci
npx prisma generate
npm test
cd ..

echo "=== Frontend Tests ==="
cd frontend
npm install
npm test -- --run
cd ..

echo "=== All tests passed ==="
