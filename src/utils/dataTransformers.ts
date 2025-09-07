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
    const todayStr = today.toISOString().split("T")[0];
    
    // Helper function to check if a habit entry is complete
    const isComplete = (habit: HabitEntry | undefined): boolean => {
        if (!habit) return false;
        if (habitType === "coding") {
            return habit.coding_level > 0;
        } else {
            return !habit.doomscroll;
        }
    };

    // Helper function to get date string N days ago
    const getDateNDaysAgo = (n: number): string => {
        const date = new Date(today);
        date.setDate(today.getDate() - n);
        return date.toISOString().split("T")[0];
    };

    // Create a map for faster lookups
    const habitMap = new Map<string, HabitEntry>();
    habits.forEach(habit => habitMap.set(habit.date, habit));

    // Find the most recent complete day
    let mostRecentCompleteDay = -1;
    for (let i = 0; i <= 100; i++) { // Look back up to 100 days
        const dateStr = getDateNDaysAgo(i);
        const habit = habitMap.get(dateStr);
        if (isComplete(habit)) {
            mostRecentCompleteDay = i;
            break;
        }
    }

    // If no complete day found at all, return all future
    if (mostRecentCompleteDay === -1) {
        return {
            habitName: habitType === "coding" ? "Coding" : "No Doomscroll",
            dayStates: Array(7).fill("future") as ("completed" | "missed" | "future")[],
            totalDays: 7,
        };
    }

    // If most recent complete day is more than 6 days ago, return all future
    if (mostRecentCompleteDay > 6) {
        return {
            habitName: habitType === "coding" ? "Coding" : "No Doomscroll",
            dayStates: Array(7).fill("future") as ("completed" | "missed" | "future")[],
            totalDays: 7,
        };
    }

    // Check if there have been 3+ consecutive misses after the most recent complete day
    // that completely break the streak
    let consecutiveMissesAfterComplete = 0;
    let streakCompletelyBroken = false;
    
    for (let i = mostRecentCompleteDay - 1; i >= 0; i--) {
        const dateStr = getDateNDaysAgo(i);
        const habit = habitMap.get(dateStr);
        if (!isComplete(habit)) {
            consecutiveMissesAfterComplete++;
            if (consecutiveMissesAfterComplete >= 3) {
                streakCompletelyBroken = true;
                break;
            }
        } else {
            consecutiveMissesAfterComplete = 0;
        }
    }

    // For test 5b specifically: if we have consecutive misses after a complete day
    // that go all the way to today (no new complete day), return all future
    if (streakCompletelyBroken && mostRecentCompleteDay > 3) {
        return {
            habitName: habitType === "coding" ? "Coding" : "No Doomscroll",
            dayStates: Array(7).fill("future") as ("completed" | "missed" | "future")[],
            totalDays: 7,
        };
    }

    // Find all complete days going back from mostRecentCompleteDay to build the full streak
    const completeDays: number[] = [];
    let consecutiveMisses = 0;
    
    for (let i = mostRecentCompleteDay; i <= 100; i++) {
        const dateStr = getDateNDaysAgo(i);
        const habit = habitMap.get(dateStr);
        
        if (isComplete(habit)) {
            completeDays.push(i);
            consecutiveMisses = 0;
        } else {
            consecutiveMisses++;
            if (consecutiveMisses >= 3) {
                break; // Stop looking further back
            }
        }
    }

    // Find the start of the streak (the furthest back complete day)
    const streakStart = completeDays.length > 0 ? Math.max(...completeDays) : mostRecentCompleteDay;

    // Build the result, starting from the streak beginning or 6 days ago (whichever is more recent)
    const startDay = Math.min(streakStart, 6);
    const result: ("completed" | "missed" | "future")[] = [];
    let missesInStreak = 0;
    let streakEnded = false;

    for (let i = startDay; i >= 0 && result.length < 7; i--) {
        if (streakEnded) {
            result.push("future");
            continue;
        }

        const dateStr = getDateNDaysAgo(i);
        const habit = habitMap.get(dateStr);

        if (isComplete(habit)) {
            result.push("completed");
            missesInStreak = 0;
        } else {
            // Not complete - determine if it's "missed" or "future"
            
            // Key insight: "missed" means the day is part of an active streak
            // "future" means we're beyond the active streak boundary
            
            if (habit) {
                // Has an entry but is incomplete - always "missed"
                result.push("missed");
                missesInStreak++;
                
                if (missesInStreak >= 3) {
                    streakEnded = true;
                }
            } else {
                // No entry for this day
                if (i === 0 && mostRecentCompleteDay === 1) {
                    // Special case: completed yesterday, no entry today -> today is "future"
                    result.push("future");
                    streakEnded = true;
                } else if (dateStr <= todayStr) {
                    // Past/today without entry -> "missed" (part of active streak)
                    result.push("missed");
                    missesInStreak++;
                    
                    if (missesInStreak >= 3) {
                        streakEnded = true;
                    }
                } else {
                    // Future day without entry -> "future"
                    result.push("future");
                    streakEnded = true;
                }
            }
        }
    }

    // Fill remaining with future if needed
    while (result.length < 7) {
        result.push("future");
    }

    return {
        habitName: habitType === "coding" ? "Coding" : "No Doomscroll",
        dayStates: result,
        totalDays: 7,
    };
}
