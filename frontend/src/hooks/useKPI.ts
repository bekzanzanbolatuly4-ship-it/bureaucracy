import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { KPISummaryResponse } from "@/types";

export function useKPI() {
  return useQuery({
    queryKey: ["kpi", "summary"],
    queryFn: async () => {
      const res = await api.get("/kpi/summary");
      return res.data as KPISummaryResponse & { items: any[] };
    },
  });
}

