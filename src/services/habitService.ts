import { supabase } from '../lib/supabase'
import { startOfYear, subDays, format } from 'date-fns'

interface HabitEntry {
  id?: string
  date: string
  coding_level: number
  doomscrolled: boolean
  created_at?: string
  updated_at?: string
}

export async function getWeekHabits(): Promise<HabitEntry[]> {
  try {
    const today = new Date()
    const sevenDaysAgo = subDays(today, 7)
    
    const { data, error } = await supabase
      .from('habit_tracking')
      .select('*')
      .gte('date', format(sevenDaysAgo, 'yyyy-MM-dd'))
      .lte('date', format(today, 'yyyy-MM-dd'))
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching week habits:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Unexpected error in getWeekHabits:', error)
    return []
  }
}

export async function getYearHabits(): Promise<HabitEntry[]> {
  try {
    const today = new Date()
    const yearStart = startOfYear(today)
    
    const { data, error } = await supabase
      .from('habit_tracking')
      .select('*')
      .gte('date', format(yearStart, 'yyyy-MM-dd'))
      .lte('date', format(today, 'yyyy-MM-dd'))
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching year habits:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Unexpected error in getYearHabits:', error)
    return []
  }
}

export async function saveHabitEntry(entry: Omit<HabitEntry, 'id' | 'created_at' | 'updated_at'>): Promise<HabitEntry> {
  // Validate coding_level
  if (![0, 1, 2].includes(entry.coding_level)) {
    throw new Error(`Invalid coding_level: ${entry.coding_level}. Must be 0, 1, or 2.`)
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(entry.date)) {
    throw new Error(`Invalid date format: ${entry.date}. Must be yyyy-MM-dd.`)
  }
  
  try {
    const { data, error } = await supabase
      .from('habit_tracking')
      .upsert(
        {
          date: entry.date,
          coding_level: entry.coding_level,
          doomscrolled: entry.doomscrolled,
        },
        {
          onConflict: 'date',
        }
      )
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error saving habit entry:', error)
    throw error
  }
}