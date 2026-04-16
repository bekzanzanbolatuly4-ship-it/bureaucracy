export type KPIItem = {
  metric_name: string;
  value: number;
  target: number;
  period_date: string;
};

export type KPISummaryResponse = {
  company_id: string;
  items: KPIItem[];
};

export type AnalyzeStep = {
  name: string;
  duration_hours: number;
  approvals: number;
  cost_kzt_hour: number;
};

export type AnalyzeWorkflow = {
  name: string;
  steps: AnalyzeStep[];
};

export type AnalyzeResponse = {
  bottlenecks: Array<{
    step_name: string;
    current_delay_hours: number;
    impact_score: number;
    monthly_cost_kzt: number;
  }>;
  recommendations: Array<{
    action: string;
    expected_reduction: string;
    implementation_days: number;
    monthly_saving_kzt: number;
    payback_months: number;
  }>;
  overall_roi: {
    total_monthly_saving_kzt: number;
    annual_roi_percent: number;
    confidence: number;
  };
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

