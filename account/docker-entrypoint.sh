#!/bin/sh


echo "INFO: Running migration"
cd ./account
npx prisma migrate deploy

echo "INFO: Running the application"
cd ..
npm run dev -w account
