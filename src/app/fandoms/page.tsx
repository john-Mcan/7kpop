"use client";

import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FandomAvatar } from "@/components/ui/fandom-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function FandomsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    reason: "",
    social: ""
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    reason: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // Simulación de verificación de login (en un caso real, esto vendría de un contexto de autenticación)
  useEffect(() => {
    // Aquí podrías verificar si el usuario está logeado con una cookie, token, etc.
    // Por ahora, simulamos que no está logeado
    setIsLoggedIn(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('fandom-', '');
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Limpiar el error cuando se escribe
    if (fieldName !== 'social' && formErrors[fieldName as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      reason: !formData.reason.trim()
    };
    
    setFormErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = () => {
    if (!isLoggedIn) {
      setShowLoginAlert(true);
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulación de envío al servidor
      setTimeout(() => {
        alert("¡Solicitud enviada con éxito! Te notificaremos cuando sea revisada.");
        setIsSubmitting(false);
        setModalOpen(false);
        // Resetear el formulario
        setFormData({
          name: "",
          description: "",
          reason: "",
          social: ""
        });
      }, 1000);
    }
  };

  const handleButtonClick = () => {
    if (!isLoggedIn) {
      setShowLoginAlert(true);
    } else {
      setModalOpen(true);
    }
  };

  // Datos de ejemplo para los fandoms
  const fandoms = [
    {
      id: 1,
      nombre: "BTS",
      descripcion: "El fandom oficial de BTS (Bangtan Sonyeondan) en 7Kpop",
      miembros: 15600,
      posts: 4325,
      imagenColor: "from-purple-600 to-purple-400",
      inicial: "B"
    },
    {
      id: 2,
      nombre: "BLACKPINK",
      descripcion: "Comunidad de BLINKS en América Latina",
      miembros: 12450,
      posts: 3189,
      imagenColor: "from-pink-600 to-pink-400",
      inicial: "B"
    },
    {
      id: 3,
      nombre: "TWICE",
      descripcion: "Para todos los ONCE que aman a TWICE",
      miembros: 10230,
      posts: 2876,
      imagenColor: "from-orange-500 to-yellow-400",
      inicial: "T"
    },
    {
      id: 4,
      nombre: "SEVENTEEN",
      descripcion: "El hogar de CARATS en 7Kpop",
      miembros: 9800,
      posts: 2567,
      imagenColor: "from-indigo-600 to-indigo-400",
      inicial: "S"
    },
    {
      id: 5,
      nombre: "NewJeans",
      descripcion: "Comunidad para fans de NewJeans",
      miembros: 8700,
      posts: 2198,
      imagenColor: "from-blue-600 to-blue-400",
      inicial: "N"
    },
    {
      id: 6,
      nombre: "aespa",
      descripcion: "Para MY que apoyan a aespa",
      miembros: 7800,
      posts: 1876,
      imagenColor: "from-purple-500 to-blue-400",
      inicial: "A"
    },
    {
      id: 7,
      nombre: "Stray Kids",
      descripcion: "El lugar de STAY en 7Kpop",
      miembros: 7500,
      posts: 1789,
      imagenColor: "from-red-600 to-red-400",
      inicial: "S"
    },
    {
      id: 8,
      nombre: "IVE",
      descripcion: "Comunidad para DIVE",
      miembros: 6900,
      posts: 1678,
      imagenColor: "from-violet-600 to-violet-400",
      inicial: "I"
    }
  ];

  // Categorías de fandoms
  const categorias = [
    { id: 1, nombre: "Populares", activo: true },
    { id: 2, nombre: "Recientes", activo: false },
    { id: 3, nombre: "Boy Groups", activo: false },
    { id: 4, nombre: "Girl Groups", activo: false },
    { id: 5, nombre: "Solistas", activo: false }
  ];

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Feed de contenido */}
        <main className="h-full flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Fandoms
                </h1>
                
                <div className="dropdown relative">
                  <Button variant="outline" className="flex items-center justify-center gap-1 text-sm rounded-full bg-white border-gray-200 shadow-sm hover:bg-gray-50">
                    <span>Populares</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="relative w-full">
                <input 
                  type="search" 
                  placeholder="Buscar fandom..." 
                  className="w-full py-2 px-4 pr-10 rounded-full border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Categorías */}
            <div className="mt-6 pb-2 overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2 min-w-max">
                {categorias.map((categoria) => (
                  <Button
                    key={categoria.id}
                    variant={categoria.activo ? "default" : "outline"}
                    className={`rounded-full text-sm font-medium px-4 py-1 ${
                      categoria.activo
                        ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-sm"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {categoria.nombre}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Grid de fandoms */}
            <div className="mt-6 grid grid-cols-1 gap-4">
              {fandoms.map((fandom) => (
                <Link key={fandom.id} href={`/fandoms/${fandom.id}`} className="group">
                  <Card className="bg-white border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-purple-100 transition-all overflow-hidden h-full">
                    <div className="p-4 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3 justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar del fandom */}
                          <div className="w-12 h-12 shrink-0">
                            <FandomAvatar 
                              alt={fandom.nombre}
                              initial={fandom.inicial}
                            />
                          </div>
                          
                          {/* Nombre del fandom */}
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {fandom.nombre}
                          </h3>
                        </div>
                        
                        {/* Botón de seguir */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full bg-white border-purple-200 text-purple-600 hover:bg-purple-50 transition-all"
                        >
                          Seguir
                        </Button>
                      </div>
                      
                      {/* Descripción */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-shrink">
                        {fandom.descripcion}
                      </p>
                      
                      {/* Separador que empuja las estadísticas hacia abajo */}
                      <div className="flex-grow"></div>
                      
                      {/* Estadísticas */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-purple-500">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span className="font-medium">{fandom.miembros.toLocaleString()}</span>
                          <span>&nbsp;miembros</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-purple-500">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span className="font-medium">{fandom.posts.toLocaleString()}</span>
                          <span>&nbsp;posts</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Botón para solicitar nuevo fandom */}
            <div className="mt-8 flex justify-center">
              <Button 
                className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:shadow hover:opacity-90 transition-all flex items-center gap-2"
                onClick={handleButtonClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Solicitar nuevo fandom
              </Button>
            </div>
          </div>
        </main>

        {/* Columna derecha - Tendencias */}
        <TrendingSidebar />
      </div>
      
      {/* Alerta de inicio de sesión */}
      {showLoginAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">Inicio de sesión requerido</h3>
            <p className="text-gray-600 mb-4">
              Para solicitar la creación de un nuevo fandom, debes iniciar sesión en tu cuenta.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowLoginAlert(false)}
                className="rounded-full"
              >
                Cancelar
              </Button>
              <Button 
                className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white"
                onClick={() => {
                  setShowLoginAlert(false);
                  // En un caso real, redirigirías a la página de login
                  // window.location.href = '/login';
                }}
              >
                Iniciar sesión
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para solicitar nuevo fandom */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Solicitar nuevo fandom</DialogTitle>
            <DialogDescription>
              Envía tu solicitud para crear un nuevo fandom en 7Kpop. Revisaremos tu solicitud y te notificaremos cuando sea aprobada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fandom-name">Nombre del grupo/artista *</Label>
              <Input 
                id="fandom-name" 
                placeholder="Ej. IVE, BTS, BLACKPINK..." 
                value={formData.name}
                onChange={handleInputChange}
                className={formErrors.name ? "border-red-500 focus-visible:ring-red-400" : ""}
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fandom-description">Descripción del fandom *</Label>
              <Textarea 
                id="fandom-description" 
                placeholder="Escribe una breve descripción sobre este fandom..." 
                className={`min-h-[80px] ${formErrors.description ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                value={formData.description}
                onChange={handleInputChange}
              />
              {formErrors.description && (
                <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fandom-reason">¿Por qué deberíamos aprobar este fandom? *</Label>
              <Textarea 
                id="fandom-reason" 
                placeholder="Cuéntanos por qué este fandom sería valioso para la comunidad..." 
                className={`min-h-[100px] ${formErrors.reason ? "border-red-500 focus-visible:ring-red-400" : ""}`}
                value={formData.reason}
                onChange={handleInputChange}
              />
              {formErrors.reason && (
                <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fandom-social">Enlaces a redes sociales (opcional)</Label>
              <Input 
                id="fandom-social" 
                placeholder="Instagram, Twitter, etc." 
                value={formData.social}
                onChange={handleInputChange}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">* Campos obligatorios</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setModalOpen(false)}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button 
              className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Navegación móvil */}
      <MobileNav />
    </>
  );
} 