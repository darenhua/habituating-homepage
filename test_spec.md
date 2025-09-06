### 1. Unit Tests

#### Data Service Tests (`src/tests/habitService.test.ts`)
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
