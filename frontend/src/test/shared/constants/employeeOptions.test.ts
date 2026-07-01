import { describe, expect, it } from 'vitest'
import {
  departmentOptions,
  employmentTypeOptions,
} from '../../../shared/constants/employeeOptions'

describe('shared employee options', () => {
  describe('departmentOptions', () => {
    it('uses UPPERCASE values matching the backend department enum', () => {
      expect(departmentOptions.map((option) => option.value)).toEqual([
        'ENGINEERING',
        'MARKETING',
        'FINANCE',
        'HR',
        'SALES',
      ])
    })

    it('exposes human-friendly labels', () => {
      expect(departmentOptions.map((option) => option.label)).toEqual([
        'Engineering',
        'Marketing',
        'Finance',
        'HR',
        'Sales',
      ])
    })
  })

  describe('employmentTypeOptions', () => {
    it('covers all four backend employment types', () => {
      expect(employmentTypeOptions.map((option) => option.value)).toEqual([
        'PERMANENT',
        'CONTRACT',
        'TEMPORARY',
        'INTERN',
      ])
    })

    it('uses consistent, user-facing labels', () => {
      expect(employmentTypeOptions.map((option) => option.label)).toEqual([
        'Full Time',
        'Contract',
        'Part Time',
        'Intern',
      ])
    })
  })
})
