/**
 * Master Data Seeder
 *
 * Seeds master data tables (prerequisites for employee seeding):
 * 1. Department
 * 2. Designation
 * 3. SalaryComponent
 *
 * Run this FIRST before seeding employees.
 * Usage: tsx scripts/seedMasterData.ts
 */

import { prisma } from '../lib/prisma';
import {
  DEPARTMENTS,
  DESIGNATIONS,
  SALARY_COMPONENTS,
} from './masterData';

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedDepartments() {
  console.log('📂 Seeding departments...');

  const departments = await prisma.department.createMany({
    data: DEPARTMENTS,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${departments.count} departments`);
}

async function seedDesignations() {
  console.log('🎯 Seeding designations...');

  const designations = await prisma.designation.createMany({
    data: DESIGNATIONS,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${designations.count} designations`);
}

async function seedSalaryComponents() {
  console.log('💰 Seeding salary components...');

  const components = await prisma.salaryComponent.createMany({
    data: SALARY_COMPONENTS,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${components.count} salary components`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n🌱 Phase 1 Master Data Seeding Started\n');

  try {
    // Note: We don't delete master data here to avoid FK constraint violations
    // from employees that reference departments/designations/components.
    // The functions below use skipDuplicates: true for idempotency.
    console.log('ℹ️  Seeding master data (existing records will be skipped)...\n');

    // Seed master data in order
    await seedDepartments();
    await seedDesignations();
    await seedSalaryComponents();

    console.log('\n✨ Master data seeding complete!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
