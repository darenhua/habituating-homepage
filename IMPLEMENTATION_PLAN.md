# Habit Tracker Chrome Extension Implementation Plan

## ✅ Step 1: Extension Foundation (Completed)

-   [x] Initialize project with React, TypeScript, and Vite
-   [x] Configure manifest.json for new tab override
-   [x] Set up basic project structure with TailwindCSS

## Step 2: Database Setup and Core Infrastructure

### ✅ Database Setup (Completed)

-   [x] Set up Supabase project
-   [x] Create database schema:

    ```sql
    CREATE TABLE habit_tracking (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      date DATE UNIQUE NOT NULL,
      coding_level INTEGER CHECK (coding_level IN (0, 1, 2)),
      doomscrolled BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_habit_date ON habit_tracking(date DESC);
    ```

### Core Infrastructure

-   [ ] Install additional dependencies
    ```bash
    npm install @supabase/supabase-js cal-heatmap d3 @tanstack/react-query date-fns
    ```
-   [ ] Create Supabase client configuration (`lib/supabase.ts`)
-   [ ] Implement database helper functions (`lib/db-helpers.ts`)
-   [ ] Set up environment variables for Supabase credentials

### Testing Step 2

-   [ ] Test Supabase connection
-   [ ] Verify database operations (CRUD)
-   [ ] Test edge cases: duplicate dates, invalid data types

## Step 3: Cal-Heatmap Integration and Data Visualization

### UI Components Setup

-   [ ] Install shadcn components
    ```bash
    npx shadcn-ui@latest init
    npx shadcn-ui@latest add dialog form label radio-group checkbox button
    ```
-   [ ] Create reusable HabitHeatmap component
-   [ ] Implement data transformation utilities
-   [ ] Set up React Query for data management

### Testing Step 3

-   [ ] Verify cal-heatmap renders with mock data
-   [ ] Test color scales display correctly
-   [ ] Verify click handlers work
-   [ ] Test data transformation functions
-   [ ] Verify React Query caching behavior

## Step 4: Modal System and Main Dashboard

### Entry Modal and Form

-   [ ] Create HabitEntryModal component
-   [ ] Implement form validation
-   [ ] Add date handling utilities
-   [ ] Create main Dashboard component

### Final Integration

-   [ ] Replace current App.tsx with Dashboard component
-   [ ] Implement auto-open modal for missing daily entries
-   [ ] Add loading states and error handling
-   [ ] Style with TailwindCSS

### Testing Step 4

-   [ ] Test modal functionality
-   [ ] Verify form submission
-   [ ] Test data persistence
-   [ ] Verify heatmap updates
-   [ ] Test timezone handling
-   [ ] Load test with sample data

## Final Testing and Deployment

-   [ ] Test as Chrome extension
-   [ ] Verify data persistence across sessions
-   [ ] Test offline behavior
-   [ ] Performance testing
-   [ ] Create production build
-   [ ] Package for Chrome Web Store

## Notes

-   Current codebase has basic React + Vite setup with TypeScript
-   TailwindCSS is installed and configured
-   Chrome extension manifest is set up
-   Supabase database is set up and ready to use
-   Next immediate tasks:
    1. Install required dependencies
    2. Set up Supabase client and environment variables
    3. Create core components
    4. Implement data management layer
