# Phase 2: Supabase Integration + Data Flow Implementation Plan

## Overview
This document outlines the implementation plan for integrating Supabase as the data persistence layer and establishing the data flow for the habit tracking homepage.

## Test Plan

### 1. Unit Tests

#### Supabase Client Tests (`src/lib/__tests__/supabase.test.ts`)
- Test Supabase client initialization with environment variables
- Test error handling for missing/invalid credentials
- Mock Supabase client for other tests

#### Data Service Tests (`src/services/__tests__/habitService.test.ts`)
- **getWeekHabits()**
  - Returns habits for the last 7 days
  - Orders results by date ascending
  - Handles empty results
  - Handles database errors gracefully
  - Validates date range calculation
  
- **getYearHabits()**
  - Returns habits from start of current year
  - Orders results by date ascending
  - Handles empty results
  - Handles database errors gracefully
  - Validates year boundary calculation

- **saveHabitEntry()**
  - Inserts new habit entry
  - Updates existing entry for same date
  - Validates coding_level constraints (0, 1, 2)
  - Validates boolean doomscrolled field
  - Returns saved/updated entry
  - Handles database errors

#### Data Transformation Tests (`src/utils/__tests__/dataTransformers.test.ts`)
- **transformToCalHeatmapFormat()**
  - Converts Supabase habit data to cal-heatmap format
  - Maps coding_level (0,1,2) correctly
  - Maps doomscrolled boolean to (0,1)
  - Handles missing/null values
  - Preserves date accuracy

- **transformToWeeklyFormat()**
  - Converts habit data to weekly tracker format
  - Fills in missing days with appropriate states
  - Correctly identifies "completed", "missed", "future" states
  - Handles edge cases (partial weeks, future dates)

### 2. Integration Tests

#### API Integration Tests (`src/__tests__/integration/supabase.integration.test.ts`)
- Test actual Supabase connection (using test database)
- Verify CRUD operations work end-to-end
- Test data constraints and validation
- Verify indexes work for performance

#### Component Integration Tests
- **HabitHeatmap Component**
  - Renders with real data from Supabase
  - Updates when data changes
  - Handles loading and error states
  
- **WeeklyTracker Component**
  - Shows correct week data
  - Updates after modal submission
  
- **HabitEntryModal Component**
  - Submits data to Supabase
  - Triggers data refetch on success
  - Shows validation errors

### 3. E2E Tests (`e2e/habitTracking.spec.ts`)
- User opens homepage
  - If no entry for today, modal appears
  - User can fill and submit form
  - Data persists and UI updates
- View switching (z key)
  - Toggles between weekly and yearly view
  - Data loads correctly for each view
- Data persistence
  - Entries persist across page reloads
  - Historical data displays correctly

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── dialog.tsx          # Shadcn dialog component
│   │   ├── form.tsx           # Shadcn form components
│   │   ├── button.tsx         # Shadcn button component
│   │   ├── checkbox.tsx       # Shadcn checkbox component
│   │   └── radio-group.tsx    # Shadcn radio group component
│   ├── HabitHeatmap.tsx       # Cal-heatmap wrapper component
│   ├── WeeklyTracker.tsx      # Weekly habit tracker component
│   ├── HabitEntryModal.tsx    # Modal for habit entry
│   └── HomePage.tsx           # Main page component
├── hooks/
│   ├── useHabitData.ts        # Custom hook for habit data fetching
│   └── useViewMode.ts         # Custom hook for view mode state
├── lib/
│   ├── supabase.ts            # Supabase client setup
│   └── utils.ts               # Utility functions (cn, etc.)
├── services/
│   └── habitService.ts        # Data fetching/mutation functions
├── types/
│   ├── database.types.ts      # Generated Supabase types
│   └── habit.types.ts         # Application-specific types
├── utils/
│   └── dataTransformers.ts    # Data transformation utilities
└── App.tsx                    # Root component
```

## Pseudocode Function Signatures

### 1. Supabase Client Setup (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 2. Habit Service (`src/services/habitService.ts`)
```typescript
interface HabitEntry {
  id: string
  date: string
  coding_level: 0 | 1 | 2 | null
  doomscrolled: boolean
  created_at: string
  updated_at: string
}

interface HabitFormData {
  codingLevel: "none" | "light" | "moderate" | "heavy"
  doomscrolled: boolean
  date: string
}

async function getWeekHabits(): Promise<HabitEntry[]> {
  // Calculate date 7 days ago
  // Query supabase for habits between then and now
  // Order by date ascending
  // Return results
}

async function getYearHabits(): Promise<HabitEntry[]> {
  // Get start of current year
  // Query supabase for habits from year start to now
  // Order by date ascending
  // Return results
}

async function saveHabitEntry(data: HabitFormData): Promise<HabitEntry> {
  // Map codingLevel to numeric value (0, 1, 2)
  // Use upsert to insert or update based on date
  // Return saved entry
}

async function getTodayEntry(): Promise<HabitEntry | null> {
  // Query for today's date
  // Return entry or null
}
```

### 3. Data Transformers (`src/utils/dataTransformers.ts`)
```typescript
interface CalHeatmapData {
  date: string
  value: number
}

interface WeeklyHabitData {
  habitName: string
  dayStates: ("completed" | "missed" | "future")[]
  totalDays: number
}

function transformToCalHeatmapFormat(
  habits: HabitEntry[], 
  field: 'coding' | 'doomscroll'
): CalHeatmapData[] {
  // Map each habit entry to cal-heatmap format
  // For coding: use coding_level value (0, 1, 2)
  // For doomscroll: convert boolean to 0 or 1
  // Return array of { date, value }
}

function transformToWeeklyFormat(
  habits: HabitEntry[], 
  habitType: 'coding' | 'doomscroll'
): WeeklyHabitData {
  // Create array of last 7 days
  // Map each day to state based on habit data
  // Return formatted data for WeeklyTracker
}
```

### 4. Custom Hooks

#### useHabitData (`src/hooks/useHabitData.ts`)
```typescript
interface UseHabitDataOptions {
  viewMode: 'weekly' | 'yearly'
}

function useHabitData({ viewMode }: UseHabitDataOptions) {
  // Use TanStack Query
  // Fetch week or year data based on viewMode
  // Return { data, isLoading, error, refetch }
}
```

#### useViewMode (`src/hooks/useViewMode.ts`)
```typescript
function useViewMode() {
  // useState for 'weekly' | 'yearly'
  // useEffect for keyboard listener (z key)
  // Return { viewMode, toggleViewMode }
}
```

### 5. Main Components

#### HomePage (`src/components/HomePage.tsx`)
```typescript
function HomePage() {
  // useViewMode hook
  // useHabitData hook
  // useState for modal
  // Check if today's entry exists
  // Render modal if needed
  // Render WeeklyTracker or HabitHeatmap based on viewMode
  // Handle modal submission with refetch
}
```

#### HabitHeatmap (`src/components/HabitHeatmap.tsx`)
```typescript
interface HabitHeatmapProps {
  data: HabitEntry[]
  onDataUpdate: () => void
}

function HabitHeatmap({ data, onDataUpdate }: HabitHeatmapProps) {
  // Transform data for both heatmaps
  // Initialize cal-heatmap instances
  // Configure domains, subdomains, scales
  // Add tooltips
  // Render two heatmap containers
}
```

## Environment Variables Required
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Implementation Steps

1. **Set up Supabase client** with environment variables
2. **Create type definitions** from database schema
3. **Implement data service functions** (getWeekHabits, getYearHabits, saveHabitEntry)
4. **Create data transformation utilities**
5. **Build custom hooks** for data fetching and view mode
6. **Implement UI components** (copy from specs)
7. **Wire up HomePage component** with data flow
8. **Add animations** (confetti, scale-up)
9. **Write and run tests**
10. **Handle edge cases** and error states

## Key Considerations

- **Error Handling**: All data operations should handle errors gracefully
- **Loading States**: Show appropriate loading indicators
- **Optimistic Updates**: Consider optimistic updates for better UX
- **Type Safety**: Use TypeScript strictly throughout
- **Performance**: Use React Query for caching and background refetching
- **Accessibility**: Ensure modal and form controls are accessible
- **Responsive Design**: Components should work on various screen sizes