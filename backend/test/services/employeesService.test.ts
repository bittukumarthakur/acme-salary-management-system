import { createEmployee, getEmployeeById } from '../../src/services/employeesService';
import { prisma } from '../../lib/prisma';
import { aliceRow } from '../data/employeeRows';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    employee: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    employeeSalaryStructure: {
      create: jest.fn(),
    },
    salaryComponent: {
      findUnique: jest.fn(),
    },
    employeeSalaryComponent: {
      create: jest.fn(),
    },
    bankAccount: {
      create: jest.fn(),
    },
    department: {
      findUnique: jest.fn(),
    },
    designation: {
      upsert: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  $transaction: jest.Mock;
  employee: {
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
  };
  employeeSalaryStructure: {
    create: jest.Mock;
  };
  salaryComponent: {
    findUnique: jest.Mock;
  };
  employeeSalaryComponent: {
    create: jest.Mock;
  };
  bankAccount: {
    create: jest.Mock;
  };
  department: {
    findUnique: jest.Mock;
  };
  designation: {
    upsert: jest.Mock;
  };
};

describe('createEmployee', () => {
  const payload = {
    employee: {
      fullName: 'Ari Example',
      email: 'ari@example.com',
      phoneNumber: '+919999999999',
      dateOfBirth: '1993-01-10',
      gender: 'FEMALE',
      department: 'ENGINEERING',
      designation: 'Engineer',
      joiningDate: '2023-01-11',
      employmentType: 'PERMANENT',
    },
    salaryStructure: {
      basicSalary: 100000,
      currency: 'INR',
      effectiveDate: '2023-01-11',
      pfApplicable: false,
      esiApplicable: false,
    },
    bankAccounts: [
      {
        bankName: 'HDFC Bank',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Ari Example',
        accountType: 'SAVINGS',
        isPrimary: true,
        isActive: true,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedPrisma.$transaction.mockImplementation(
      async (
        callback: (
          tx: typeof mockedPrisma,
        ) => ReturnType<(typeof mockedPrisma)['employee']['create']>,
      ) => callback(mockedPrisma),
    );
  });

  it('persists the employee with relationship mapping and returns API contract shape', async () => {
    mockedPrisma.department.findUnique.mockResolvedValue({
      id: 'DEPT-ENG',
      name: 'ENGINEERING',
    });
    mockedPrisma.designation.upsert.mockResolvedValue({
      id: 'DES-ENG',
      title: 'Engineer',
    });
    const createdEmployee = {
      id: 120,
      employeeId: 'TMP-abc',
      name: 'Ari Example',
      email: 'ari@example.com',
      country: 'India',
      departmentId: 'DEPT-ENG',
      department: { id: 'DEPT-ENG', name: 'ENGINEERING' },
      designationId: 'DES-ENG',
      designation: { id: 'DES-ENG', title: 'Engineer' },
      employmentType: 'PERMANENT',
      joiningDate: new Date('2023-01-11T00:00:00.000Z'),
      status: 'ACTIVE',
      basicSalary: 100000,
      currency: 'INR',
      avatarUrl: null,
    };

    const updatedEmployee = {
      ...createdEmployee,
      employeeId: 'EMP00120',
    };

    mockedPrisma.employee.create.mockResolvedValue(createdEmployee);
    mockedPrisma.employee.update.mockResolvedValue(updatedEmployee);

    const result = await createEmployee(payload);

    expect(mockedPrisma.employee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: expect.stringMatching(/^TMP-/),
          name: 'Ari Example',
          departmentId: 'DEPT-ENG',
          designationId: 'DES-ENG',
          basicSalary: 100000,
          country: 'India',
          currency: 'INR',
        }),
      }),
    );
    expect(mockedPrisma.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 120 },
        data: { employeeId: 'EMP00120' },
      }),
    );
    expect(mockedPrisma.employeeSalaryStructure.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          basicSalary: 100000,
          currency: 'INR',
        }),
      }),
    );
    expect(mockedPrisma.bankAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bankName: 'HDFC Bank',
          accountType: 'SAVINGS',
        }),
      }),
    );

    expect(result).toMatchObject({
      employeeId: 'EMP00120',
      fullName: 'Ari Example',
      department: 'ENGINEERING',
      designation: 'Engineer',
      currency: 'INR',
      status: 'ACTIVE',
    });
  });

  it('creates PF and ESI deduction components when their toggles are enabled', async () => {
    mockedPrisma.department.findUnique.mockResolvedValue({
      id: 'DEPT-ENG',
      name: 'ENGINEERING',
    });
    mockedPrisma.designation.upsert.mockResolvedValue({
      id: 'DES-ENG',
      title: 'Engineer',
    });
    const createdEmployee = {
      id: 120,
      employeeId: 'TMP-abc',
      name: 'Ari Example',
      email: 'ari@example.com',
      country: 'India',
      departmentId: 'DEPT-ENG',
      department: { id: 'DEPT-ENG', name: 'ENGINEERING' },
      designationId: 'DES-ENG',
      designation: { id: 'DES-ENG', title: 'Engineer' },
      employmentType: 'PERMANENT',
      joiningDate: new Date('2023-01-11T00:00:00.000Z'),
      status: 'ACTIVE',
      basicSalary: 100000,
      currency: 'INR',
      avatarUrl: null,
    };

    mockedPrisma.employee.create.mockResolvedValue(createdEmployee);
    mockedPrisma.employee.update.mockResolvedValue({
      ...createdEmployee,
      employeeId: 'EMP00120',
    });
    mockedPrisma.employeeSalaryStructure.create.mockResolvedValue({ id: 1 });
    mockedPrisma.salaryComponent.findUnique.mockImplementation(
      async ({ where }: { where: { name: string } }) =>
        where.name === 'PF'
          ? { id: 'COMP-PF' }
          : where.name === 'ESI'
            ? { id: 'COMP-ESI' }
            : where.name === 'Allowances'
              ? { id: 'COMP-ALLOW' }
              : null,
    );

    await createEmployee({
      employee: payload.employee,
      salaryStructure: {
        basicSalary: 100000,
        effectiveDate: '2023-01-11',
        pfApplicable: true,
        esiApplicable: true,
        allowances: 5000,
      },
    });

    expect(mockedPrisma.employeeSalaryComponent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: 120,
          salaryComponentId: 'COMP-ALLOW',
          amount: 5000,
        }),
      }),
    );
    expect(mockedPrisma.employeeSalaryComponent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: 120,
          salaryComponentId: 'COMP-PF',
          amount: 12000,
        }),
      }),
    );
    expect(mockedPrisma.employeeSalaryComponent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: 120,
          salaryComponentId: 'COMP-ESI',
          amount: 750,
        }),
      }),
    );
  });

  it('does not create deduction components when PF and ESI toggles are disabled', async () => {
    mockedPrisma.department.findUnique.mockResolvedValue({
      id: 'DEPT-ENG',
      name: 'ENGINEERING',
    });
    mockedPrisma.designation.upsert.mockResolvedValue({
      id: 'DES-ENG',
      title: 'Engineer',
    });
    const createdEmployee = {
      id: 120,
      employeeId: 'TMP-abc',
      name: 'Ari Example',
      email: 'ari@example.com',
      country: 'India',
      departmentId: 'DEPT-ENG',
      department: { id: 'DEPT-ENG', name: 'ENGINEERING' },
      designationId: 'DES-ENG',
      designation: { id: 'DES-ENG', title: 'Engineer' },
      employmentType: 'PERMANENT',
      joiningDate: new Date('2023-01-11T00:00:00.000Z'),
      status: 'ACTIVE',
      basicSalary: 100000,
      currency: 'INR',
      avatarUrl: null,
    };

    mockedPrisma.employee.create.mockResolvedValue(createdEmployee);
    mockedPrisma.employee.update.mockResolvedValue({
      ...createdEmployee,
      employeeId: 'EMP00120',
    });
    mockedPrisma.employeeSalaryStructure.create.mockResolvedValue({ id: 1 });

    await createEmployee({
      employee: payload.employee,
      salaryStructure: { basicSalary: 100000, pfApplicable: false, esiApplicable: false },
    });

    expect(mockedPrisma.salaryComponent.findUnique).not.toHaveBeenCalled();
    expect(mockedPrisma.employeeSalaryComponent.create).not.toHaveBeenCalled();
  });

  it('maps unique-constraint conflicts to duplicate employee ID error', async () => {
    mockedPrisma.$transaction.mockRejectedValue({ code: 'P2002' });

    await expect(createEmployee(payload)).rejects.toThrow('EMPLOYEE_ID_ALREADY_EXISTS');
  });

  it('accepts payload when optional salary and bank fields are omitted', async () => {
    const minimalPayload = {
      employee: payload.employee,
      salaryStructure: {
        basicSalary: 100000,
      },
    };

    mockedPrisma.department.findUnique.mockResolvedValue({
      id: 'DEPT-ENG',
      name: 'ENGINEERING',
    });
    mockedPrisma.designation.upsert.mockResolvedValue({
      id: 'DES-ENG',
      title: 'Engineer',
    });
    const createdEmployee = {
      id: 120,
      employeeId: 'TMP-abc',
      name: 'Ari Example',
      email: 'ari@example.com',
      country: 'India',
      departmentId: 'DEPT-ENG',
      department: { id: 'DEPT-ENG', name: 'ENGINEERING' },
      designationId: 'DES-ENG',
      designation: { id: 'DES-ENG', title: 'Engineer' },
      employmentType: 'PERMANENT',
      joiningDate: new Date('2023-01-11T00:00:00.000Z'),
      status: 'ACTIVE',
      basicSalary: 100000,
      currency: 'INR',
      avatarUrl: null,
    };
    const updatedEmployee = {
      ...createdEmployee,
      employeeId: 'EMP00120',
    };

    mockedPrisma.employee.create.mockResolvedValue(createdEmployee);
    mockedPrisma.employee.update.mockResolvedValue(updatedEmployee);
    mockedPrisma.employeeSalaryStructure.create.mockResolvedValue({ id: 1 });

    const result = await createEmployee(minimalPayload);

    expect(result.employeeId).toBe('EMP00120');
    expect(mockedPrisma.bankAccount.create).not.toHaveBeenCalled();
  });

  it('defaults bank details when only an account number is provided', async () => {
    mockedPrisma.department.findUnique.mockResolvedValue({
      id: 'DEPT-ENG',
      name: 'ENGINEERING',
    });
    mockedPrisma.designation.upsert.mockResolvedValue({
      id: 'DES-ENG',
      title: 'Engineer',
    });
    const createdEmployee = {
      id: 120,
      employeeId: 'TMP-abc',
      name: 'Ari Example',
      email: 'ari@example.com',
      country: 'India',
      departmentId: 'DEPT-ENG',
      department: { id: 'DEPT-ENG', name: 'ENGINEERING' },
      designationId: 'DES-ENG',
      designation: { id: 'DES-ENG', title: 'Engineer' },
      employmentType: 'PERMANENT',
      joiningDate: new Date('2023-01-11T00:00:00.000Z'),
      status: 'ACTIVE',
      basicSalary: 100000,
      currency: 'INR',
      avatarUrl: null,
    };

    mockedPrisma.employee.create.mockResolvedValue(createdEmployee);
    mockedPrisma.employee.update.mockResolvedValue({
      ...createdEmployee,
      employeeId: 'EMP00120',
    });
    mockedPrisma.employeeSalaryStructure.create.mockResolvedValue({ id: 1 });

    await createEmployee({
      employee: payload.employee,
      salaryStructure: { basicSalary: 100000 },
      bankAccounts: [{ accountNumber: '123456789012' }],
    });

    expect(mockedPrisma.bankAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accountNumber: '123456789012',
          accountHolderName: 'Ari Example',
          bankName: '',
          ifscCode: '',
          accountType: 'SAVINGS',
          isPrimary: true,
          isActive: true,
        }),
      }),
    );
  });
});

describe('getEmployeeById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null for empty employee id without querying prisma', async () => {
    const result = await getEmployeeById('');

    expect(result).toBeNull();
    expect(mockedPrisma.employee.findUnique).not.toHaveBeenCalled();
  });

  it('finds an employee by employeeId and maps to details API shape', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue({
      ...aliceRow,
      phoneNumber: '+919876543210',
      dateOfBirth: new Date('1990-05-20T00:00:00.000Z'),
      gender: 'FEMALE',
      bankAccounts: [{ accountNumber: 'ACC-000123' }],
      salaryStructures: [
        {
          basicSalary: 60000,
          currency: 'INR',
          effectiveDate: new Date('2024-04-01T00:00:00.000Z'),
        },
      ],
      salaryComponents: [
        {
          amount: 60000,
          component: {
            name: 'Basic Salary',
            type: 'EARNING',
          },
        },
        {
          amount: 200,
          component: {
            name: 'Professional Tax',
            type: 'DEDUCTION',
          },
        },
      ],
    });

    const result = await getEmployeeById('EMP00001');

    expect(mockedPrisma.employee.findUnique).toHaveBeenCalledWith({
      where: { employeeId: 'EMP00001' },
      include: {
        department: {
          select: { id: true, name: true },
        },
        designation: {
          select: { id: true, title: true },
        },
        bankAccounts: {
          where: { isActive: true },
          orderBy: { isPrimary: 'desc' },
          take: 1,
          select: {
            accountNumber: true,
          },
        },
        salaryStructures: {
          orderBy: [{ effectiveDate: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            basicSalary: true,
            currency: true,
            effectiveDate: true,
          },
        },
        salaryComponents: {
          where: { endDate: null },
          select: {
            amount: true,
            component: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });
    expect(result).toMatchObject({
      summary: {
        employeeId: 'EMP00001',
        fullName: 'Alice Johnson',
        department: 'ENGINEERING',
        designation: 'SENIOR_DEVELOPER',
      },
      overview: {
        personalInformation: {
          employeeId: 'EMP00001',
          dateOfBirth: '20 May 1990',
          gender: 'FEMALE',
        },
      },
      salaryStructure: {
        currency: 'INR',
        baseSalaryMonthly: 60000,
      },
    });
  });

  it('includes Basic Salary once plus earning components in the totals', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue({
      ...aliceRow,
      salaryStructures: [
        {
          basicSalary: 50000,
          currency: 'INR',
          effectiveDate: new Date('2026-07-02T00:00:00.000Z'),
        },
      ],
      salaryComponents: [
        { amount: 10000, component: { name: 'Allowances', type: 'EARNING' } },
        { amount: 6000, component: { name: 'PF', type: 'DEDUCTION' } },
      ],
    });

    const result = await getEmployeeById('EMP00001');

    expect(result?.salaryStructure.earnings).toEqual([
      { component: 'Basic Salary', amount: 50000 },
      { component: 'Allowances', amount: 10000 },
    ]);
    expect(result?.salaryStructure.totalEarnings).toBe(60000);
    expect(result?.salaryStructure.netPayMonthly).toBe(54000);
    expect(result?.salaryStructure.ctcAnnual).toBe(720000);
  });

  it('does not double-count when a Basic Salary earning component exists', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue({
      ...aliceRow,
      salaryStructures: [
        {
          basicSalary: 50000,
          currency: 'INR',
          effectiveDate: new Date('2026-07-02T00:00:00.000Z'),
        },
      ],
      salaryComponents: [
        { amount: 50000, component: { name: 'Basic Salary', type: 'EARNING' } },
        { amount: 6000, component: { name: 'PF', type: 'DEDUCTION' } },
      ],
    });

    const result = await getEmployeeById('EMP00001');

    expect(result?.salaryStructure.earnings).toEqual([
      { component: 'Basic Salary', amount: 50000 },
    ]);
    expect(result?.salaryStructure.totalEarnings).toBe(50000);
    expect(result?.salaryStructure.ctcAnnual).toBe(600000);
  });

  it('returns null for non-EMP style ids', async () => {
    const result = await getEmployeeById('1234');

    expect(result).toBeNull();
    expect(mockedPrisma.employee.findUnique).not.toHaveBeenCalled();
  });

  it('normalizes lowercase employee id before querying', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue(aliceRow);

    await getEmployeeById('emp00001');

    expect(mockedPrisma.employee.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { employeeId: 'EMP00001' },
      }),
    );
  });

  it('returns null when employee is not found', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue(null);

    const result = await getEmployeeById('EMP404');

    expect(result).toBeNull();
  });
});
