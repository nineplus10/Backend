#!/bin/sh

echo "INFO: Running migration"
npx prisma migrate deploy

echo "INFO: Running the application"
npm run dev
