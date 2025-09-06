interface HabitEntry {
  id?: string
  date: string
  coding_level: number
  doomscrolled: boolean
  created_at?: string
  updated_at?: string
}

export async function getWeekHabits(): Promise<HabitEntry[]> {
  // TODO: Implement getting habits for the last 7 days
  throw new Error('Not implemented')
}

export async function getYearHabits(): Promise<HabitEntry[]> {
  // TODO: Implement getting habits from start of current year
  throw new Error('Not implemented')
}

export async function saveHabitEntry(entry: Omit<HabitEntry, 'id' | 'created_at' | 'updated_at'>): Promise<HabitEntry> {
  // TODO: Implement saving/updating a habit entry
  throw new Error('Not implemented')
}