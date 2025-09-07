import JSConfetti from 'js-confetti'

let confettiInstance: JSConfetti | null = null

export function triggerConfetti() {
  if (!confettiInstance) {
    confettiInstance = new JSConfetti()
  }
  
  confettiInstance.addConfetti({
    confettiColors: [
      '#f97316', // orange-500
      '#22c55e', // green-500
      '#eab308', // yellow-500
      '#3b82f6', // blue-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
    ],
    confettiRadius: 5,
    confettiNumber: 50,
  })
}

export function animateNewEntry() {
  return 'animate-scale-up'
}

export const animationClasses = {
  scaleUp: 'animate-scale-up'
}