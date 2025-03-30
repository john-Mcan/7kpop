"use client";

import { useState } from "react";
import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell, Search, Send, MoreVertical, Check, X, Plus } from "lucide-react";
import Link from "next/link";
import UserAvatar from "@/components/ui/user-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Interfaces para los tipos de datos
interface Mensaje {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversacion {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface Notificacion {
  id: string;
  type: 'mention' | 'reply' | 'upvote' | 'mod_action' | 'system';
  content: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  actorName?: string;
  actorAvatar?: string;
}

export default function MensajesPage() {
  const [activeTab, setActiveTab] = useState<string>("mensajes");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState<boolean>(false);
  
  // Datos de ejemplo para conversaciones
  const conversaciones: Conversacion[] = [
    {
      id: "1",
      userId: "1",
      username: "jimin_bts",
      displayName: "Park Jimin",
      avatar: undefined,
      lastMessage: "Gracias por tu comentario en mi publicación! 💜",
      timestamp: "10:45 AM",
      unreadCount: 2
    },
    {
      id: "2",
      userId: "2",
      username: "rosie_bp",
      displayName: "Rosé",
      avatar: undefined,
      lastMessage: "¿Viste el nuevo MV de BLACKPINK?",
      timestamp: "Ayer",
      unreadCount: 0
    },
    {
      id: "3",
      userId: "3",
      username: "taehyung_v",
      displayName: "Kim Taehyung",
      avatar: undefined,
      lastMessage: "Estaré compartiendo más fotos pronto!",
      timestamp: "Martes",
      unreadCount: 0
    },
    {
      id: "4",
      userId: "4",
      username: "nayeon_twice",
      displayName: "Im Nayeon",
      avatar: undefined,
      lastMessage: "Los boletos para el concierto salen mañana!",
      timestamp: "Lunes",
      unreadCount: 0
    },
    {
      id: "5",
      userId: "5",
      username: "kai_exo",
      displayName: "Kim Jongin",
      avatar: undefined,
      lastMessage: "¿Qué te pareció la coreografía del nuevo sencillo?",
      timestamp: "23/03/2023",
      unreadCount: 0
    }
  ];

  // Mensajes de ejemplo para la conversación seleccionada
  const mensajesPorConversacion: Record<string, Mensaje[]> = {
    "1": [
      {
        id: "101",
        senderId: "1",
        senderName: "Park Jimin",
        senderUsername: "jimin_bts",
        content: "Hola! ¿Cómo estás?",
        timestamp: "10:30 AM",
        isRead: true
      },
      {
        id: "102",
        senderId: "current_user",
        senderName: "Tú",
        content: "¡Hola Jimin! Todo bien, me encantó tu último post sobre el comeback.",
        timestamp: "10:35 AM",
        isRead: true
      },
      {
        id: "103",
        senderId: "1",
        senderName: "Park Jimin",
        senderUsername: "jimin_bts",
        content: "Gracias! Estamos muy emocionados por compartir nueva música con ARMY.",
        timestamp: "10:40 AM",
        isRead: true
      },
      {
        id: "104",
        senderId: "1",
        senderName: "Park Jimin",
        senderUsername: "jimin_bts",
        content: "Gracias por tu comentario en mi publicación! 💜",
        timestamp: "10:45 AM",
        isRead: false
      },
      {
        id: "105",
        senderId: "1",
        senderName: "Park Jimin",
        senderUsername: "jimin_bts",
        content: "¿Irás al concierto de la próxima semana?",
        timestamp: "10:45 AM",
        isRead: false
      }
    ],
    "2": [
      {
        id: "201",
        senderId: "2",
        senderName: "Rosé",
        senderUsername: "rosie_bp",
        content: "¡Hola! ¿Viste nuestro nuevo MV?",
        timestamp: "Ayer",
        isRead: true
      }
    ]
  };

  // Datos de ejemplo para notificaciones
  const notificaciones: Notificacion[] = [
    {
      id: "1",
      type: "reply",
      content: "Lisa ha respondido a tu comentario: \"¡Totalmente de acuerdo! La coreografía es increíble.\"",
      timestamp: "10 minutos",
      isRead: false,
      actorName: "Lisa",
      link: "/fandoms/blackpink/posts/1"
    },
    {
      id: "2",
      type: "upvote",
      content: "Tu publicación sobre BTS ha recibido 15 nuevos votos positivos.",
      timestamp: "45 minutos",
      isRead: false,
      link: "/fandoms/bts/posts/5"
    },
    {
      id: "3",
      type: "mention",
      content: "Jungkook te ha mencionado en un comentario: \"@usuario Deberías ver esta presentación!\"",
      timestamp: "1 hora",
      isRead: true,
      actorName: "Jungkook",
      link: "/fandoms/bts/posts/3"
    },
    {
      id: "4",
      type: "system",
      content: "Tu solicitud para unirte al fandom de TWICE ha sido aprobada.",
      timestamp: "Ayer",
      isRead: true,
      link: "/fandoms/twice"
    },
    {
      id: "5",
      type: "mod_action",
      content: "Has sido designado como moderador del fandom NewJeans.",
      timestamp: "2 días",
      isRead: true,
      link: "/fandoms/newjeans/settings"
    }
  ];

  // Función para abrir conversación
  const handleOpenConversation = (id: string) => {
    setSelectedConversation(id);
    
    // En móvil abrimos el modal, en desktop cambiamos a la pestaña de conversaciones
    if (window.innerWidth < 768) {
      setShowModal(true);
    } else {
      setActiveTab("conversaciones");
    }
  };

  // Función para enviar mensaje
  const handleEnviarMensaje = () => {
    if (messageInput.trim() === "") return;
    console.log(`Enviando mensaje a conversación ${selectedConversation}: ${messageInput}`);
    setMessageInput("");
    // Aquí iría la lógica para enviar el mensaje a la base de datos
  };

  // Función para marcar notificaciones como leídas
  const handleMarcarLeida = (id: string) => {
    console.log(`Marcando notificación ${id} como leída`);
    // Aquí iría la lógica para actualizar el estado de la notificación
  };

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Contenido */}
        <main className="h-full flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto py-6 px-4 h-full">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Mensajes
                </h1>
              </div>
              
              <div className="relative w-full">
                <input 
                  type="search" 
                  placeholder="Buscar mensajes o usuarios..." 
                  className="w-full py-2 px-4 pr-10 rounded-full border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="mt-4 h-[calc(100%-5rem)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <TabsList className="w-full bg-white shadow-sm mb-3">
                  <TabsTrigger value="mensajes" className="flex-1 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Mensajes</span>
                      {conversaciones.reduce((acc, conv) => acc + conv.unreadCount, 0) > 0 && (
                        <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {conversaciones.reduce((acc, conv) => acc + conv.unreadCount, 0)}
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="conversaciones" className="hidden md:flex flex-1 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Conversaciones</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="notificaciones" className="flex-1 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span>Notificaciones</span>
                      {notificaciones.filter(n => !n.isRead).length > 0 && (
                        <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {notificaciones.filter(n => !n.isRead).length}
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mensajes" className="flex-1 overflow-hidden mt-0">
                  <div className="h-full overflow-y-auto pr-2">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Tus conversaciones</h3>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="rounded-full w-8 h-8 p-0 hover:bg-purple-100"
                        onClick={() => setShowNewMessageModal(true)}
                      >
                        <Plus className="w-4 h-4 text-purple-600" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {conversaciones.length > 0 ? (
                        conversaciones.map((conv) => (
                          <Card 
                            key={conv.id} 
                            className={`hover:shadow-md transition-all cursor-pointer ${
                              selectedConversation === conv.id
                                ? 'bg-purple-50 border-purple-200'
                                : 'bg-white border-gray-100'
                            }`}
                            onClick={() => handleOpenConversation(conv.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <UserAvatar text={conv.displayName.charAt(0)} size="md" />
                                  {conv.unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full border-2 border-white"></span>
                                  )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800">{conv.displayName}</span>
                                    <span className="text-xs text-gray-500">{conv.timestamp}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                                    {conv.unreadCount > 0 && (
                                      <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full ml-2">
                                        {conv.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay conversaciones</h3>
                          <p className="mt-1 text-sm text-gray-500">Inicia una nueva conversación para empezar a chatear.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="conversaciones" className="flex-1 overflow-hidden mt-0">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
                    {selectedConversation ? (
                      <>
                        {/* Encabezado de conversación */}
                        <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar 
                              text={conversaciones.find(c => c.id === selectedConversation)?.displayName.charAt(0) || "U"}
                              size="md" 
                            />
                            <div>
                              <p className="font-semibold text-gray-800">
                                {conversaciones.find(c => c.id === selectedConversation)?.displayName}
                              </p>
                              <p className="text-xs text-gray-500">
                                @{conversaciones.find(c => c.id === selectedConversation)?.username}
                              </p>
                            </div>
                          </div>
                          <button className="text-gray-500 hover:text-gray-700">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                          <div className="space-y-3">
                            {mensajesPorConversacion[selectedConversation]?.map((mensaje) => (
                              <div 
                                key={mensaje.id} 
                                className={`flex ${mensaje.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`flex gap-2 max-w-[80%] ${mensaje.senderId === 'current_user' ? 'flex-row-reverse' : ''}`}>
                                  {mensaje.senderId !== 'current_user' && (
                                    <div className="flex-shrink-0 mt-1">
                                      <UserAvatar text={mensaje.senderName.charAt(0)} size="sm" />
                                    </div>
                                  )}
                                  <div>
                                    <div 
                                      className={`p-3 rounded-2xl break-words ${
                                        mensaje.senderId === 'current_user' 
                                          ? 'bg-purple-600 text-white rounded-tr-none'
                                          : 'bg-white text-gray-800 rounded-tl-none'
                                      }`}
                                    >
                                      {mensaje.content}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 px-1">
                                      {mensaje.timestamp}
                                      {mensaje.senderId === 'current_user' && (
                                        <span className="ml-1">
                                          {mensaje.isRead ? (
                                            <Check className="inline-block w-3 h-3 text-purple-600" />
                                          ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 text-gray-400">
                                              <polyline points="9 11 12 14 22 4"></polyline>
                                            </svg>
                                          )}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Área de entrada de mensaje */}
                        <div className="p-3 bg-white border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input 
                                placeholder="Escribe un mensaje..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                className="border-gray-200 focus:border-purple-400"
                                onKeyDown={(e) => e.key === 'Enter' && handleEnviarMensaje()}
                              />
                            </div>
                            <Button 
                              onClick={handleEnviarMensaje}
                              className="bg-purple-600 hover:bg-purple-700 rounded-full"
                              size="icon"
                              disabled={messageInput.trim() === ""}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Tus conversaciones</h3>
                        <p className="text-sm text-gray-600 mb-4 max-w-sm">
                          Selecciona una conversación para comenzar a chatear o inicia una nueva conversación
                        </p>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700 px-4"
                          onClick={() => setShowNewMessageModal(true)}
                        >
                          Nuevo mensaje
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notificaciones" className="flex-1 overflow-y-auto mt-0">
                  <div className="space-y-2">
                    {notificaciones.length > 0 ? (
                      notificaciones.map((notif) => (
                        <Card 
                          key={notif.id} 
                          className={`hover:shadow-md transition-all ${notif.isRead ? 'bg-white' : 'bg-purple-50 border-purple-100'}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {notif.actorAvatar ? (
                                  <img 
                                    src={notif.actorAvatar} 
                                    alt={notif.actorName || "Usuario"} 
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : notif.actorName ? (
                                  <UserAvatar text={notif.actorName.charAt(0)} size="md" />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    notif.type === 'system' ? 'bg-blue-100' : 
                                    notif.type === 'upvote' ? 'bg-green-100' : 
                                    notif.type === 'mention' ? 'bg-yellow-100' : 
                                    notif.type === 'mod_action' ? 'bg-purple-100' : 'bg-gray-100'
                                  }`}>
                                    {notif.type === 'reply' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                                    {notif.type === 'upvote' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"></path>
                                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                      </svg>
                                    )}
                                    {notif.type === 'mention' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                                        <circle cx="12" cy="12" r="4"></circle>
                                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                                      </svg>
                                    )}
                                    {notif.type === 'system' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                      </svg>
                                    )}
                                    {notif.type === 'mod_action' && (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                      </svg>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm text-gray-800">{notif.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                                  </div>
                                  {!notif.isRead && (
                                    <button 
                                      onClick={() => handleMarcarLeida(notif.id)}
                                      className="text-gray-400 hover:text-purple-600 p-1.5"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                {notif.link && (
                                  <div className="mt-2">
                                    <Link 
                                      href={notif.link}
                                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                    >
                                      Ver
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <Bell className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
                        <p className="mt-1 text-sm text-gray-500">No tienes notificaciones nuevas por ahora.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>

        {/* Columna derecha - Tendencias */}
        <TrendingSidebar />
      </div>
      
      {/* Navegación móvil */}
      <MobileNav />

      {/* Modal para conversación en móviles */}
      {selectedConversation && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-md p-0 h-[90vh] max-h-[600px] flex flex-col [&>button]:hidden">
            {/* Encabezado de conversación */}
            <DialogHeader className="p-3 border-b">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => setShowModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <UserAvatar 
                    text={conversaciones.find(c => c.id === selectedConversation)?.displayName.charAt(0) || "U"}
                    size="md" 
                  />
                  <DialogTitle className="m-0 p-0">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {conversaciones.find(c => c.id === selectedConversation)?.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{conversaciones.find(c => c.id === selectedConversation)?.username}
                      </p>
                    </div>
                  </DialogTitle>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3">
                {mensajesPorConversacion[selectedConversation]?.map((mensaje) => (
                  <div 
                    key={mensaje.id} 
                    className={`flex ${mensaje.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${mensaje.senderId === 'current_user' ? 'flex-row-reverse' : ''}`}>
                      {mensaje.senderId !== 'current_user' && (
                        <div className="flex-shrink-0 mt-1">
                          <UserAvatar text={mensaje.senderName.charAt(0)} size="sm" />
                        </div>
                      )}
                      <div>
                        <div 
                          className={`p-3 rounded-2xl break-words ${
                            mensaje.senderId === 'current_user' 
                              ? 'bg-purple-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 rounded-tl-none'
                          }`}
                        >
                          {mensaje.content}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-1">
                          {mensaje.timestamp}
                          {mensaje.senderId === 'current_user' && (
                            <span className="ml-1">
                              {mensaje.isRead ? (
                                <Check className="inline-block w-3 h-3 text-purple-600" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 text-gray-400">
                                  <polyline points="9 11 12 14 22 4"></polyline>
                                </svg>
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Área de entrada de mensaje */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input 
                    placeholder="Escribe un mensaje..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="border-gray-200 focus:border-purple-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleEnviarMensaje()}
                  />
                </div>
                <Button 
                  onClick={handleEnviarMensaje}
                  className="bg-purple-600 hover:bg-purple-700 rounded-full"
                  size="icon"
                  disabled={messageInput.trim() === ""}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal para nuevo mensaje */}
      <Dialog open={showNewMessageModal} onOpenChange={setShowNewMessageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo mensaje</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Para:</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  className="w-full py-2 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Mensaje:</label>
              <textarea 
                rows={4}
                placeholder="Escribe tu mensaje..."
                className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => setShowNewMessageModal(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 