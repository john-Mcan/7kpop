'use client';

import { useState } from "react";

interface SimpleCommentsProps {
  postId: number;
}

export default function SimpleComments({ postId }: SimpleCommentsProps) {
  return (
    <div className="p-4">
      <h2 className="font-medium mb-4">Comentarios</h2>
      
      {/* Formulario de comentario */}
      <div className="mb-6">
        <textarea
          placeholder="Escribe un comentario..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
        />
        <button 
          className="mt-2 px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-md text-sm"
        >
          Comentar
        </button>
      </div>
      
      {/* Lista de comentarios de ejemplo */}
      <div className="space-y-4">
        <div className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
              A
            </div>
            <div>
              <div className="font-medium text-sm">Ana García</div>
              <div className="text-xs text-gray-500">10 minutos atrás</div>
            </div>
          </div>
          <p className="text-sm mb-2">¡Gran publicación! Estoy totalmente de acuerdo con lo que dices.</p>
          <div className="flex gap-2">
            <button className="text-xs text-gray-500">Me gusta (12)</button>
            <button className="text-xs text-gray-500">Responder</button>
          </div>
          
          {/* Respuesta anidada */}
          <div className="ml-8 mt-3 border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                C
              </div>
              <div>
                <div className="font-medium text-sm">Carlos López</div>
                <div className="text-xs text-gray-500">5 minutos atrás</div>
              </div>
            </div>
            <p className="text-sm">Yo también, excelente punto de vista.</p>
          </div>
        </div>
        
        <div className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
              R
            </div>
            <div>
              <div className="font-medium text-sm">Roberto Méndez</div>
              <div className="text-xs text-gray-500">15 minutos atrás</div>
            </div>
          </div>
          <p className="text-sm">Interesante perspectiva. Me gustaría agregar que también hay otros factores a considerar.</p>
          <div className="flex gap-2">
            <button className="text-xs text-gray-500">Me gusta (8)</button>
            <button className="text-xs text-gray-500">Responder</button>
          </div>
        </div>
      </div>
    </div>
  );
} 