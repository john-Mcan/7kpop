"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Share,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Copy,
  Check,
  X
} from "lucide-react";

type SharePostProps = {
  postTitle: string;
  postSlug: string;
  isReportOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

const SharePost = ({ postTitle, postSlug, isReportOpen = false, onOpenChange }: SharePostProps) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Cerrar este modal si el modal de reportar está abierto
  useEffect(() => {
    if (isReportOpen && showShareOptions) {
      setShowShareOptions(false);
    }
  }, [isReportOpen]);
  
  const fullPostUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?post=${postSlug}`
    : `/?post=${postSlug}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullPostUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('No se pudo copiar el enlace:', err);
    }
  };
  
  const shareViaTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(fullPostUrl)}`;
    window.open(twitterUrl, '_blank');
  };
  
  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullPostUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleToggleOptions = () => {
    const newState = !showShareOptions;
    setShowShareOptions(newState);
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
        className="flex items-center gap-1 text-gray-600 hover:text-purple-700 rounded-full"
        onClick={handleToggleOptions}
      >
        <Share size={16} />
        <span className="hidden sm:inline">Compartir</span>
      </Button>
      
      {showShareOptions && (
        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-md p-3 border border-gray-100 z-10 w-60">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Compartir publicación</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-gray-100"
              onClick={handleToggleOptions}
            >
              <X size={14} />
            </Button>
          </div>
          
          <div className="flex flex-col gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-blue-500 hover:text-blue-600"
              onClick={shareViaTwitter}
            >
              <Twitter size={16} className="mr-2" />
              Twitter
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-blue-700 hover:text-blue-800"
              onClick={shareViaFacebook}
            >
              <Facebook size={16} className="mr-2" />
              Facebook
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className={`justify-start ${copied ? 'text-green-600' : 'text-gray-600'}`}
              onClick={handleCopyLink}
            >
              {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
              {copied ? 'Copiado!' : 'Copiar enlace'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharePost; 