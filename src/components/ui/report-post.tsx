"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Flag,
  X,
  AlertTriangle,
  Ban,
  ShieldAlert,
  Info
} from "lucide-react";

type ReportPostProps = {
  postId: number;
  postSlug?: string;
  isShareOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

const ReportPost = ({ postId, postSlug, isShareOpen = false, onOpenChange }: ReportPostProps) => {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  
  // Cerrar este modal si el modal de compartir está abierto
  useEffect(() => {
    if (isShareOpen && showReportOptions) {
      setShowReportOptions(false);
    }
  }, [isShareOpen]);
  
  const reportOptions = [
    { id: 'spam', label: 'Spam', icon: <Ban size={16} /> },
    { id: 'harmful', label: 'Contenido dañino', icon: <AlertTriangle size={16} /> },
    { id: 'inappropriate', label: 'Contenido inapropiado', icon: <ShieldAlert size={16} /> },
    { id: 'other', label: 'Otro motivo', icon: <Info size={16} /> }
  ];
  
  const handleReport = (reason: string) => {
    // Simulación de envío de reporte
    console.log(`Reportando publicación ${postId} por: ${reason}`);
    setReportReason(reason);
    setReportSent(true);
    
    // Reset después de 3 segundos
    setTimeout(() => {
      setShowReportOptions(false);
      setReportSent(false);
      setReportReason(null);
      // Notificar al componente padre que se cerró
      if (onOpenChange) {
        onOpenChange(false);
      }
    }, 3000);
  };

  const handleToggleOptions = () => {
    const newState = !showReportOptions;
    setShowReportOptions(newState);
    // Notificar al componente padre del cambio de estado
    if (onOpenChange) {
      onOpenChange(newState);
    }
  };
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 text-gray-600 hover:text-red-600 rounded-full"
        onClick={handleToggleOptions}
      >
        <Flag size={16} />
        <span className="hidden sm:inline">Reportar</span>
      </Button>
      
      {showReportOptions && (
        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-md p-3 border border-gray-100 z-10 w-60">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Reportar publicación</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-gray-100"
              onClick={handleToggleOptions}
            >
              <X size={14} />
            </Button>
          </div>
          
          {reportSent ? (
            <div className="text-center py-2">
              <div className="text-green-600 mb-2">
                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Gracias por reportar. Revisaremos esta publicación.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-3">
              {reportOptions.map((option) => (
                <Button 
                  key={option.id}
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => handleReport(option.id)}
                >
                  <span className="mr-2 text-red-500">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportPost; 