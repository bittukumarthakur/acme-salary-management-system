import { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Stack,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import type { EmployeeDetailsResponse } from '../../types/employees'
import { SalaryBreakdownSection } from '../details'
import { formatCurrencyWithCode } from '../../../../shared/utils/formatters'
import {
  type EditEmployeeFormErrors,
  type EditEmployeeFormState,
  type EditEmployeeSetField,
} from '../../pages/editEmployeeForm'

const salaryHeaderSx = { fontSize: '1.05rem', fontWeight: 700 }
const PF_RATE = 0.12

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100
}

function isBaseSalaryComponent(component: string) {
  return component.toLowerCase().includes('basic salary')
}

function isPfComponent(component: string) {
  const normalized = component.toLowerCase()
  return normalized === 'pf' || normalized.includes('provident fund')
}

interface EditEmployeeSalarySectionProps {
  form: EditEmployeeFormState
  errors: EditEmployeeFormErrors
  salaryStructure: EmployeeDetailsResponse['salaryStructure']
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
  onFieldChange: EditEmployeeSetField
}

export function EditEmployeeSalarySection({
  form,
  errors,
  salaryStructure,
  onFieldBlur,
  onFieldChange,
}: EditEmployeeSalarySectionProps) {
  const hasBasicSalaryInEarnings = useMemo(
    () =>
      salaryStructure.earnings.some((item) =>
        isBaseSalaryComponent(item.component),
      ),
    [salaryStructure.earnings],
  )

  const editedBaseMonthlySalary = useMemo(() => {
    const numericValue = Number(form.baseMonthlySalary)
    return Number.isNaN(numericValue)
      ? salaryStructure.baseSalaryMonthly
      : numericValue
  }, [form.baseMonthlySalary, salaryStructure.baseSalaryMonthly])

  const editableEarnings = useMemo(() => {
    const sourceEarnings = salaryStructure.earnings.filter(
      (item) => !isBaseSalaryComponent(item.component),
    )

    if (sourceEarnings.length === 0) {
      return salaryStructure.earnings
    }

    return sourceEarnings.map((item) => {
      const editedAmount = form.earnings[item.component]
      const numericAmount = Number(editedAmount)

      return {
        ...item,
        amount:
          editedAmount !== undefined && !Number.isNaN(numericAmount)
            ? numericAmount
            : item.amount,
      }
    })
  }, [form.earnings, salaryStructure.earnings])

  const editedEarningsForSummary = useMemo(() => {
    if (!hasBasicSalaryInEarnings) {
      return editableEarnings
    }

    const baseComponent =
      salaryStructure.earnings.find((item) =>
        isBaseSalaryComponent(item.component),
      )?.component ?? 'Basic Salary'

    return [
      { component: baseComponent, amount: editedBaseMonthlySalary },
      ...editableEarnings,
    ]
  }, [
    editableEarnings,
    editedBaseMonthlySalary,
    hasBasicSalaryInEarnings,
    salaryStructure.earnings,
  ])

  const editedTotalEarnings = useMemo(
    () => editedEarningsForSummary.reduce((sum, item) => sum + item.amount, 0),
    [editedEarningsForSummary],
  )

  const editedDeductions = useMemo(
    () =>
      salaryStructure.deductions.map((item) =>
        isPfComponent(item.component)
          ? { ...item, amount: roundToTwo(editedBaseMonthlySalary * PF_RATE) }
          : item,
      ),
    [editedBaseMonthlySalary, salaryStructure.deductions],
  )

  const editedTotalDeductions = useMemo(
    () => editedDeductions.reduce((sum, item) => sum + item.amount, 0),
    [editedDeductions],
  )

  const salaryStructureWithEdits = useMemo(() => {
    return {
      ...salaryStructure,
      earnings: editedEarningsForSummary,
      deductions: editedDeductions,
      baseSalaryMonthly: editedBaseMonthlySalary,
      totalEarnings: editedTotalEarnings,
      totalDeductions: editedTotalDeductions,
      netPayMonthly: editedTotalEarnings - editedTotalDeductions,
      ctcAnnual: editedTotalEarnings * 12,
    }
  }, [
    editedDeductions,
    editedEarningsForSummary,
    editedBaseMonthlySalary,
    editedTotalDeductions,
    editedTotalEarnings,
    salaryStructure,
  ])

  const earningsColumn = (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Salary Components (Monthly)
      </Typography>

      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          width: 'fit-content',
          bgcolor: 'rgba(46, 125, 50, 0.12)',
          color: 'success.dark',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Earnings & Allowances
        </Typography>
      </Box>

      <Stack spacing={1.25}>
        {editableEarnings.map((item) => (
          <TextField
            key={item.component}
            label={item.component}
            type="number"
            size="small"
            value={form.earnings[item.component] ?? String(item.amount)}
            onChange={(event) =>
              onFieldChange('earnings', {
                ...form.earnings,
                [item.component]: event.target.value,
              })
            }
            onBlur={() => onFieldBlur('earnings')}
            error={Boolean(errors.earnings)}
            helperText={errors.earnings}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {form.currency || salaryStructure.currency}
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
      </Stack>

      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          bgcolor: 'rgba(46, 125, 50, 0.1)',
          color: 'success.dark',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>Total Earnings</Typography>
        <Typography sx={{ fontWeight: 700 }}>
          {formatCurrencyWithCode(
            editedTotalEarnings,
            form.currency || salaryStructure.currency,
          )}
        </Typography>
      </Box>
    </Stack>
  )

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={salaryHeaderSx}>
            Salary Information
          </Typography>
          <SalaryBreakdownSection
            salaryStructure={salaryStructureWithEdits}
            title="Current Salary Breakdown"
            showTitle={false}
            disableContainerPadding
            earningsColumn={earningsColumn}
            leadingColumn={
              <Box>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={salaryHeaderSx}>
                    Base Salary
                  </Typography>
                  <TextField
                    label="Base Salary (Monthly)"
                    type="number"
                    size="small"
                    value={form.baseMonthlySalary}
                    onChange={(event) =>
                      onFieldChange('baseMonthlySalary', event.target.value)
                    }
                    onBlur={() => onFieldBlur('baseMonthlySalary')}
                    error={Boolean(errors.baseMonthlySalary)}
                    helperText={errors.baseMonthlySalary}
                    fullWidth
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            {form.currency || salaryStructure.currency}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <DatePicker
                    label="Effective From"
                    format="MM/DD/YYYY"
                    value={
                      form.effectiveFrom ? dayjs(form.effectiveFrom) : null
                    }
                    onChange={(value) =>
                      onFieldChange(
                        'effectiveFrom',
                        value ? value.format('YYYY-MM-DD') : '',
                      )
                    }
                    slotProps={{
                      textField: {
                        name: 'select effective from',
                        size: 'small',
                        fullWidth: true,
                        required: true,
                        onBlur: () => onFieldBlur('effectiveFrom'),
                        error: Boolean(errors.effectiveFrom),
                        helperText: errors.effectiveFrom,
                      },
                    }}
                  />
                </Stack>
              </Box>
            }
          />
        </Stack>
      </CardContent>
    </Card>
  )
}

export default EditEmployeeSalarySection
