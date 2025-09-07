import { type HabitEntry } from "@/services/habitService";

interface CalHeatmapData {
    date: string;
    value: number;
}

interface WeeklyHabitData {
    habitName: string;
    dayStates: ("completed" | "missed" | "future")[];
    totalDays: number;
}

export function transformToCalHeatmapFormat(
    habits: HabitEntry[],
    field: "coding" | "doomscroll",
): CalHeatmapData[] {
    return habits.map((habit) => {
        let value = 0;

        if (field === "coding") {
            value = habit.coding_level;
        } else if (field === "doomscroll") {
            value = habit.doomscroll ? 1 : 0;
        }

        return {
            date: habit.date,
            value,
        };
    });
}

export function transformToWeeklyFormat(
    habits: HabitEntry[],
    habitType: "coding" | "doomscroll",
): WeeklyHabitData {
    const today = new Date();
    const last7Days: Date[] = [];

    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        last7Days.push(day);
    }

    const dayStates = last7Days.map((day) => {
        const dateStr = day.toISOString().split("T")[0];
        const habit = habits.find((h) => h.date === dateStr);

        if (day > today) {
            return "future" as const;
        }

        if (!habit) {
            return "missed" as const;
        }

        if (habitType === "coding") {
            return habit.coding_level > 0
                ? ("completed" as const)
                : ("missed" as const);
        } else {
            return habit.doomscroll
                ? ("missed" as const)
                : ("completed" as const);
        }
    });

    const habitName = habitType === "coding" ? "Coding" : "No Doomscroll";

    return {
        habitName,
        dayStates,
        totalDays: 7,
    };
}
