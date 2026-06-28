import { faker } from '@faker-js/faker';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding payroll records...');
  await prisma.payroll.deleteMany({});

  const payrollRecords = [];
  const now = new Date();

  for (let monthOffset = 11; monthOffset >= 0; monthOffset -= 1) {
    const payoutDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 28);
    const month = payoutDate.toLocaleString('default', { month: 'long' });
    const year = payoutDate.getFullYear();
    const payrollPeriod = `${month} ${year}`;
    const payrollId = `PAY-${year}-${String(payoutDate.getMonth() + 1).padStart(2, '0')}`;
    const totalAmount = faker.number.float({ min: 18000000, max: 30000000, fractionDigits: 2 });
    const totalDeductions = faker.number.float({ min: 2000000, max: 5000000, fractionDigits: 2 });
    const netAmount = totalAmount - totalDeductions;

    payrollRecords.push({
      payrollId,
      payrollPeriod,
      payoutDate,
      status: 'Completed',
      totalAmount,
      totalDeductions,
      netAmount,
      currency: 'INR',
      country: 'IN',
    });
  }

  await prisma.payroll.createMany({ data: payrollRecords });
  console.log(`Payroll seed complete: ${payrollRecords.length} records created.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Payroll seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
