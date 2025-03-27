
export function logHydrationMismatch() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      if (event.message.includes('hydration mismatch')) {
        console.error('Hydration Mismatch Detected:', event);
      }
    });
  }
}
