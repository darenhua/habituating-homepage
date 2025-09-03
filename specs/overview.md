## Context + North Star Description

We're building a Chrome extension that serves as a habit tracking dashboard, replacing the default Chrome homepage. The extension visualizes daily habit data using cal-heatmap library to create GitHub-style contribution graphs for personal accountability.

**North Star Vision**: A clean, minimalist homepage that provides immediate visual feedback on two core habits - coding practice and doomscrolling control - using color-coded calendar heatmaps. The system should be frictionless, automatically prompting for daily input when needed, while allowing easy corrections through direct interaction with the calendar cells.

**Technical Stack**:
- Plasmo framework for Chrome extension development
- React for UI components
- cal-heatmap for data visualization (2 separate heatmap instances)
- Supabase for data persistence
- shadcn/ui for modal and form components
- Tailwind CSS for styling

**Core Principles**:
- Zero-friction data entry (automatic daily prompt)
- Visual-first feedback (immediate pattern recognition)
- Editable history (click any day to modify)
- Minimal, distraction-free interface

## Happy Path User Flow

1. **First Visit of the Day**
   - User opens a new tab (Chrome homepage)
   - System checks if today's habits have been logged in Supabase
   - If no record exists, a modal automatically appears with a form
   - Form contains:
     - Coding habit: Radio buttons or select (None/Some/A lot)
     - Doomscrolling: Checkbox or toggle (Yes/No - outside scheduled time)
   - User fills form and submits
   - Modal closes, heatmaps update immediately with today's data
   - Data persists to Supabase

2. **Subsequent Visits Same Day**
   - User opens new tabs throughout the day
   - Sees updated heatmaps reflecting their logged habits
   - No modal appears (already logged based on created_at property in supabase table)
   - Can click on today's cell in either heatmap to edit entries

3. **Reviewing Historical Data**
   - User sees two cal-heatmap visualizations stacked vertically
   - Top heatmap: "Daily Coding" with gray (none), green (some), yellow (a lot)
   - Bottom heatmap: "Doomscroll Control" with gray (scrolled), green (no scrolling)
   - Can navigate through months using cal-heatmap's built-in navigation
   - Clicking any historical day opens the modal pre-filled with that day's data

4. **Editing Past Entries**
   - User clicks on any day's cell in either heatmap
   - Modal opens with form pre-populated with that day's data
   - User modifies and saves
   - Heatmaps refresh to show updated data

## Breakdown of Chunks of Work

### 1. **Chrome Extension Setup & Configuration**
- Initialize Plasmo project with React and TypeScript
- Configure manifest for new tab override
- Set up Tailwind CSS
- Install dependencies: cal-heatmap, @supabase/supabase-js, shadcn/ui components
- Configure D3.js dependency for cal-heatmap

### 2. **Supabase Database Schema & Connection**
- Create Supabase project and obtain credentials
- Design and create `habit_tracking` table:
  ```sql
  - id (uuid, primary key)
  - date (date, unique)
  - coding_level (integer: 0=none, 1=some, 2=a lot)
  - doomscrolled (boolean: true=scrolled, false=didn't scroll)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```
- Set up Supabase client in extension
- Create database helper functions:
  - `checkTodayEntry()`: Check if today's record exists
  - `getHabitData(startDate, endDate)`: Fetch range for heatmaps
  - `upsertHabitEntry(date, data)`: Create or update entry
  - `getEntryByDate(date)`: Fetch specific day's data

### 3. **Cal-Heatmap Integration & Configuration**
- Create reusable `HabitHeatmap` component that wraps cal-heatmap
- Configure two separate cal-heatmap instances:

  **Coding Heatmap**:
  - Domain: month, SubDomain: day
  - Scale configuration:
    - Ordinal or threshold type
    - Domain: [0, 1, 2]
    - Range: ['#e5e7eb', '#22c55e', '#eab308'] (gray, green, yellow)
  - Show last 3-4 months of data

  **Doomscroll Heatmap**:
  - Same domain/subdomain structure
  - Scale configuration:
    - Binary (boolean mapped to 0/1)
    - Domain: [0, 1]
    - Range: ['#e5e7eb', '#22c55e'] (gray, green)

- Implement click handlers on subDomain cells
- Configure tooltips showing exact date and status
- Handle data transformation from Supabase to cal-heatmap format

### 4. **Modal & Form Components**
- Install and configure shadcn/ui Dialog and Form components
- Create `HabitEntryModal` component with:
  - Date display (for context)
  - Coding level input (radio group or select)
  - Doomscroll checkbox/toggle
  - Submit and Cancel buttons
  - Form validation
- Implement modal trigger logic:
  - Auto-open on page load if no today entry
  - Open on calendar cell click
  - Pass date and existing data as props
- Handle form submission and Supabase updates

### 5. **Main Dashboard Layout**
- Create main `App` component with:
  - Flex column layout
  - Title/header section
  - Two heatmap sections with labels:
    - "🧑‍💻 Daily Coding Practice"
    - "📱 Doomscroll Control"
  - Proper spacing and responsive design
- Implement loading states while fetching data
- Error boundary for graceful failure handling

### 6. **Data Flow & State Management**
- Set up React Query or SWR for data fetching/caching
- Implement state management for:
  - Current modal open/close state
  - Selected date for editing
  - Heatmap data arrays
  - Loading and error states
- Create data transformation utilities:
  - Convert Supabase records to cal-heatmap data format
  - Handle missing dates (should appear as gray/0 value)
  - Date formatting and timezone handling

### 7. **Cal-heatmap Advanced Features**
- Add cal-heatmap plugins:
  - Tooltip plugin for hover information
- Handle cal-heatmap lifecycle (paint, destroy, update)
- Optimize performance for smooth rendering

### 9. **Testing & Deployment**
- Test cal-heatmap rendering with various data scenarios
- Verify Supabase connection reliability
- Test modal flow and form validation
- Ensure proper date handling across timezones
- Build and package extension for Chrome
- Create installation and setup documentation

This specification provides a clear roadmap for implementing your habit tracking dashboard with cal-heatmap visualizations, ensuring all major components and edge cases are addressed.
