import React from "react";
import { useViewMode } from "../hooks/useViewMode";
import { useDailyLoginModal } from "../hooks/useDailyLoginModal";
import { useHabitData } from "../hooks/useHabitData";
import { DailyLoginModal } from "./DailyLoginModal";
import { WeeklyHabitTracker } from "./WeeklyHabitTracker";
import { HabitHeatmap } from "./HabitHeatmap";
import { transformToWeeklyFormat } from "../utils/dataTransformers";

export function HomePage() {
    const { viewMode, toggleViewMode } = useViewMode();
    const { data: habitData, isLoading, refetch } = useHabitData(viewMode);
    const { isOpen, setIsOpen, handleSubmit, isSubmitting, error } =
        useDailyLoginModal(viewMode, habitData, refetch);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8"></div>

                {viewMode === "weekly" ? (
                    <div className="space-y-4">
                        <WeeklyHabitTracker
                            {...transformToWeeklyFormat(
                                habitData || [],
                                "coding",
                            )}
                        />
                        <WeeklyHabitTracker
                            {...transformToWeeklyFormat(
                                habitData || [],
                                "doomscroll",
                            )}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 p-4 h-full">
                        <HabitHeatmap
                            habitData={habitData || []}
                            habitType="coding"
                            title="Coding Activity"
                        />
                        <HabitHeatmap
                            habitData={habitData || []}
                            habitType="doomscroll"
                            title="No Doomscroll Challenge"
                        />
                    </div>
                )}
            </div>

            <DailyLoginModal
                open={isOpen}
                onOpenChange={setIsOpen}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                error={error}
            />
        </div>
    );
}
