import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { PAYROLL_CHART, CARD } from '../../../../shared/constants/dashboard'
import type { PayrollSummary } from '../../types/dashboard'

export interface PayrollSummaryChartProps {
  data?: PayrollSummary
  isLoading?: boolean
}

export function PayrollSummaryChart({
  data,
  isLoading,
}: PayrollSummaryChartProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: CARD.borderRadius,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack
          direction="row"
          sx={{
            mb: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5">Payroll Summary</Typography>
          <Button variant="outlined" sx={{ borderRadius: 1.5 }}>
            This Month
          </Button>
        </Stack>
        {isLoading ? (
          <Skeleton
            variant="rounded"
            height={248}
            sx={{ borderRadius: 2, flex: 1 }}
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: CARD.borderRadius,
              p: 3,
              borderColor: alpha('#1f2f5f', CARD.borderAlpha),
              bgcolor: alpha(CARD.bgColor, CARD.bgAlpha),
              display: 'flex',
              alignItems: 'center',
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <svg
                viewBox={PAYROLL_CHART.VIEW_BOX}
                preserveAspectRatio="xMidYMid meet"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* Grid lines */}
                <line
                  x1="40"
                  y1="15"
                  x2="40"
                  y2="150"
                  stroke={PAYROLL_CHART.GRID_COLOR}
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="150"
                  x2="480"
                  y2="150"
                  stroke={PAYROLL_CHART.GRID_COLOR}
                  strokeWidth="1"
                />

                {/* Y-axis labels (0L to 30L) */}
                {[0, 10, 20, 30].map((label, i) => (
                  <g key={`y-${i}`}>
                    <line
                      x1="35"
                      y1={150 - (label / 30) * 135}
                      x2="40"
                      y2={150 - (label / 30) * 135}
                      stroke={PAYROLL_CHART.GRID_COLOR}
                      strokeWidth="1"
                    />
                    <text
                      x="30"
                      y={155 - (label / 30) * 135}
                      textAnchor="end"
                      fontSize="11"
                      fill={PAYROLL_CHART.AXIS_LABEL_COLOR}
                    >
                      {label}L
                    </text>
                  </g>
                ))}

                {/* Calculate points for line chart */}
                {(() => {
                  const maxValue = PAYROLL_CHART.MAX_VALUE
                  const points =
                    data?.values.map((val, idx) => ({
                      x: 40 + ((idx + 0.5) / data.values.length) * 440,
                      y: 150 - (val / maxValue) * 135,
                      val,
                    })) || []

                  const pathData = points.reduce((acc, point, idx) => {
                    return (
                      acc +
                      (idx === 0
                        ? `M ${point.x} ${point.y}`
                        : ` L ${point.x} ${point.y}`)
                    )
                  }, '')

                  const areaData =
                    `M 40 150 ` +
                    points.reduce((acc, point, idx) => {
                      return (
                        acc +
                        (idx === 0
                          ? `L ${point.x} ${point.y}`
                          : ` L ${point.x} ${point.y}`)
                      )
                    }, '') +
                    ` L 480 150 Z`

                  return (
                    <>
                      {/* Filled area */}
                      <path
                        d={areaData}
                        fill="url(#areaGradient)"
                        opacity="0.3"
                      />

                      {/* Line */}
                      <path
                        d={pathData}
                        stroke={PAYROLL_CHART.LINE_COLOR}
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data points */}
                      {points.map((point, idx) => (
                        <circle
                          key={`point-${idx}`}
                          cx={point.x}
                          cy={point.y}
                          r="3.5"
                          fill={PAYROLL_CHART.LINE_COLOR}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      ))}
                    </>
                  )
                })()}

                {/* Gradient definition */}
                <defs>
                  <linearGradient
                    id="areaGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={PAYROLL_CHART.GRADIENT_START_COLOR}
                      stopOpacity={PAYROLL_CHART.GRADIENT_START_OPACITY}
                    />
                    <stop
                      offset="100%"
                      stopColor={PAYROLL_CHART.GRADIENT_START_COLOR}
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {/* X-axis labels (months) */}
                {data?.months.map((month, idx) => (
                  <text
                    key={`month-${idx}`}
                    x={40 + ((idx + 0.5) / data.months.length) * 440}
                    y="165"
                    textAnchor="middle"
                    fontSize="11"
                    fill={PAYROLL_CHART.AXIS_LABEL_COLOR}
                  >
                    {month}
                  </text>
                ))}
              </svg>
            </Box>
          </Paper>
        )}
      </CardContent>
    </Card>
  )
}
