import { useEffect, useRef } from "react";
import CalHeatmap from "cal-heatmap";
import "cal-heatmap/cal-heatmap.css";
import Tooltip from "cal-heatmap/plugins/Tooltip";
import { format } from "date-fns";
import type { HabitEntry } from "../services/habitService";
import { prepareHeatmapData } from "../utils/heatmapTransformers";

interface HabitHeatmapProps {
    habitData: HabitEntry[];
    habitType: "coding" | "doomscroll";
    title: string;
}

export function HabitHeatmap({
    habitData,
    habitType,
    title,
}: HabitHeatmapProps) {
    const heatmapRef = useRef<HTMLDivElement>(null);
    const calRef = useRef<CalHeatmap | null>(null);
    const initializedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!heatmapRef.current || initializedRef.current) return;

        const transformedData = prepareHeatmapData(habitData);
        const data = transformedData[habitType];

        if (calRef.current) {
            calRef.current.destroy();
            calRef.current = null;
        }

        initializedRef.current = true;
        calRef.current = new CalHeatmap();
        calRef.current.paint({
            itemSelector: heatmapRef.current,
            data: {
                source: data,
                x: "date",
                y: "value",
            },
            date: {
                start: new Date(new Date().getFullYear(), 0, 1),
                end: new Date(),
            },
            domain: {
                type: "month",
                gutter: 4,
                label: { text: "MMM", textAlign: "middle" },
            },
            subDomain: {
                type: "day",
                radius: 2,
                width: 11,
                height: 11,
                gutter: 4,
            },
            scale: {
                color: {
                    type: "ordinal",
                    domain: habitType === "coding" ? [0, 1, 2] : [1, 0],
                    range:
                        habitType === "coding"
                            ? ["#e5e7eb", "#22c55e", "#eab308"]
                            : ["#e5e7eb", "#22c55e"],
                },
            },
            plugins: [
                [
                    Tooltip,
                    {
                        text: (timestamp: number, value: number | null) => {
                            const dateStr = format(
                                new Date(timestamp),
                                "MMM d, yyyy",
                            );
                            if (value === null || value === undefined)
                                return `${dateStr}: No data`;

                            if (habitType === "coding") {
                                const levels = [
                                    "No coding",
                                    "Light (1-2h)",
                                    "Moderate (3-5h)",
                                    "Heavy (6h+)",
                                ];
                                return `${dateStr}: ${levels[value] || "No data"}`;
                            } else {
                                return `${dateStr}: ${value === 1 ? "No doomscrolling ✓" : "Doomscrolled"}`;
                            }
                        },
                    },
                ],
            ],
        });

        return () => {
            if (calRef.current) {
                calRef.current.destroy();
                calRef.current = null;
            }
        };
    }, [habitData, habitType]);

    return (
        <div className="flex-1">
            <h2 className="text-2xl font-bold mb-12 text-left">{title}</h2>
            <div className="">
                <div ref={heatmapRef} />
            </div>
        </div>
    );
}
