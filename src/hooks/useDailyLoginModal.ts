import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { saveHabitEntry } from '../services/habitService'
import type { HabitEntry } from '../services/habitService'
import { triggerConfetti } from '../utils/animations'

interface ModalFormData {
  codingLevel: string
  doomscrolled: boolean
  date: string
}

export function useDailyLoginModal(
  viewMode: 'weekly' | 'yearly',
  habits: HabitEntry[] | undefined,
  refetch: () => void
) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const today = format(new Date(), 'yyyy-MM-dd')
  
  useEffect(() => {
    if (habits !== undefined) {
      const hasTodayEntry = habits.length > 0 && habits[habits.length - 1]?.date === today
      setIsOpen(!hasTodayEntry)
    }
  }, [habits, today])
  
  const submitMutation = useMutation({
    mutationFn: async (data: ModalFormData) => {
      const entry = {
        date: data.date,
        coding_level: parseInt(data.codingLevel),
        doomscrolled: data.doomscrolled
      }
      return saveHabitEntry(entry)
    },
    onSuccess: () => {
      setError(null)
      setIsOpen(false)
      refetch()
      // Trigger confetti animation after successful submission
      setTimeout(() => {
        triggerConfetti()
      }, 100)
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to save habit entry')
    }
  })
  
  const handleSubmit = (data: ModalFormData) => {
    submitMutation.mutate(data)
  }
  
  return {
    isOpen,
    setIsOpen,
    handleSubmit,
    isSubmitting: submitMutation.isPending,
    error
  }
}