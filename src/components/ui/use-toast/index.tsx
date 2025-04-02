interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Implementación de toast simplificada
export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  console.log(`Toast: ${variant} - ${title} - ${description}`);
  
  // En una implementación real, esto mostraría un toast en la UI
  // Pero para simplificar, solo lo registramos en la consola
  
  return {
    id: Date.now(),
    dismiss: () => {}
  };
}; 