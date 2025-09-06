import { useQuery } from "@tanstack/react-query";
import { getWeekHabits, getYearHabits } from "../services/habitService";

interface UseHabitDataOptions {
    viewMode: "weekly" | "yearly";
}

export function useHabitData({ viewMode }: UseHabitDataOptions) {
    return useQuery({
        queryKey: ["habits", viewMode],
        queryFn: () => {
            if (viewMode === "weekly") {
                return getWeekHabits();
            } else {
                return getYearHabits();
            }
        },
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}
