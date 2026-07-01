import { describe, it, expect } from 'vitest'
import { buildInitialEditEmployeeForm } from '../../../../features/edit-employees/form/editEmployeeForm'
import { employeeDetailsFixture } from '../../../data/employeeDetails'

describe('buildInitialEditEmployeeForm', () => {
  it('defaults effectiveFrom to today so a salary change starts a new revision', () => {
    const todayIso = '2026-07-01'

    const form = buildInitialEditEmployeeForm(employeeDetailsFixture, todayIso)

    expect(form.effectiveFrom).toBe(todayIso)
  })

  it('still pre-populates the current base salary from the details', () => {
    const form = buildInitialEditEmployeeForm(
      employeeDetailsFixture,
      '2026-07-01',
    )

    expect(form.baseMonthlySalary).toBe(
      String(employeeDetailsFixture.salaryStructure.baseSalaryMonthly),
    )
  })

  it('pre-populates date of birth (as ISO) and gender from the details', () => {
    const form = buildInitialEditEmployeeForm(
      employeeDetailsFixture,
      '2026-07-01',
    )

    expect(form.dateOfBirth).toBe('1990-05-20')
    expect(form.gender).toBe('MALE')
  })
})
