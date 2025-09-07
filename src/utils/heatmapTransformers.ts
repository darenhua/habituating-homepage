import type { HabitEntry } from '../services/habitService'

interface CalHeatmapData {
  date: Date
  value: number
}

export function transformCodingData(habits: HabitEntry[]): CalHeatmapData[] {
  return habits.map(habit => ({
    date: new Date(habit.date),
    value: habit.coding_level
  }))
}

export function transformDoomscrollData(habits: HabitEntry[]): CalHeatmapData[] {
  return habits.map(habit => ({
    date: new Date(habit.date),
    value: habit.doomscrolled ? 0 : 1
  }))
}

export function prepareHeatmapData(habits: HabitEntry[]) {
  return {
    coding: transformCodingData(habits),
    doomscroll: transformDoomscrollData(habits)
  }
}