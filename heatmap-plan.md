# Heatmap Component Implementation Plan

## Overview
This plan details the implementation of the heatmap visualization feature for the habit tracker Chrome extension. The heatmap will display yearly habit data in a GitHub-style visualization using cal-heatmap library.

## Components to Create

### 1. **HabitHeatmap Component** (`src/components/HabitHeatmap.tsx`)
- **Purpose**: Wrapper component for cal-heatmap visualization
- **Key Features**:
  - Renders two separate heatmap instances (coding and doomscroll)
  - Configures cal-heatmap with domain: month, subdomain: day
  - Implements tooltip functionality showing date and habit status
  - Handles responsive sizing to fill the entire screen
  - Manages data transformation from Supabase format to cal-heatmap format

- **Functions**:
  - `HabitHeatmap`: Main component that accepts habit data
  - Internal configuration objects for:
    - Coding heatmap (3 levels: 0=gray, 1=green, 2=yellow)
    - Doomscroll heatmap (2 levels: 0=gray, 1=green)

### 2. **WeeklyHabitTracker Component** (`src/components/WeeklyHabitTracker.tsx`)
- **Purpose**: Display last 7 days of habits in a visual circle format
- **Key Features**:
  - Shows habit name and progress counter (X/7 days)
  - Renders overlapping circles for each day
  - Different visual states: completed (colored), missed (gray), future (small dot)
  - Integrates with the existing design system

- **Functions**:
  - `WeeklyHabitTracker`: Main component
  - Helper to calculate day states from habit data

### 3. **Data Transformer Utilities** (`src/utils/heatmapTransformers.ts`)
- **Purpose**: Transform Supabase data to cal-heatmap format
- **Functions**:
  - `transformCodingData`: Convert coding_level (0,1,2) to heatmap data format
  - `transformDoomscrollData`: Convert boolean to binary (0,1) for heatmap
  - `prepareHeatmapData`: Main transformer that returns formatted data for both heatmaps

## Files to Modify

### 1. **HomePage Component** (`src/components/HomePage.tsx`)
- **Changes**:
  - Import and use `useHabitData` hook
  - Add conditional rendering for weekly vs yearly view
  - Integrate `WeeklyHabitTracker` for weekly mode
  - Integrate `HabitHeatmap` for yearly mode
  - Pass habit data to respective components

### 2. **useDailyLoginModal Hook** (`src/hooks/useDailyLoginModal.ts`)
- **Changes**:
  - Accept habit data to check if today's habit is logged
  - Trigger modal when first item in data isn't today's date
  - Add refetch callback after successful submission

### 3. **useHabitData Hook** (`src/hooks/useHabitData.ts`)
- **Already exists**: Just needs to be imported and used in HomePage

## Additional Features

### 1. **Animations** (`src/utils/animations.ts`)
- **Purpose**: Handle confetti and entry animations
- **Functions**:
  - `triggerConfetti`: Use js-confetti for celebration
  - `animateNewEntry`: CSS animation classes for new habit entries

### 2. **Keyboard Shortcuts**
- Already implemented in `useViewMode` hook for 'z' key
- Modal should support ESC to close and Enter to submit

## Implementation Order

1. Create data transformer utilities
2. Create WeeklyHabitTracker component
3. Create HabitHeatmap component
4. Modify HomePage to integrate components
5. Update useDailyLoginModal for data checking
6. Add animation support

## Technical Considerations

- **Cal-heatmap Configuration**:
  - Use D3.js scales for color mapping
  - Configure tooltip with Popper.js or similar
  - Ensure proper data binding with timestamps

- **Performance**:
  - Memoize transformed data to avoid recalculation
  - Use React.memo for heatmap components
  - Lazy load cal-heatmap for initial page load

- **Data Format**:
  - Cal-heatmap expects: `{ date: timestamp, value: number }`
  - Transform Supabase date strings to timestamps
  - Handle missing dates gracefully

- **Responsive Design**:
  - Heatmap should scale to container width
  - Consider mobile view adjustments
  - Weekly tracker should stack on small screens