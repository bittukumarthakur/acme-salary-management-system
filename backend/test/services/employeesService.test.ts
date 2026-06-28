import { createEmployee } from '../../src/services/employeesService';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    employee: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    employeeSalaryStructure: {
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
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  employeeSalaryStructure: {
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
      maritalStatus: 'SINGLE',
      employeeId: 'EMP00120',
      department: 'ENGINEERING',
      designation: 'Engineer',
      joiningDate: '2023-01-11',
      reportingManagerEmployeeId: 'EMP00010',
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
    mockedPrisma.employee.findUnique.mockResolvedValue(null);
    mockedPrisma.department.findUnique.mockResolvedValue({
      id: 'DEPT-ENG',
      name: 'ENGINEERING',
    });
    mockedPrisma.designation.upsert.mockResolvedValue({
      id: 'DES-ENG',
      title: 'Engineer',
    });
    mockedPrisma.employee.create.mockResolvedValue({
      id: 120,
      employeeId: 'EMP00120',
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
    });

    const result = await createEmployee(payload);

    expect(mockedPrisma.employee.findUnique).toHaveBeenCalledWith({
      where: { employeeId: 'EMP00120' },
      select: { id: true },
    });
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
    expect(mockedPrisma.employee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: 'EMP00120',
          name: 'Ari Example',
          departmentId: 'DEPT-ENG',
          designationId: 'DES-ENG',
          basicSalary: 100000,
          country: 'India',
          currency: 'INR',
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

  it('throws duplicate error when employee ID already exists', async () => {
    mockedPrisma.employee.findUnique.mockResolvedValue({ id: 1 });

    await expect(createEmployee(payload)).rejects.toThrow('EMPLOYEE_ID_ALREADY_EXISTS');

    expect(mockedPrisma.employee.create).not.toHaveBeenCalled();
    expect(mockedPrisma.employeeSalaryStructure.create).not.toHaveBeenCalled();
  });

  it('accepts payload when optional salary and bank fields are omitted', async () => {
    const minimalPayload = {
      employee: payload.employee,
      salaryStructure: {
        basicSalary: 100000,
      },
    };

    mockedPrisma.employee.findUnique.mockResolvedValue(null);
    mockedPrisma.department.findUnique.mockResolvedValue({
      id: 'DEPT-ENG',
      name: 'ENGINEERING',
    });
    mockedPrisma.designation.upsert.mockResolvedValue({
      id: 'DES-ENG',
      title: 'Engineer',
    });
    mockedPrisma.employee.create.mockResolvedValue({
      id: 120,
      employeeId: 'EMP00120',
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
    });
    mockedPrisma.employeeSalaryStructure.create.mockResolvedValue({ id: 1 });

    const result = await createEmployee(minimalPayload);

    expect(result.employeeId).toBe('EMP00120');
    expect(mockedPrisma.bankAccount.create).not.toHaveBeenCalled();
  });
});
