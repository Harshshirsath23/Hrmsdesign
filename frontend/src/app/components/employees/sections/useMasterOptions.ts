import { useMemo } from "react";
import { useMasterList } from "../../../modules/masters/hooks";

export function useMasterOptions(masterName: string) {
  const query = useMemo(() => ({ is_active: "true" as const, page: 1 }), []);
  const { data } = useMasterList(masterName, query);

  return useMemo(
    () =>
      (data?.results ?? []).map((item) => {
        const label = String(item.label ?? item.name ?? item.title ?? item.code ?? item.id);
        return { value: label, label };
      }),
    [data?.results],
  );
}
