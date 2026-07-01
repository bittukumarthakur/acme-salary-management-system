import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { EmployeeStatusChip } from '../../../employees/components/EmployeeStatusChip'
import type { EmployeeDetailsResponse } from '../../../employees/types/employees'
import { JobInfoRow } from './DetailPrimitives'
import { SalaryBreakdownSection } from './SalaryBreakdownSection'
import { getDisplayValue } from './utils'

function PersonalInfoRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <Stack
      direction="row"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '120px minmax(0, 1fr)',
          sm: '150px minmax(0, 1fr)',
        },
        columnGap: 2,
        alignItems: 'start',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.5 }}
      >
        {label}
      </Typography>
      <Stack sx={{ alignItems: 'flex-start', minWidth: 0 }}>
        {typeof value === 'string' ? (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              textAlign: 'left',
              lineHeight: 1.5,
              wordBreak: 'break-word',
            }}
          >
            {value}
          </Typography>
        ) : (
          value
        )}
      </Stack>
    </Stack>
  )
}

export function OverviewTabPanel({
  details,
}: {
  details: EmployeeDetailsResponse
}) {
  const { personalInformation, jobInformation } = details.overview

  const leftRows = [
    {
      label: 'Full Name',
      value: getDisplayValue(personalInformation.fullName),
    },
    {
      label: 'Employee ID',
      value: getDisplayValue(personalInformation.employeeId),
    },
    { label: 'Email', value: getDisplayValue(personalInformation.email) },
    { label: 'Phone', value: getDisplayValue(personalInformation.phone) },
    {
      label: 'Joining Date',
      value: getDisplayValue(personalInformation.joiningDate),
    },
  ]

  const rightRows = [
    { label: 'Country', value: getDisplayValue(personalInformation.country) },
    {
      label: 'Employment Type',
      value: getDisplayValue(personalInformation.employmentType),
    },
    {
      label: 'Status',
      value: (
        <EmployeeStatusChip status={personalInformation.status} size="small" />
      ),
    },
    {
      label: 'Avatar URL',
      value: getDisplayValue(personalInformation.avatarUrl),
    },
  ]

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%', height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack spacing={2}>
                <Typography variant="h6">Personal Information</Typography>
                <Grid container spacing={{ xs: 2, md: 0 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1.75} sx={{ pr: { md: 3 } }}>
                      {leftRows.map((item) => (
                        <PersonalInfoRow
                          key={item.label}
                          label={item.label}
                          value={item.value}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid
                    size={{ xs: 12, md: 6 }}
                    sx={{
                      pl: { md: 3 },
                      borderLeft: { md: '1px solid' },
                      borderColor: 'divider',
                    }}
                  >
                    <Stack spacing={1.75}>
                      {rightRows.map((item) => (
                        <PersonalInfoRow
                          key={item.label}
                          label={item.label}
                          value={item.value}
                        />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex' }}>
          <Card sx={{ width: '100%', height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Job Information</Typography>
                <JobInfoRow
                  icon={ApartmentOutlinedIcon}
                  label="Department"
                  value={jobInformation.department}
                />
                <JobInfoRow
                  icon={BadgeOutlinedIcon}
                  label="Designation"
                  value={jobInformation.designation}
                />
                <JobInfoRow
                  icon={LocationOnOutlinedIcon}
                  label="Work Location"
                  value={jobInformation.workLocation}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SalaryBreakdownSection
        salaryStructure={details.salaryStructure}
        title="Salary Structure (Monthly)"
        disableContainerPadding
      />
    </Stack>
  )
}
