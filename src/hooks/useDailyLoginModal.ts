import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { saveHabitEntry } from '../services/habitService'
import { useHabitData } from './useHabitData'

interface ModalFormData {
  codingLevel: string
  doomscrolled: boolean
  date: string
}

export function useDailyLoginModal(viewMode: 'weekly' | 'yearly') {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  
  const { data: habits, isLoading } = useHabitData({ viewMode })
  
  const today = format(new Date(), 'yyyy-MM-dd')
  
  useEffect(() => {
    if (!isLoading && habits) {
      const hasTodayEntry = habits.length > 0 && habits[habits.length - 1]?.date === today
      setIsOpen(!hasTodayEntry)
    }
  }, [habits, isLoading, today])
  
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
      queryClient.invalidateQueries({ queryKey: ['habits'] })
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