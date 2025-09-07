import { cn } from "@/lib/utils";

interface HabitTrackerProps {
    habitName: string;
    dayStates: ("completed" | "missed" | "future")[];
    totalDays: number;
}

export function WeeklyHabitTracker({
    habitName,
    dayStates,
    totalDays,
}: HabitTrackerProps) {
    const completedDays = dayStates.filter(
        (state) => state === "completed",
    ).length;
    const todayIndex = dayStates.findIndex((_, index) => index === 6); // Today is the last day

    return (
        <div className="bg-gray-100 rounded-2xl p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {habitName}
                </h2>
                <span className="text-lg font-medium text-gray-500">
                    {completedDays}/{totalDays}d
                </span>
            </div>

            <div className="flex items-center -space-x-2">
                {dayStates.map((state, index) => {
                    const isToday = index === todayIndex;
                    const shouldAnimate = isToday && state === "completed";

                    if (state === "future") {
                        return (
                            <div
                                key={index}
                                className="translate-x-2 w-12 h-12 flex items-center justify-center"
                            >
                                <div className="w-2 h-2 rounded-full bg-gray-200" />
                            </div>
                        );
                    }

                    return (
                        <div
                            key={index}
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-colors border-2 border-white",
                                state === "completed"
                                    ? "bg-orange-500"
                                    : "bg-gray-400",
                                shouldAnimate && "animate-scale-up",
                            )}
                        >
                            {state === "completed" && (
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-white"
                                >
                                    <path
                                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                        fill="currentColor"
                                    />
                                </svg>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
