export const DEMO_COMPANY_NAME = "KAZ Minerals Demo Data";

// Demo CSV with the columns expected by backend `csv_parser.py`.
export const DEMO_CSV = `step,duration_hours,approvals,cost_kzt_hour
Заявка,2,1,5000
Главный инженер,8,1,12000
Фин директор,48,1,20000
Ген директор,72,1,25000
`;

export const DEMO_PAYLOAD = {
  steps: [
    { step: "Заявка", duration_hours: 2, approvals: 1, cost_kzt_hour: 5000 },
    { step: "Главный инженер", duration_hours: 8, approvals: 1, cost_kzt_hour: 12000 },
    { step: "Фин директор", duration_hours: 48, approvals: 1, cost_kzt_hour: 20000 },
    { step: "Ген директор", duration_hours: 72, approvals: 1, cost_kzt_hour: 25000 },
  ],
};

