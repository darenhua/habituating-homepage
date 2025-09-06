import React from 'react'
import { useViewMode } from '../hooks/useViewMode'
import { useDailyLoginModal } from '../hooks/useDailyLoginModal'
import { DailyLoginModal } from './DailyLoginModal'

export function HomePage() {
  const { viewMode, toggleViewMode } = useViewMode()
  const { isOpen, setIsOpen, handleSubmit, isSubmitting, error } = useDailyLoginModal(viewMode)

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Habit Tracker</h1>
          <button 
            onClick={toggleViewMode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {viewMode === 'weekly' ? 'Switch to Yearly' : 'Switch to Weekly'} (Z)
          </button>
        </div>

        <p className="text-2xl text-center">
          {viewMode === 'weekly' ? 'Weekly mode' : 'Yearly mode'}
        </p>
      </div>
      
      <DailyLoginModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  )
}