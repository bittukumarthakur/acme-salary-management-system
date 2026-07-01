/**
 * Syncs an employee's editable earning components for a given effective date.
 *
 * Closes prior open-ended earnings, removes deselected components on the target
 * date, and upserts the selected earning amounts. Used by the employee update
 * flow (see updateEmployeeService).
 */

import { prisma } from '../../lib/prisma';

export async function syncEditableEarnings(
  employeeId: number,
  effectiveFromDate: Date,
  earnings: Array<{ component: string; amount: number }>,
): Promise<void> {
  const normalized = new Map<string, number>();

  earnings.forEach((item) => {
    const component = item.component.trim();
    if (!component) {
      return;
    }
    normalized.set(component, item.amount);
  });

  if (normalized.size === 0) {
    return;
  }

  const components = await prisma.salaryComponent.findMany({
    where: {
      type: 'EARNING',
      isActive: true,
      name: {
        in: Array.from(normalized.keys()),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const componentByName = new Map(components.map((component) => [component.name, component]));
  const missing = Array.from(normalized.keys()).filter((name) => !componentByName.has(name));

  if (missing.length > 0) {
    throw new Error(`Earning component(s) not found: ${missing.join(', ')}`);
  }

  const selectedComponentIds = components.map((component) => component.id);

  await prisma.employeeSalaryComponent.updateMany({
    where: {
      employeeId,
      endDate: null,
      effectiveDate: {
        lt: effectiveFromDate,
      },
      component: {
        type: 'EARNING',
      },
    },
    data: {
      endDate: effectiveFromDate,
    },
  });

  await prisma.employeeSalaryComponent.deleteMany({
    where: {
      employeeId,
      effectiveDate: effectiveFromDate,
      component: {
        type: 'EARNING',
      },
      salaryComponentId: {
        notIn: selectedComponentIds,
      },
    },
  });

  await Promise.all(
    Array.from(normalized.entries()).map(async ([componentName, amount]) => {
      const component = componentByName.get(componentName);
      if (!component) {
        return;
      }

      const existing = await prisma.employeeSalaryComponent.findFirst({
        where: {
          employeeId,
          salaryComponentId: component.id,
          effectiveDate: effectiveFromDate,
        },
        select: {
          id: true,
        },
      });

      if (existing) {
        await prisma.employeeSalaryComponent.update({
          where: { id: existing.id },
          data: {
            amount,
            endDate: null,
          },
        });
        return;
      }

      await prisma.employeeSalaryComponent.create({
        data: {
          employeeId,
          salaryComponentId: component.id,
          amount,
          effectiveDate: effectiveFromDate,
          endDate: null,
        },
      });
    }),
  );
}
