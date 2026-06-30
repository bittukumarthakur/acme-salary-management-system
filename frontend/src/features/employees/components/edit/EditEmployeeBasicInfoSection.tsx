import { Box, Grid, Typography } from '@mui/material'
import { ProfileAvatarSection } from './ProfileAvatarSection'
import { PersonalInfoGroup } from './PersonalInfoGroup'
import { EmploymentDetailsGroup } from './EmploymentDetailsGroup'
import { LocationPaymentGroup } from './LocationPaymentGroup'
import { AVATAR_SECTION_GRID } from './editFormConstants'
import type {
  EditEmployeeFormErrors,
  EditEmployeeFormState,
  EditEmployeeSetField,
} from '../../pages/editEmployeeForm'

interface EditEmployeeBasicInfoSectionProps {
  form: EditEmployeeFormState
  errors: EditEmployeeFormErrors
  profileAvatarUrl?: string
  profileInitials: string
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
  onFieldChange: EditEmployeeSetField
}

export function EditEmployeeBasicInfoSection({
  form,
  errors,
  profileAvatarUrl,
  profileInitials,
  onFieldBlur,
  onFieldChange,
}: EditEmployeeBasicInfoSectionProps) {
  return (
    <Box component="section">
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Avatar Section */}
        <Grid
          size={AVATAR_SECTION_GRID.avatar}
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <ProfileAvatarSection
            src={profileAvatarUrl}
            alt={form.fullName}
            initials={profileInitials}
          />
        </Grid>

        {/* Form Fields */}
        <Grid size={AVATAR_SECTION_GRID.fields}>
          <Grid container spacing={2}>
            {/* Personal Information */}
            <PersonalInfoGroup
              form={form}
              errors={errors}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
            />

            {/* Employment Details */}
            <EmploymentDetailsGroup
              form={form}
              errors={errors}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
            />

            {/* Location & Payment */}
            <LocationPaymentGroup
              form={form}
              errors={errors}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
