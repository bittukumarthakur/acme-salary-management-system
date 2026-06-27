/**
 * Dashboard domain types.
 * These types define the shape of dashboard data independent of API responses.
 */

export type DashboardState = 'loading' | 'success' | 'error'

export interface DashboardLoadingState {
  state: 'loading'
  data: null
  error: null
}

export interface DashboardSuccessState {
  state: 'success'
  data: DashboardData
  error: null
}

export interface DashboardErrorState {
  state: 'error'
  data: null
  error: string
}

export type DashboardStateValue =
  | DashboardLoadingState
  | DashboardSuccessState
  | DashboardErrorState

export interface DashboardData {
  summaryCards: SummaryCard[]
  payrollSummary: PayrollSummary
}

export interface SummaryCard {
  label: string
  value: number | string
  metadata?: string
}

export interface PayrollSummary {
  months: string[]
  values: number[]
}
export class Dashboar {}
