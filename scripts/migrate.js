#!/usr/bin/env node

/**
 * MONOPOL STUDIO - Database Migration Script
 * Generates Prisma migrations
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function migrate() {
  console.log('🔄 Running database migrations...\n');

  try {
    // Generate migrations
    console.log('📝 Generating migration from schema...');
    await execAsync('npx prisma migrate dev --name init');

    console.log('✅ Database migration successful!\n');
    console.log('📊 Opening Prisma Studio...');
    await execAsync('npx prisma studio');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
