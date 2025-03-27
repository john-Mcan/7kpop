import { useState, useEffect } from 'react';

export function useDeviceDetect(mobileWidth = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < mobileWidth);
    };
    
    // Revisar inmediatamente
    checkIfMobile();
    
    // Actualizar en redimensionamiento
    window.addEventListener("resize", checkIfMobile);
    
    // Limpieza
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [mobileWidth]);

  return { isMobile };
} 