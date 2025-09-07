import { describe, it, expect, vi } from "vitest";
import {
    transformToWeeklyFormat,
    transformToCalHeatmapFormat,
} from "../utils/dataTransformers";
import { type HabitEntry } from "@/services/habitService";
import { format, subDays } from "date-fns";

// Mock the current date for consistent testing
vi.setSystemTime(new Date("2025-01-07"));

// Helper function to create habit entries
function createHabitEntry(
    daysAgo: number,
    coding_level: number,
    doomscrolled: boolean,
): HabitEntry {
    const date = subDays(new Date(), daysAgo);
    return {
        id: `test-${daysAgo}`,
        date: format(date, "yyyy-MM-dd"),
        coding_level,
        doomscroll: doomscrolled,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
    };
}

describe("transformToWeeklyFormat - Validation Examples", () => {
    describe("Example 1: Never logged", () => {
        it("should return 7 'future' states when no habits are logged", () => {
            const habits: HabitEntry[] = [];
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            expect(result.dayStates).toEqual([
                "future",
                "future",
                "future",
                "future",
                "future",
                "future",
                "future",
            ]);
            expect(result.totalDays).toBe(7);
        });
    });

    describe("Example 2: Logged yesterday only", () => {
        it("should show streak starting yesterday with future days after", () => {
            const habits: HabitEntry[] = [
                createHabitEntry(1, 1, false), // Yesterday - completed
            ];
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            // According to i_plan: streak starts yesterday, today onwards is future
            expect(result.dayStates).toEqual([
                "completed", // Yesterday
                "future", // Today onwards
                "future",
                "future",
                "future",
                "future",
                "future",
            ]);
        });
    });

    describe("Example 3: Logged 2 days ago, missed yesterday", () => {
        it("should show streak starting 2 days ago with missed and future days", () => {
            const habits: HabitEntry[] = [
                createHabitEntry(2, 1, false), // 2 days ago - completed
                // Yesterday - missed (no entry)
            ];
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            // According to i_plan: streak starts 2 days ago, includes misses after
            expect(result.dayStates).toEqual([
                "completed", // 2 days ago
                "missed", // Yesterday
                "missed", // Today
                "future",
                "future",
                "future",
                "future",
            ]);
        });
    });

    describe("Example 4: Logged 7+ days ago", () => {
        it("should return 7 'future' states when last log was over 7 days ago", () => {
            const habits: HabitEntry[] = [
                createHabitEntry(8, 1, false), // 8 days ago - completed
            ];
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            // According to i_plan: no recent streak, show 7 future states
            expect(result.dayStates).toEqual([
                "future",
                "future",
                "future",
                "future",
                "future",
                "future",
                "future",
            ]);
        });
    });

    describe("Example 5: 3 misses after complete", () => {
        it("should end streak after 3 consecutive misses", () => {
            const habits: HabitEntry[] = [
                createHabitEntry(4, 1, false), // 4 days ago - completed
                // 3 days ago - missed
                // 2 days ago - missed
                // Yesterday - missed
                // Today - missed
            ];
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            // According to i_plan: streak shows complete + 3 misses, then ends with future
            expect(result.dayStates).toEqual([
                "completed", // 4 days ago
                "missed", // 3 days ago
                "missed", // 2 days ago
                "missed", // Yesterday
                "future", // Streak ended, rest are future
                "future",
                "future",
            ]);
        });
    });

    describe("Example 5a: Day after 3 misses was complete", () => {
        it("should start new streak when completed after 3 misses", () => {
            const habits: HabitEntry[] = [
                createHabitEntry(5, 1, false), // 5 days ago - completed
                // 4 days ago - missed
                // 3 days ago - missed
                // 2 days ago - missed
                createHabitEntry(1, 1, false), // Yesterday - completed
            ];
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            // According to i_plan: new streak starts from yesterday's complete
            expect(result.dayStates).toEqual([
                "completed", // Yesterday
                "missed", // Today
                "future",
                "future",
                "future",
                "future",
                "future",
            ]);
        });
    });

    describe("Example 5b: Day after 3 misses was missed", () => {
        it("should show no streak when missed after 3 misses", () => {
            const habits: HabitEntry[] = [
                createHabitEntry(5, 1, false), // 5 days ago - completed
                // 4 days ago - missed
                // 3 days ago - missed
                // 2 days ago - missed
                // Yesterday - missed
            ];
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            // According to i_plan: streak ended after 3 misses, no active streak
            expect(result.dayStates).toEqual([
                "future",
                "future",
                "future",
                "future",
                "future",
                "future",
                "future",
            ]);
        });
    });

    describe("Example 6: 3-day streak", () => {
        it("should show 4-day streak when logged 3, 2, 1 days ago and today", () => {
            const habits: HabitEntry[] = [
                createHabitEntry(3, 1, false), // 3 days ago - completed
                createHabitEntry(2, 2, false), // 2 days ago - completed
                createHabitEntry(1, 1, false), // Yesterday - completed
                createHabitEntry(0, 2, false), // Today - completed
            ];
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            // According to i_plan: streak starts 3 days ago, shows 4 completes + 3 future
            expect(result.dayStates).toEqual([
                "completed", // 3 days ago
                "completed", // 2 days ago
                "completed", // Yesterday
                "completed", // Today
                "future",
                "future",
                "future",
            ]);
        });
    });

    describe("Example 7: Long streak (10+ days)", () => {
        it("should show only last 7 days of a long streak", () => {
            const habits: HabitEntry[] = [];
            // Create a 10-day streak
            for (let i = 9; i >= 0; i--) {
                habits.push(createHabitEntry(i, 1, false));
            }
            
            const result = transformToWeeklyFormat(habits, "coding");
            
            // According to i_plan: show only last 7 days, all completed
            expect(result.dayStates).toEqual([
                "completed", // 6 days ago
                "completed", // 5 days ago
                "completed", // 4 days ago
                "completed", // 3 days ago
                "completed", // 2 days ago
                "completed", // Yesterday
                "completed", // Today
            ]);
        });
    });
});

describe("transformToWeeklyFormat - Doomscroll habit", () => {
    it("should mark days with doomscroll as 'missed'", () => {
        const habits: HabitEntry[] = [
            createHabitEntry(2, 0, true), // 2 days ago - doomscrolled
            createHabitEntry(1, 0, false), // Yesterday - no doomscroll
            createHabitEntry(0, 0, true), // Today - doomscrolled
        ];
        
        const result = transformToWeeklyFormat(habits, "doomscroll");
        
        // According to i_plan: streak starts from yesterday's complete
        expect(result.dayStates).toEqual([
            "completed", // Yesterday (no doomscroll)
            "missed", // Today (doomscrolled)
            "future",
            "future",
            "future",
            "future",
            "future",
        ]);
        expect(result.habitName).toBe("No Doomscroll");
    });
});

describe("transformToCalHeatmapFormat", () => {
    it("should transform coding habits correctly", () => {
        const habits: HabitEntry[] = [
            createHabitEntry(2, 0, false),
            createHabitEntry(1, 1, false),
            createHabitEntry(0, 2, false),
        ];
        
        const result = transformToCalHeatmapFormat(habits, "coding");
        
        expect(result).toHaveLength(3);
        expect(result[0].value).toBe(0);
        expect(result[1].value).toBe(1);
        expect(result[2].value).toBe(2);
    });

    it("should transform doomscroll habits correctly", () => {
        const habits: HabitEntry[] = [
            createHabitEntry(2, 0, false), // No doomscroll
            createHabitEntry(1, 0, true), // Doomscrolled
            createHabitEntry(0, 0, false), // No doomscroll
        ];
        
        const result = transformToCalHeatmapFormat(habits, "doomscroll");
        
        expect(result).toHaveLength(3);
        expect(result[0].value).toBe(0);
        expect(result[1].value).toBe(1);
        expect(result[2].value).toBe(0);
    });
});