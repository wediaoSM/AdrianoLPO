import React from 'react';
import { ChevronDown } from 'lucide-react';

const smoothScrollTo = (id: string) => {
  const element = document.querySelector(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden bg-luxury-950 rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl shadow-black/80 z-10">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}hero.png`}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop";
          }}
          alt="Adriano Rodrigo Mentor"
          className="w-full h-full object-cover object-center mix-blend-normal"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-950/30 via-transparent to-luxury-950/60"></div>
      </div>

      {/* Content - Adjusted size and positioning as requested */}
      <div className="relative z-10 container mx-auto px-6 pb-8 md:pb-0 pt-8 md:pt-0 animate-fade-up">
        <div className="max-w-md md:ml-4 lg:ml-12 border-l border-gold-500/30 pl-6 md:pl-8 py-4 mt-44 md:mt-64 bg-luxury-950/40 backdrop-blur-sm rounded-2xl">
          <p className="text-gold-500/80 text-[10px] font-bold tracking-[0.2em] uppercase mb-2 shadow-black drop-shadow-md">
            Mentor de Posicionamento
          </p>
          
          <h1 className="font-serif text-2xl md:text-4xl text-white mb-4 leading-tight drop-shadow-lg">
            Adriano <br className="hidden md:block"/>
            <span className="text-gold-200/90">Rodrigo</span>
          </h1>

          <div className="space-y-1 mb-6">
            <p className="text-sm md:text-base text-gray-400 font-light drop-shadow-md max-w-xs">
              Você não precisa de mais velocidade.
            </p>
            <p className="text-base md:text-lg text-gold-400 font-serif italic drop-shadow-md">
              Precisa de direção.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="#metodo"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo('#metodo');
              }}
              className="inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-gold-600 text-white uppercase tracking-widest text-[10px] font-bold hover:bg-gold-500 transition-all duration-300 shadow-lg shadow-black/40 rounded-full w-fit cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-luxury-950"
              aria-label="Conhecer a metodologia Rota 360"
            >
              Conheça a Rota 360
            </a>
            <a 
              href="#sobre"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo('#sobre');
              }}
              className="inline-flex justify-center items-center gap-2 px-5 py-2.5 border border-gold-600/30 text-gold-100 uppercase tracking-widest text-[10px] font-bold hover:bg-gold-600/10 hover:border-gold-500 transition-all duration-300 backdrop-blur-sm rounded-full w-fit cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-luxury-950"
              aria-label="Saber mais sobre Adriano Rodrigo"
            >
              Sobre Mim
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-gold-500/30 animate-bounce hidden md:block z-20">
        <ChevronDown size={24} />
      </div>
    </section>
  );
};
