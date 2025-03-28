import confetti from 'canvas-confetti';

/**
 * Triggers confetti celebration animation
 */
export const triggerConfettiCelebration = (
  confettiCanvas: HTMLCanvasElement
): void => {
  const myConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });
  
  // Celebration with multiple confetti bursts
  const end = Date.now() + 2000;
  
  const colors = ['#1a365d', '#2c5282', '#2b6cb0', '#90cdf4', '#48bb78', '#9ae6b4'];
  
  // Side bursts
  (function frame() {
    myConfetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    
    myConfetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
  
  // Big finale
  setTimeout(() => {
    myConfetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors
    });
  }, 1500);
}; 