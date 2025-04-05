"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Flag,
  X,
  AlertTriangle,
  Ban,
  ShieldAlert,
  Info,
  Loader2,
  CheckCircle
} from "lucide-react";
import { reportPost } from "@/lib/services/posts";
import { useToast } from "@/components/ui/use-toast";

type ReportPostProps = {
  postId: string;
  postSlug?: string;
  fandomId?: string | null;
  isShareOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  commentId?: string;
};

const ReportPost = ({ postId, postSlug, fandomId, isShareOpen = false, onOpenChange, commentId }: ReportPostProps) => {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
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
  
  const handleReport = async (reason: string) => {
    setIsLoading(true);
    setError(null);
    setReportSent(false);

    try {
      let success: boolean;
      
      if (commentId) {
        // TO-DO: Implementar reportar comentario
        // En este caso, se debe crear una función similar a reportPost pero para comentarios
        throw new Error("La función para reportar comentarios aún no está implementada");
      } else {
        success = await reportPost(postId, fandomId || null, reason);
      }

      if (!success) {
        throw new Error('No se pudo enviar el reporte. Inténtalo de nuevo.');
      }

      // --- Éxito ---
      console.log(`Reporte enviado para ${commentId ? 'comentario' : 'publicación'} por: ${reason}`);
      setReportReason(reason);
      setReportSent(true);
      
      toast({
        title: "Reporte enviado",
        description: "Gracias por ayudarnos a mantener la comunidad segura.",
      });
      
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

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
      console.error("Error al reportar:", err);
      
      toast({
        title: "Error al enviar reporte",
        description: err.message || "No se pudo procesar tu reporte. Inténtalo de nuevo más tarde.",
        variant: "destructive"
      });
      
      // Mantener el modal abierto para mostrar el error por 5 segundos
      setTimeout(() => {
        setError(null); 
      }, 5000);
    } finally {
      setIsLoading(false);
    }
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
          
          {/* Estado de Carga */}
          {isLoading && (
            <div className="flex items-center justify-center py-4 text-gray-600">
              <Loader2 size={20} className="animate-spin mr-2" />
              <p className="text-sm">Enviando reporte...</p>
            </div>
          )}

          {/* Estado de Éxito */}
          {!isLoading && reportSent && !error && (
            <div className="text-center py-2">
              <div className="text-green-600 mb-2">
                <CheckCircle className="mx-auto h-8 w-8" />
              </div>
              <p className="text-sm text-gray-700">¡Gracias! Tu reporte ha sido enviado.</p>
              <p className="text-xs text-gray-500 mt-1">Revisaremos esta publicación pronto.</p>
            </div>
          )}

          {/* Estado de Error */}
          {!isLoading && error && (
            <div className="text-center py-2 px-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">Error al reportar</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          )}
          
          {/* Opciones de Reporte (solo si no está cargando, ni enviado con éxito, y sin error permanente) */}
          {!isLoading && !reportSent && !error && (
            <div className="flex flex-col gap-2 mt-3">
              {reportOptions.map((option) => (
                <Button 
                  key={option.id}
                  variant="outline" 
                  size="sm" 
                  className="justify-start text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  onClick={() => handleReport(option.id)}
                  disabled={isLoading}
                >
                  <span className="mr-2 text-gray-500">{option.icon}</span>
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