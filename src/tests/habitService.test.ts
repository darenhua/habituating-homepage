import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { getWeekHabits, getYearHabits, saveHabitEntry } from '../services/habitService'
import { startOfYear, subDays, format } from 'date-fns'

// Test database connection - ensure your test database URL and key are set
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
interface HabitEntry {
  id?: string
  date: string
  coding_level: number
  doomscrolled: boolean
  created_at?: string
  updated_at?: string
}

describe('habitService', () => {
  // Setup test data
  const testDate = new Date()
  const testData: HabitEntry[] = [
    {
      date: format(subDays(testDate, 6), 'yyyy-MM-dd'),
      coding_level: 2,
      doomscrolled: false
    },
    {
      date: format(subDays(testDate, 5), 'yyyy-MM-dd'),
      coding_level: 1,
      doomscrolled: true
    },
    {
      date: format(subDays(testDate, 4), 'yyyy-MM-dd'),
      coding_level: 0,
      doomscrolled: false
    },
    {
      date: format(subDays(testDate, 2), 'yyyy-MM-dd'),
      coding_level: 2,
      doomscrolled: false
    },
    {
      date: format(subDays(testDate, 1), 'yyyy-MM-dd'),
      coding_level: 1,
      doomscrolled: true
    },
    {
      date: format(testDate, 'yyyy-MM-dd'),
      coding_level: 2,
      doomscrolled: false
    }
  ]

  beforeAll(async () => {
    // Clean up any existing test data
    await supabase
      .from('habit_tracking')
      .delete()
      .gte('date', format(subDays(testDate, 10), 'yyyy-MM-dd'))
      .lte('date', format(testDate, 'yyyy-MM-dd'))

    // Insert test data
    const { error } = await supabase
      .from('habit_tracking')
      .insert(testData)
    
    if (error) {
      console.error('Failed to insert test data:', error)
    }
  })

  afterAll(async () => {
    // Clean up test data
    await supabase
      .from('habit_tracking')
      .delete()
      .gte('date', format(subDays(testDate, 10), 'yyyy-MM-dd'))
      .lte('date', format(testDate, 'yyyy-MM-dd'))
  })

  describe('getWeekHabits', () => {
    it('should return habits for the last 7 days', async () => {
      const habits = await getWeekHabits()
      expect(habits).toHaveLength(6) // We inserted 6 entries
    })

    it('should order results by date ascending', async () => {
      const habits = await getWeekHabits()
      
      // Check that dates are in ascending order
      for (let i = 1; i < habits.length; i++) {
        expect(new Date(habits[i].date).getTime())
          .toBeGreaterThan(new Date(habits[i - 1].date).getTime())
      }
    })

    it('should handle empty results', async () => {
      // Clean up existing data temporarily
      await supabase
        .from('habit_tracking')
        .delete()
        .gte('date', format(subDays(testDate, 10), 'yyyy-MM-dd'))
      
      const habits = await getWeekHabits()
      expect(habits).toEqual([])

      // Restore test data
      await supabase
        .from('habit_tracking')
        .insert(testData)
    })

    it('should validate date range calculation', async () => {
      const habits = await getWeekHabits()
      
      // All returned dates should be within the last 7 days
      const sevenDaysAgo = subDays(testDate, 7)
      habits.forEach(habit => {
        const habitDate = new Date(habit.date)
        expect(habitDate.getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime())
        expect(habitDate.getTime()).toBeLessThanOrEqual(testDate.getTime())
      })
    })

    it('should handle database errors gracefully', async () => {
      // This would require mocking the supabase client to simulate an error
      // For now, we'll test that the function doesn't throw
      await expect(getWeekHabits()).resolves.toBeDefined()
    })
  })

  describe('getYearHabits', () => {
    let yearTestData: HabitEntry[]

    beforeEach(async () => {
      // Add some data from earlier in the year
      const startOfCurrentYear = startOfYear(testDate)
      yearTestData = [
        {
          date: format(startOfCurrentYear, 'yyyy-MM-dd'),
          coding_level: 1,
          doomscrolled: false
        },
        {
          date: format(subDays(startOfCurrentYear, -10), 'yyyy-MM-dd'), 
          coding_level: 2,
          doomscrolled: true
        }
      ]
      
      await supabase
        .from('habit_tracking')
        .insert(yearTestData)
    })

    afterEach(async () => {
      // Clean up year test data
      const startOfCurrentYear = startOfYear(testDate)
      await supabase
        .from('habit_tracking')
        .delete()
        .gte('date', format(startOfCurrentYear, 'yyyy-MM-dd'))
        .lte('date', format(subDays(startOfCurrentYear, -10), 'yyyy-MM-dd'))
    })

    it('should return habits from start of current year', async () => {
      const habits = await getYearHabits()
      
      // Should include both week data and year data
      expect(habits.length).toBeGreaterThanOrEqual(8) // 6 week + 2 year entries
    })

    it('should order results by date ascending', async () => {
      const habits = await getYearHabits()
      
      // Check that dates are in ascending order
      for (let i = 1; i < habits.length; i++) {
        expect(new Date(habits[i].date).getTime())
          .toBeGreaterThan(new Date(habits[i - 1].date).getTime())
      }
    })

    it('should handle empty results', async () => {
      // Clean up all data temporarily
      await supabase
        .from('habit_tracking')
        .delete()
        .gte('date', '2000-01-01')
      
      const habits = await getYearHabits()
      expect(habits).toEqual([])

      // Restore test data
      await supabase
        .from('habit_tracking')
        .insert([...testData, ...yearTestData])
    })

    it('should validate year boundary calculation', async () => {
      const habits = await getYearHabits()
      const startOfCurrentYear = startOfYear(testDate)
      
      habits.forEach(habit => {
        const habitDate = new Date(habit.date)
        expect(habitDate.getTime()).toBeGreaterThanOrEqual(startOfCurrentYear.getTime())
      })
    })

    it('should handle database errors gracefully', async () => {
      await expect(getYearHabits()).resolves.toBeDefined()
    })
  })

  describe('saveHabitEntry', () => {
    const newEntry = {
      date: format(subDays(testDate, 20), 'yyyy-MM-dd'),
      coding_level: 1,
      doomscrolled: false
    }

    afterEach(async () => {
      // Clean up the test entry
      await supabase
        .from('habit_tracking')
        .delete()
        .eq('date', newEntry.date)
    })

    it('should insert new habit entry', async () => {
      const saved = await saveHabitEntry(newEntry)
      
      expect(saved).toMatchObject(newEntry)
      expect(saved.id).toBeDefined()
      expect(saved.created_at).toBeDefined()
      expect(saved.updated_at).toBeDefined()
    })

    it('should update existing entry for same date', async () => {
      // First insert
      const firstSave = await saveHabitEntry(newEntry)
      
      // Update with different values
      const updatedEntry = {
        ...newEntry,
        coding_level: 2,
        doomscrolled: true
      }
      
      const secondSave = await saveHabitEntry(updatedEntry)
      
      // Should have same ID but different values
      expect(secondSave.id).toBe(firstSave.id)
      expect(secondSave.coding_level).toBe(2)
      expect(secondSave.doomscrolled).toBe(true)
    })

    it('should validate coding_level constraints (0, 1, 2)', async () => {
      // Valid values
      for (const level of [0, 1, 2]) {
        const entry = { ...newEntry, coding_level: level }
        await expect(saveHabitEntry(entry)).resolves.toBeDefined()
      }
      
      // Invalid values
      for (const level of [-1, 3, 10]) {
        const entry = { ...newEntry, coding_level: level }
        await expect(saveHabitEntry(entry)).rejects.toThrow()
      }
    })

    it('should validate boolean doomscrolled field', async () => {
      // Valid boolean values
      for (const value of [true, false]) {
        const entry = { ...newEntry, doomscrolled: value }
        await expect(saveHabitEntry(entry)).resolves.toBeDefined()
      }
    })

    it('should return saved/updated entry', async () => {
      const saved = await saveHabitEntry(newEntry)
      
      expect(saved).toMatchObject({
        date: newEntry.date,
        coding_level: newEntry.coding_level,
        doomscrolled: newEntry.doomscrolled
      })
    })

    it('should handle database errors', async () => {
      // Test with invalid data type
      const invalidEntry = {
        date: 'invalid-date',
        coding_level: 1,
        doomscrolled: false
      }
      
      await expect(saveHabitEntry(invalidEntry)).rejects.toThrow()
    })
  })
})