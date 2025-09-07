# Strategy for Modifying transformToWeeklyFormat

## Current Behavior
The function currently shows the last 7 days chronologically, marking each day as:
- "completed" - if the habit was performed
- "missed" - if the habit wasn't performed (or was performed for doomscroll)
- "future" - for days that haven't occurred yet

## New Requirements
Transform `dayStates` to represent a "streak" that:
1. Always starts from the most recent "complete" day
2. Shows up to 7 days including the complete day and subsequent days
3. If no habit completed in the last 7 days, show 7 "future" days
4. If 3 consecutive days are missed after a complete, the streak ends

## Implementation Strategy

### Step 1: Find the Start of Current Streak
- Work backwards from today to find where the current streak begins
- A streak begins with a "complete" day that either:
  - Has no previous day, OR
  - Is preceded by a "missed" day or gap of 3+ days
- For coding: `coding_level > 0` means complete
- For doomscroll: `doomscroll === false` means complete

### Step 2: Build the Streak Array
**Case A: No active streak**
- No completes in recent days, or last streak ended (3+ consecutive misses)
- Return array of 7 "future" states

**Case B: Found an active streak**
1. Start from the first complete day of the streak
2. Add all days from streak start to today:
   - Complete days: "complete"
   - Missed days: "missed"
   - Future days: "future"
3. If 3 consecutive misses occur, end the streak there
4. Limit array to 7 elements total

### Step 3: Handle Edge Cases
- Streak older than 7 days: Show only the most recent 7 days of it
- Very long streaks: Truncate to show last 7 days
- Streak ends with 3 misses: Fill remaining with "future"

### Algorithm Pseudocode
```
function transformToWeeklyFormat(habits, habitType):
    today = current date

    // First, find all complete days going backwards
    completeDays = []
    for i from 0 to past (until no more habits):
        date = today - i days
        habit = find habit entry for date

        if habit exists and is complete:
            completeDays.push({date, daysAgo: i})

    // Find the start of the current streak
    streakStart = null

    if completeDays.length > 0:
        // Check from most recent complete backwards
        mostRecentComplete = completeDays[0]

        // Check if there are any gaps/misses between today and most recent complete
        missedCount = 0
        for d from mostRecentComplete.daysAgo - 1 down to 0:
            date = today - d days
            if date <= today:
                habit = find habit for date
                if !habit or !isComplete(habit):
                    missedCount++
                    if missedCount >= 3:
                        // Streak is broken
                        return 7 × "future"
                else:
                    missedCount = 0

        // Now find where this streak started
        streakStart = mostRecentComplete

        // Look for earlier completes that are part of the same streak
        for i from 1 to completeDays.length - 1:
            prevComplete = completeDays[i-1]
            currComplete = completeDays[i]

            // Check gap between completes
            daysBetween = currComplete.daysAgo - prevComplete.daysAgo

            if daysBetween > 3:
                // Too big a gap, streak started at prevComplete
                break

            // Check for 3 consecutive misses in between
            missedInBetween = 0
            for d from prevComplete.daysAgo + 1 to currComplete.daysAgo - 1:
                date = today - d days
                habit = find habit for date
                if !habit or !isComplete(habit):
                    missedInBetween++
                    if missedInBetween >= 3:
                        // Streak started at prevComplete
                        break
                else:
                    missedInBetween = 0

            if missedInBetween >= 3:
                break

            // This complete is part of the streak
            streakStart = currComplete

    // Build the streak array
    if !streakStart:
        return 7 × "future"

    streak = []
    consecutiveMisses = 0

    // Start from streak beginning or 6 days ago, whichever is more recent
    startDay = min(streakStart.daysAgo, 6)

    for i from startDay down to -6:
        if streak.length >= 7:
            break

        date = today - i days

        if i < 0: // Future days
            streak.push("future")
        else:
            habit = find habit for date
            if habit and isComplete(habit):
                streak.push("complete")
                consecutiveMisses = 0
            else:
                streak.push("missed")
                consecutiveMisses++
                if consecutiveMisses >= 3:
                    // Streak ended, fill rest with future
                    while streak.length < 7:
                        streak.push("future")
                    break

    return streak
```

### Examples Validation
1. Never logged: No complete found → 7 × "future"
2. Logged yesterday only: Streak starts yesterday → ["complete", "future", ...]
3. Logged 2 days ago, missed yesterday: Streak starts 2 days ago → ["complete", "missed", "future", ...]
4. Logged 7+ days ago: No recent streak → 7 × "future"
5. 3 misses after complete: Streak ends → ["complete", "missed", "missed", "missed", "future", ...]
5a. Day after 3 misses was complete: New streak -> ["complete", "future"...]
5b. Day after 3 misses was missed: Streak not started -> 7 × "future"
6. 3-day streak (logged 3 days ago, 2 days ago, yesterday, today): Streak starts 3 days ago → ["complete", "complete", "complete", "complete", "future", "future", "future"]
7. Long streak (10+ days): Show only last 7 days of streak → ["complete", "complete", "complete", "complete", "complete", "complete", "complete"]

## Analysis: Why This Problem is Hard

### Implementation Challenges Identified

1. **Multiple Overlapping Rules**: The algorithm needs to handle several complex, interacting rules:
   - Find the most recent complete day within 7 days
   - Check for 3+ consecutive misses that break streaks  
   - Distinguish between "missed" (within active streak) vs "future" (beyond streak boundary)
   - Handle special cases like "completed yesterday, no entry today" → future vs missed

2. **Complex State Transitions**: Each day can be:
   - `completed` (has entry and meets completion criteria)
   - `missed` (has entry but incomplete, OR no entry but within active streak timeframe) 
   - `future` (beyond the active streak boundary or after streak ends)

3. **Context-Dependent Logic**: Whether a day is "missed" or "future" depends on:
   - Proximity to last completed day
   - Whether there are 3+ consecutive misses
   - Whether there's an actual entry for that day
   - The specific day (today has special rules)

4. **Test-Driven Development Without Clear Specification**: The tests encode complex business logic, but the interactions between rules aren't clearly documented, making it easy to get edge cases wrong.

### Root Cause of Current Bug

The current implementation finds `mostRecentCompleteDay` but then fails to properly scan the full 7-day range to identify all completed days in the streak. It treats finding one complete day as sufficient and fills the rest with inappropriate states.

### Recommended Approach

1. **Two-Phase Algorithm**:
   - **Phase 1**: Scan 7-day window and classify each day as complete/missed/no-entry
   - **Phase 2**: Apply streak rules to determine final output states

2. **Clearer Data Modeling**: 
   ```typescript
   interface DayInfo {
     daysAgo: number;
     dateStr: string; 
     hasEntry: boolean;
     isComplete: boolean;
     rawState: 'complete' | 'incomplete' | 'no-entry';
   }
   ```

3. **Explicit Streak Boundary Detection**:
   - Find the actual start and end of the active streak
   - Apply 3-consecutive-miss rule explicitly
   - Map streak boundaries to output format

4. **Test-First Implementation**:
   - Implement one test case at a time
   - Build up complexity incrementally
   - Verify each rule in isolation before combining
