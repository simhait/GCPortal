export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role: 'director' | 'manager';
  school_id?: string;
  district_id: string;
  district_name?: string;
  avatar_url?: string;
  title?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolBenchmark {
  id: string;
  school_id: string;
  kpi_id: string;
  benchmark: number;
  created_at?: string;
  updated_at?: string;
}

export interface KPIBenchmarkConfig {
  kpiId: string;
  name: string;
  unit: string;
  description: string;
  defaultBenchmark: number;
  schoolBenchmark?: number;
  format: 'integer' | 'decimal' | 'percentage';
  min: number;
  max: number;
  step: number;
  readOnly?: boolean;
  relationships?: {
    target_kpi_id: string;
    relationship_type: string;
    formula: string;
  }[];
}

export interface KPI {
  id: string;
  name: string;
  description?: string;
  unit: string;
  benchmark: number;
  goal: number;
  is_hidden?: boolean;
  display_order: number;
  relationships?: {
    target_kpi_id: string;
    relationship_type: string;
    formula: string;
  }[];
}

export interface UserKPIPreference {
  id: string;
  user_id: string;
  kpi_id: string;
  is_hidden: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface KPIValue {
  id: string;
  kpi_id: string;
  value: number;
  date: string;
  school_id?: string;
  district_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface School {
  id: string;
  name: string;
  district_id: string;
  created_at?: string;
  total_enrollment?: number;
  free_count?: number;
  reduced_count?: number;
  paid_count?: number;
}

export interface SchoolMetrics {
  id: string;
  school_id: string;
  school_name: string;
  date: string;
  total_enrollment: number;
  free_reduced_count: number;
  free_count: number;
  reduced_count: number;
  breakfast_count: number;
  lunch_count: number;
  snack_count: number;
  free_meal_lunch: number;
  reduced_meal_lunch: number;
  paid_meal_lunch: number;
  free_meal_breakfast: number;
  reduced_meal_breakfast: number;
  paid_meal_breakfast: number;
  free_meal_snack: number;
  reduced_meal_snack: number;
  paid_meal_snack: number;
  reimbursement_amount: number;
  alc_revenue: number;
  meal_equivalents: number;
  mplh: number;
  program_access_rate: number;
  breakfast_participation_rate: number;
  lunch_participation_rate: number;
  snack_participation_rate: number;
  eod_tasks_completed: boolean;
}