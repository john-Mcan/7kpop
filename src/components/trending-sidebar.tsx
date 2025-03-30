"use client";

import Link from "next/link";
import { Star, Users, ThumbsUp, MessageSquare } from "lucide-react";

const TrendingSidebar = () => {
  // Datos de ejemplo para las tendencias
  const trendingPosts = [
    {
      id: 1,
      slug: "nueva-cancion-de-bts-arrasa-en-las-listas",
      title: "Nueva canción de BTS arrasa en las listas",
      fandom: "BTS",
      likes: 2453,
      comments: 873,
    },
    {
      id: 2,
      slug: "blackpink-anuncia-gira-latinoamericana",
      title: "BLACKPINK anuncia gira latinoamericana",
      fandom: "BLACKPINK",
      likes: 1982,
      comments: 631,
    },
    {
      id: 3,
      slug: "twice-lanza-nueva-coleccion-de-merchandising",
      title: "TWICE lanza nueva colección de merchandising",
      fandom: "TWICE",
      likes: 1540,
      comments: 412,
    }
  ];

  // Fandoms populares
  const popularFandoms = [
    { name: "BTS", letter: "B", color: "from-purple-600 to-indigo-600" },
    { name: "BLACKPINK", letter: "B", color: "from-pink-500 to-purple-600" },
    { name: "TWICE", letter: "T", color: "from-purple-500 to-pink-500" },
    { name: "Stray Kids", letter: "S", color: "from-indigo-600 to-blue-500" },
    { name: "Aespa", letter: "A", color: "from-purple-600 to-purple-900" },
  ];

  return (
    <div className="h-full w-80 bg-gray-50 p-6 hidden lg:block">
      <div className="sticky top-6">
        {/* Sección de Tendencias */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold flex items-center mb-5 bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
            <Star size={18} className="mr-2 text-purple-600" />
            Tendencias
          </h2>
          
          <div className="space-y-3">
            {trendingPosts.map((post) => (
              <Link 
                href={`/?post=${post.slug}`} 
                key={post.id}
                className="block"
              >
                <div className="p-4 rounded-xl bg-white shadow-sm hover:shadow transition-all duration-200 relative border border-gray-100 hover:border-gray-200">
                  <h3 className="font-medium text-gray-800 hover:text-purple-700 transition-colors leading-tight">
                    {post.title}
                  </h3>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-purple-600 text-xs font-medium px-2 py-1 bg-purple-50 rounded-full">
                      #{post.fandom}
                    </span>
                    
                    <div className="flex items-center space-x-3 text-gray-500 text-xs">
                      <div className="flex items-center">
                        <ThumbsUp size={12} className="mr-1.5 text-gray-400" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare size={12} className="mr-1.5 text-gray-400" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Sección de Fandoms Populares */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold flex items-center mb-5 bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
            <Users size={18} className="mr-2 text-purple-600" />
            Fandoms Populares
          </h2>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-4 justify-between">
              {popularFandoms.map((fandom, index) => (
                <Link 
                  href={`/fandoms/${fandom.name.toLowerCase()}`} 
                  key={index} 
                  className="flex flex-col items-center hover:scale-105 transition-transform duration-200"
                >
                  <div className={`bg-gradient-to-br ${fandom.color} text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold shadow-sm hover:shadow-md`}>
                    {fandom.letter}
                  </div>
                  <span className="text-xs mt-2 text-gray-700 font-medium">{fandom.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingSidebar;