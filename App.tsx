import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Map, 
  Target, 
  Calendar, 
  Mic, 
  GraduationCap, 
  Menu,
  X,
  Instagram,
  Linkedin,
  Mail,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Plus,
  Save,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Loader,
  LogOut,
  Edit2,
  Share2,
  TrendingUp,
  BarChart3,
  SortAsc,
  Eye,
  MessageCircle
} from 'lucide-react';
import { LoginModal } from './src/components/LoginModal';
import { Toast } from './components/Toast';
import { ImageCropModal } from './components/ImageCropModal';
import { onAuthChange, logout as firebaseLogout, isAuthenticated as checkAuth } from './src/services/auth.service';
import { getAllEvents, createEvent, deleteEvent as deleteEventFromDB, updateEvent } from './src/services/firestore.service';
import { uploadEventImage } from './src/services/storage.service';
import { saveToCache, getFromCache } from './src/services/cache.service';

// --- Constants & Data ---

const NAV_LINKS = [
  { name: 'Rota 360', href: '#metodo', icon: Compass },
  { name: 'Agenda', href: '#agenda', action: 'agenda', icon: Calendar },
  { name: 'Sobre Mim', href: '#sobre', action: 'about', icon: Target },
  { name: 'Contato', href: '#contato', icon: Mail },
];

// Default WhatsApp message used across CTAs (URL encoded for links)
const WHATSAPP_DEFAULT_MESSAGE = 'Olá, vi o site e o método Rota 360. Gostaria de agendar uma sessão para alinhar minha direção e meu posicionamento.';
const WHATSAPP_PHONE = '5511999999999'; // Substitua pelo seu número
const WA_LINK = (phone) => `https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Substitua pelo seu ID do GA4

// Smooth scroll helper
const smoothScrollTo = (id) => {
  const element = document.querySelector(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const INITIAL_EVENTS = [
  {
    id: 1,
    city: 'SÃO PAULO/SP',
    venue: 'HOTEL FASANO',
    date: '15, 16 e 17 de Outubro',
    time: '09:00 - 18:00',
    title: 'IMERSÃO ROTA 360°',
    description: 'Treinamento intensivo presencial com foco em desbloqueio emocional e clareza de propósito.',
    image: 'https://images.unsplash.com/photo-1544168190-79c17527004f?q=80&w=800&auto=format&fit=crop',
    status: 'Últimas Vagas',
    schedule: [
      { time: '09:00', activity: 'Credenciamento & Café de Boas-vindas' },
      { time: '10:00', activity: 'Sessão 1: O Despertar da Consciência' },
      { time: '13:00', activity: 'Almoço de Networking' },
      { time: '14:30', activity: 'Sessão 2: Mapeamento de Bloqueios' },
      { time: '17:00', activity: 'Dinâmica de Encerramento' }
    ]
  },
  {
    id: 2,
    city: 'RIO DE JANEIRO/RJ',
    venue: 'CENTRO DE CONVENÇÕES',
    date: '28 e 29 de Novembro',
    time: '14:00 - 20:00',
    title: 'LIDERANÇA & VISÃO',
    description: 'Como líderes podem guiar suas equipes com mais clareza e menos imposição.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
    status: 'Inscrições Abertas',
    schedule: [
      { time: '14:00', activity: 'Check-in' },
      { time: '15:00', activity: 'Liderança Consciente' },
      { time: '17:00', activity: 'Coffee Break' },
      { time: '18:00', activity: 'Construção de Cultura Forte' }
    ]
  },
  {
    id: 3,
    city: 'CURITIBA/PR',
    venue: 'OPERA DE ARAME',
    date: '10 de Dezembro',
    time: '19:00 - 22:00',
    title: 'EXPANSÃO DE CONSCIÊNCIA',
    description: 'Um evento único para fechar o ano com alinhamento total de rota e vida.',
    image: 'https://images.unsplash.com/photo-1475721027767-p05a6dbd4128?q=80&w=800&auto=format&fit=crop',
    status: 'Lista de Espera',
    schedule: [
      { time: '19:00', activity: 'Abertura dos Portões' },
      { time: '20:00', activity: 'Palestra Magna: O Próximo Nível' },
      { time: '21:30', activity: 'Sessão de Perguntas e Respostas' }
    ]
  }
];

const CARDS = [
  {
    id: 'rota',
    title: 'ROTA 360°',
    subtitle: 'Direção & Clareza',
    description: 'Leitura completa da vida.',
    image: `${import.meta.env.BASE_URL}rota.jpg`,
    icon: <Compass className="w-6 h-6" />,
    link: '#metodo',
    pdf: `${import.meta.env.BASE_URL}pdfs/rota360.pdf`,
    action: null
  },
  {
    id: 'agenda',
    title: 'AGENDA',
    subtitle: 'Próximos Passos',
    description: 'Eventos e imersões.',
    image: `${import.meta.env.BASE_URL}agenda.jpg`,
    icon: <Calendar className="w-6 h-6" />,
    link: '#agenda',
    action: 'agenda' // Identificador para ação especial
  },
  {
    id: 'palestra',
    title: 'PALESTRA',
    subtitle: 'Visão & Impacto',
    description: 'Para empresas e líderes.',
    image: `${import.meta.env.BASE_URL}palestra.jpg`,
    icon: <Mic className="w-6 h-6" />,
    link: '#contato',
    pdf: `${import.meta.env.BASE_URL}pdfs/palestra.pdf`,
    action: null
  },
  {
    id: 'mentoria',
    title: 'MENTORIA',
    subtitle: 'Acompanhamento',
    description: 'Ajuste fino de rota.',
    image: `${import.meta.env.BASE_URL}mentoria.jpg`,
    icon: <GraduationCap className="w-6 h-6" />,
    link: '#contato',
    pdf: `${import.meta.env.BASE_URL}pdfs/mentoria.pdf`,
    action: null
  }
];

const PILLARS = [
  { title: 'Consciência', text: 'Conduzir o indivíduo à lucidez sobre si, suas escolhas e seus limites.' },
  { title: 'Visão', text: 'Treinar o olhar, ampliar a percepção e revelar o que não é visto.' },
  { title: 'Direção', text: 'Ajustar a rota com propósito, responsabilidade e clareza.' },
  { title: 'Identidade', text: 'Reconectar a pessoa à sua verdade e coerência interna.' },
  { title: 'Expansão', text: 'Transformar pequenos ajustes em crescimento sustentável.' },
];

const VALUES = [
  { title: 'Verdade', text: 'A transformação começa quando você para de se esconder de si mesmo.' },
  { title: 'Responsabilidade', text: 'Crescimento não é sorte, é consequência das escolhas.' },
  { title: 'Clareza', text: 'Direção nasce de percepção limpa, não de impulsos.' },
  { title: 'Propósito', text: 'Cada decisão deve sustentar quem você escolheu ser.' },
  { title: 'Coerência', text: 'A vida responde ao que você faz, não ao que você apenas deseja.' },
  { title: 'Consciência', text: 'Nenhuma expansão é real quando não existe presença.' },
];

// --- Components ---

const Header = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeBtnRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // focus the close button for accessibility
      setTimeout(() => closeBtnRef.current && closeBtnRef.current.focus(), 10);
    }
  }, [isOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prev;
    }
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`relative z-50 transition-all duration-500 ${scrolled ? 'bg-luxury-950/95 backdrop-blur-md py-3 border-b border-luxury-800 shadow-2xl' : 'bg-transparent py-5'}`}>
      <div className="w-full px-6 flex justify-between items-center">
        <a href="#" onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center group cursor-pointer">
          <span className="font-sans text-xs tracking-[0.1em] text-gold-200 font-normal group-hover:text-gold-400 transition-colors">Adriano</span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-gray-500 group-hover:text-gold-300 transition-colors font-light">Rodrigo</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-6">
          {NAV_LINKS.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                if (link.action === 'agenda') {
                  onNavigate && onNavigate('agenda');
                } else if (link.action === 'about') {
                  onNavigate && onNavigate('about');
                } else {
                  smoothScrollTo(link.href);
                }
              }}
              className="text-[9px] font-light tracking-[0.15em] uppercase text-gray-500 hover:text-gold-400 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold-500 rounded-sm px-1.5 py-0.5"
              aria-label={`Navegar para seção ${link.name}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gold-200 p-2 rounded-full hover:bg-white/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 transition-transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} md:hidden`} role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        <div className="relative z-50 h-full bg-luxury-950 overflow-auto p-6 flex flex-col">
          <div className="relative mb-4 border-b border-luxury-800/20 pb-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="text-gold-200 font-serif text-sm tracking-[0.15em]">ADRIANO</div>
                <div className="text-xs text-gray-400 uppercase tracking-[0.2em]">Mentor</div>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <button ref={closeBtnRef} onClick={() => setIsOpen(false)} aria-label="Fechar menu" className="text-gray-400 hover:text-white p-2 rounded-full bg-white/5">
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="mt-4 space-y-3 flex-1 flex flex-col items-center justify-center">
            {NAV_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  
                  setTimeout(() => {
                    if (link.name === 'Rota 360') {
                      setIsOpen(false);
                      setTimeout(() => {
                        const target = document.querySelector('#metodo');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          try { window.history.replaceState(null, '', '#metodo'); } catch {}
                        }
                      }, 400);
                    } else if (link.action === 'agenda') {
                      setIsOpen(false);
                      onNavigate && onNavigate('agenda');
                    } else if (link.action === 'about') {
                      setIsOpen(false);
                      onNavigate && onNavigate('about');
                    } else {
                      setIsOpen(false);
                      setTimeout(() => {
                        const target = document.querySelector(link.href);
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          try { window.history.replaceState(null, '', link.href); } catch {}
                        }
                      }, 400);
                    }
                  }, 400);
                }}
                className="w-full max-w-[280px] flex items-center gap-3 rounded-xl px-4 py-3 bg-luxury-900 border border-luxury-800/30 hover:border-gold-500/30 transition-all justify-center"
              >
                <span className="text-gold-500"><link.icon className="w-4 h-4" /></span>
                <span className="text-center text-sm font-light uppercase tracking-[0.12em] text-white">{link.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4">
            <a href={WA_LINK('5511999999999')} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="w-full inline-flex justify-center items-center gap-2 bg-gold-600 text-black font-semibold uppercase tracking-[0.15em] px-4 py-2.5 rounded-full text-xs">
              Agendar Conversa
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ onNavigate }) => {
  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex flex-col justify-end overflow-hidden bg-luxury-950 rounded-b-[3rem] md:rounded-b-[5rem] shadow-2xl shadow-black/80 z-10">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}hero-v2.png`}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop";
          }}
          alt="Adriano Rodrigo Mentor"
          className="w-full h-full object-cover object-center mix-blend-normal"
        />
        {/* Gradient mais forte no bottom para destacar texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/85"></div>
      </div>

      {/* Content - Posicionado bem embaixo, longe do rosto */}
      <div className="relative z-10 container mx-auto px-6 pb-8 md:pb-12">
        <div className="max-w-md md:ml-8 lg:ml-16 border-l border-gold-300 pl-6 md:pl-8 py-3">
          <h1 className="font-sans text-2xl md:text-3xl text-white mb-1 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] font-light tracking-tight">
            Adriano Rodrigo
          </h1>
          <p className="text-gold-200 text-[9px] font-bold tracking-[0.2em] uppercase mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Mentor de Posicionamento
          </p>

          <div className="space-y-1.5 mb-4">
            <p className="text-xs md:text-sm text-white font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-snug">
              Você não precisa de mais velocidade.
            </p>
            <p className="text-sm md:text-base text-gold-200 font-medium drop-shadow-[0_2px-10px_rgba(0,0,0,0.9)]">
              Precisa de direção.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={(e) => {
                e.preventDefault();
                onNavigate && onNavigate('about');
              }}
              className="inline-flex justify-center items-center gap-2 px-5 py-2.5 border-2 border-white bg-white/90 text-black tracking-wide text-[10px] font-bold hover:bg-white hover:border-white transition-all duration-300 shadow-2xl rounded-full w-fit cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-luxury-950"
              aria-label="Saber mais sobre Adriano Rodrigo"
            >
              Sobre Mim
            </button>
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

const QuickLinks = ({ onNavigate, onOpenPdfPage }) => {
  return (
    <section className="bg-luxury-900 pb-32 md:pb-40 pt-24 md:pt-32 relative z-20">
      
      {/* Background Texture - Darker */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}card-bg.jpg`}
          alt="" 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12">
          {CARDS.map((card) => (
            <div 
              key={card.id} 
              onClick={(e) => {
                e.preventDefault();
                  if (card.action) {
                    onNavigate(card.action);
                  } else if (card.pdf) {
                    onOpenPdfPage && onOpenPdfPage(card.id);
                  } else {
                    smoothScrollTo(card.link);
                  }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (card.action) {
                    onNavigate(card.action);
                  } else if (card.pdf) {
                    onOpenPdfPage && onOpenPdfPage(card.id);
                  } else {
                    smoothScrollTo(card.link);
                  }
                }
              }}
              aria-label={`Acessar ${card.title}`}
              className="group cursor-pointer relative h-56 md:h-96 overflow-hidden rounded-3xl shadow-2xl block border border-luxury-800 hover:border-gold-500/40 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-luxury-900"
            >
              {/* Image Background for Card */}
              <div className="absolute inset-0">
                <img 
                  src={card.image} 
                  alt={card.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/80 via-luxury-950/20 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pdf viewer overlay removed — Pdfs now open in dedicated SPA route (/pdf/:id)

const MethodSection = () => {
  return (
    <section id="metodo" className="py-12 bg-luxury-950 relative overflow-hidden rounded-[3rem] my-8 mx-2 md:mx-6 shadow-2xl border-t border-luxury-800">
      {/* Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          
          <div className="md:w-1/2 relative">
                <div className="relative z-10 overflow-hidden rounded-3xl border border-gold-900/20 shadow-2xl">
                  <img 
                   src={`${import.meta.env.BASE_URL}metodo.png`}
                   alt="Rota 360 Method" 
                   loading="lazy"
                   decoding="async"
                   className="w-full h-auto grayscale contrast-125 opacity-80 scale-105 hover:scale-100 transition-transform duration-1000"
                 />
                  <div className="absolute inset-0 bg-gold-500/5 mix-blend-overlay"></div>
                </div>
          </div>

          <div className="md:w-1/2 space-y-8">
            <div>
              <span className="text-gold-600 text-[10px] font-normal tracking-[0.15em] uppercase">O Método</span>
              <h2 className="font-sans text-2xl md:text-3xl text-white mt-2 mb-6 font-light tracking-tight">Rota 360°</h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                O Rota 360 é um processo de leitura completa da vida em 360°: mental, emocional, espiritual e prático.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex gap-6 items-start bg-luxury-900 p-6 rounded-2xl border border-luxury-600/10">
                <div className="mt-1 text-gold-600 bg-gold-900/10 p-3 rounded-full"><Target size={20} /></div>
                <div>
                  <h4 className="text-white font-sans text-sm mb-2 font-medium">O que ele revela?</h4>
                  <ul className="space-y-2 text-xs text-gray-500">
                    <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gold-600 rounded-full"/> Pontos cegos e desalinhamentos</li>
                    <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gold-600 rounded-full"/> Verdades ignoradas</li>
                    <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gold-600 rounded-full"/> Novas possibilidades de rota</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-6 items-start bg-luxury-900 p-6 rounded-2xl border border-luxury-600/10">
                <div className="mt-1 text-gold-600 bg-gold-900/10 p-3 rounded-full"><Compass size={20} /></div>
                <div>
                  <h4 className="text-white font-sans text-sm mb-2 font-medium">O que ele combina?</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Espiritualidade prática, consciência elevada, visão estratégica, leitura comportamental e clareza de propósito.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
               <p className="text-sm text-white font-light border-l-2 border-gold-700 pl-6 py-2 leading-relaxed">
                 O objetivo é um só: <span className="text-gold-500 font-normal">alinhar rota e restaurar direção.</span>
               </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LeadCaptureSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simular envio
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <section className="py-12 bg-luxury-900 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-luxury-950 to-luxury-900 p-8 md:p-10 rounded-2xl border border-gold-900/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-600/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 text-center">
            <span className="text-gold-600 text-[10px] font-normal tracking-[0.2em] uppercase block mb-3">Material Gratuito</span>
            <h2 className="font-sans text-xl md:text-2xl text-white mb-4 font-light">
              Baixe o Guia: <span className="text-gold-400">5 Passos para Clareza de Propósito</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed text-xs">
              Descubra como líderes de alta performance alinham visão, direção e propósito em apenas 5 passos práticos.
            </p>

            {submitted ? (
              <div className="bg-green-600 text-white px-8 py-4 rounded-xl inline-flex items-center gap-3 animate-fade-in">
                <CheckCircle2 size={24} />
                <span className="font-bold">Enviado! Verifique seu email.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor email" 
                  required
                  className="flex-grow px-6 py-4 bg-luxury-950 border border-luxury-600/30 rounded-xl text-white placeholder-gray-600 focus:border-gold-500 outline-none transition-all"
                />
                <button 
                  type="submit"
                  className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-white font-bold uppercase tracking-wider text-sm rounded-xl transition-all shadow-lg hover:shadow-gold-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500 whitespace-nowrap"
                >
                  Baixar Guia
                </button>
              </form>
            )}

            <p className="text-xs text-gray-600 mt-6">🔒 Seus dados estão seguros. Sem spam.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onOpenAdmin }) => {
  return (
    <footer id="contato" className="bg-black py-12 rounded-t-[2rem] border-t border-luxury-800 mt-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          
          <div className="text-center md:text-left max-w-sm">
            <h2 className="font-sans text-lg text-white mb-2 font-light tracking-tight">Adriano Rodrigo</h2>
            <p className="text-[10px] text-gold-600 tracking-[0.2em] mb-5 font-light">Mentor de Posicionamento</p>
            <p className="text-gray-600 text-[11px] mb-5 leading-relaxed font-light">
              Você não precisa de mais velocidade.<br/>
              Precisa de direção.
            </p>
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="https://www.instagram.com/adrianorodrigo.oficial?igsh=aXpteXVmZHV0Zzdz" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold-400 transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold-500" aria-label="Instagram de Adriano Rodrigo"><Instagram size={18} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold-400 transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold-500" aria-label="LinkedIn de Adriano Rodrigo"><Linkedin size={18} /></a>
              <a href="mailto:contato@adrianorodrigo.com" className="text-gray-600 hover:text-gold-400 transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold-500" aria-label="Enviar email para contato"><Mail size={18} /></a>
            </div>
          </div>

          <div className="text-center md:text-right max-w-md">
            <h3 className="font-sans text-base text-white mb-4 font-light">Vamos Conversar?</h3>
            <p className="text-gray-500 font-light text-[11px] mb-5 leading-relaxed">
              Se você busca direção e não apenas velocidade, está no lugar certo. Agende uma sessão de Rota 360 ou Mentoria.
            </p>
            <a href={WA_LINK('5516999963461')} target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-4 bg-gold-700 text-white text-[10px] font-normal tracking-wide hover:bg-gold-600 transition-colors shadow-lg shadow-black/50 rounded-full">
              Agendar Conversa
            </a>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-luxury-900 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-700 gap-4 font-light">
          <p>&copy; {new Date().getFullYear()} Adriano Rodrigo. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <p className="tracking-wide">Rota 360° Method</p>
            <button 
              onClick={onOpenAdmin}
              className="flex items-center gap-2 text-gray-700 hover:text-gold-700 transition-colors px-3 py-1 rounded border border-transparent hover:border-gold-900/10"
            >
              <Lock size={11} />
              <span className="font-normal tracking-wide text-[9px]">Área do Mentor</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Admin Modal ---

const AdminModal = ({ onClose, onSave, events, onDelete, onLogout, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manage'
  const [editingEvent, setEditingEvent] = useState(null); // id do evento em edição
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    venue: '',
    date: '',
    time: '',
    description: '',
    image: '',
    status: 'Inscrições Abertas'
  });
    // Preencher formulário para edição
    const handleEdit = (event) => {
      setEditingEvent(event.id);
      setFormData({
        title: event.title || '',
        city: event.city || '',
        venue: event.venue || '',
        date: event.date || '',
        time: event.time || '',
        description: event.description || '',
        image: event.image || '',
        status: event.status || 'Inscrições Abertas',
      });
      setActiveTab('create');
    };
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus trap and ESC handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus close button on mount
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors['title'] = 'Título é obrigatório';
    }
    if (!formData.city.trim()) {
      newErrors['city'] = 'Cidade é obrigatória';
    }
    if (!formData.venue.trim()) {
      newErrors['venue'] = 'Local é obrigatório';
    }
    if (!formData.date.trim()) {
      newErrors['date'] = 'Data é obrigatória';
    }
    if (!formData.description.trim()) {
      newErrors['description'] = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageUrl(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    // Converter blob para base64 para preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(croppedBlob);
    // Guardar blob para upload posterior
    setImageFile(croppedBlob);
  };

  const handleClearImage = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setToast({ type: 'error', message: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }
    setIsSubmitting(true);
    if (editingEvent) {
      // Atualizar evento existente
      onUpdate(editingEvent, {
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1544168190-79c17527004f?q=80&w=800&auto=format&fit=crop',
      });
      setToast({ type: 'success', message: 'Evento atualizado com sucesso!' });
    } else {
      // Criar novo evento
      onSave({
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1544168190-79c17527004f?q=80&w=800&auto=format&fit=crop',
        schedule: []
      });
      setToast({ type: 'success', message: 'Evento criado com sucesso!' });
    }
    // Reset form e estado de edição
    setFormData({
      title: '',
      city: '',
      venue: '',
      date: '',
      time: '',
      description: '',
      image: '',
      status: 'Inscrições Abertas'
    });
    setEditingEvent(null);
    setErrors({});
    setIsSubmitting(false);
    // Volta para aba de gerenciamento após delay
    setTimeout(() => {
      setActiveTab('manage');
    }, 1200);
  };

  // Cálculo do uso de espaço
  const estimateDocSize = (obj) => {
    // Aproximação: converte para string JSON e mede bytes
    return new TextEncoder().encode(JSON.stringify(obj)).length;
  };
  const totalBytes = Array.isArray(events) ? events.reduce((sum, ev) => sum + estimateDocSize(ev), 0) : 0;
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
  const maxMB = 1024;
  const percent = Math.min(100, ((totalBytes / (1024 * 1024)) / maxMB) * 100).toFixed(2);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropModal(false);
            setTempImageUrl(null);
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in`}>
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">{toast.message}</p>
          <button onClick={() => setToast(null)} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-luxury-900 w-full max-w-4xl rounded-3xl border border-gold-900/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Espaço Firestore */}
        <div className="bg-luxury-950 border-b border-gold-900/10 px-6 py-4 flex items-center gap-4">
          <div className="flex flex-col flex-grow">
            <span className="text-xs text-gray-400">Uso do Firestore (estimado)</span>
            <div className="flex items-center gap-2">
              <div className="w-full bg-luxury-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gold-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
              </div>
              <span className="text-xs text-gray-300 ml-2">{totalMB} MB / 1024 MB</span>
            </div>
          </div>
          <span className="text-xs text-gold-400 font-bold">{percent}%</span>
        </div>
        
        {/* Header */}
        <div className="p-6 border-b border-gold-900/20 bg-gradient-to-r from-luxury-950 to-luxury-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gold-500/10 p-2.5 rounded-xl text-gold-500">
                <Plus size={22} />
              </div>
              <div>
                <h2 id="admin-modal-title" className="text-white font-serif text-xl">Painel Administrativo</h2>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Gerenciar Eventos & Agenda</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onLogout}
                className="text-gray-500 hover:text-red-400 transition-colors bg-white/5 p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-2" 
                aria-label="Sair"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="text-xs hidden sm:inline">Sair</span>
              </button>
              <button ref={closeButtonRef} onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2.5 rounded-xl hover:bg-white/10" aria-label="Fechar modal">
                <X size={22} />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === 'create'
                  ? 'bg-gold-600 text-white shadow-lg'
                  : 'bg-luxury-800 text-gray-400 hover:bg-luxury-700'
              }`}
            >
              ➕ Criar Evento
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === 'manage'
                  ? 'bg-gold-600 text-white shadow-lg'
                  : 'bg-luxury-800 text-gray-400 hover:bg-luxury-700'
              }`}
            >
              📋 Gerenciar ({events?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === 'stats'
                  ? 'bg-gold-600 text-white shadow-lg'
                  : 'bg-luxury-800 text-gray-400 hover:bg-luxury-700'
              }`}
            >
              📊 Estatísticas
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar flex-grow">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-gold-400 font-serif text-base uppercase tracking-widest border-b border-gold-900/30 pb-3 flex items-center gap-2">
                  <span className="bg-gold-500/10 text-gold-500 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Informações do Evento
                </h3>
                
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Título do Evento *</label>
                    <input 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      placeholder="Ex: Imersão Liderança 360"
                      required
                      className={`w-full bg-luxury-950 border ${errors['title'] ? 'border-red-500' : 'border-luxury-600/30'} rounded-xl p-4 text-white focus:border-gold-500 outline-none transition-all placeholder-gray-600`}
                    />
                    {errors['title'] && <p className="text-red-400 text-xs mt-1">{errors['title']}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Descrição Curta *</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      rows={3}
                      required
                      placeholder="Breve resumo que aparecerá no card do evento..."
                      className={`w-full bg-luxury-950 border ${errors['description'] ? 'border-red-500' : 'border-luxury-600/30'} rounded-xl p-4 text-white focus:border-gold-500 outline-none transition-all resize-none placeholder-gray-600`}
                    />
                    {errors['description'] && <p className="text-red-400 text-xs mt-1">{errors['description']}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Logistics */}
              <div className="space-y-4">
                <h3 className="text-gold-400 font-serif text-base uppercase tracking-widest border-b border-gold-900/30 pb-3 flex items-center gap-2">
                  <span className="bg-gold-500/10 text-gold-500 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Logística & Local
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Cidade *</label>
                    <input 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange} 
                      placeholder="Ex: SÃO PAULO/SP"
                      required
                      className={`w-full bg-luxury-950 border ${errors['city'] ? 'border-red-500' : 'border-luxury-600/30'} rounded-xl p-4 text-white focus:border-gold-500 outline-none transition-all placeholder-gray-600`}
                    />
                    {errors['city'] && <p className="text-red-400 text-xs mt-1">{errors['city']}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Local/Venue *</label>
                    <input 
                      name="venue" 
                      value={formData.venue} 
                      onChange={handleChange} 
                      placeholder="Ex: Hotel Fasano"
                      required
                      className={`w-full bg-luxury-950 border ${errors['venue'] ? 'border-red-500' : 'border-luxury-600/30'} rounded-xl p-4 text-white focus:border-gold-500 outline-none transition-all placeholder-gray-600`}
                    />
                    {errors['venue'] && <p className="text-red-400 text-xs mt-1">{errors['venue']}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Data *</label>
                    <input 
                      name="date" 
                      value={formData.date} 
                      onChange={handleChange} 
                      placeholder="Ex: 15, 16 e 17 de Outubro"
                      required
                      className={`w-full bg-luxury-950 border ${errors['date'] ? 'border-red-500' : 'border-luxury-600/30'} rounded-xl p-4 text-white focus:border-gold-500 outline-none transition-all placeholder-gray-600`}
                    />
                    {errors['date'] && <p className="text-red-400 text-xs mt-1">{errors['date']}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Horário</label>
                    <input 
                      name="time" 
                      value={formData.time} 
                      onChange={handleChange} 
                      placeholder="Ex: 09:00 - 18:00"
                      className="w-full bg-luxury-950 border border-luxury-600/30 rounded-xl p-4 text-white focus:border-gold-500 outline-none transition-all placeholder-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Media & Status */}
              <div className="space-y-4">
                <h3 className="text-gold-400 font-serif text-base uppercase tracking-widest border-b border-gold-900/30 pb-3 flex items-center gap-2">
                  <span className="bg-gold-500/10 text-gold-500 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Visual & Status
                </h3>
                
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Imagem de Capa</label>
                  
                  <div className="space-y-3">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-luxury-600/40 hover:border-gold-500/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-luxury-950 hover:bg-black group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {formData.image ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden group-hover:opacity-70 transition-opacity">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50">
                            <p className="text-white font-bold px-4 py-2 rounded-lg bg-gold-600">Trocar Imagem</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-gold-500/10 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                            <UploadCloud className="text-gold-500" size={32} />
                          </div>
                          <p className="text-gray-300 text-base font-medium mb-1">Clique para fazer upload</p>
                          <p className="text-gray-600 text-xs">PNG, JPG ou WEBP (Max 2MB)</p>
                        </>
                      )}
                    </div>

                    {formData.image && (
                      <button 
                        type="button" 
                        onClick={handleClearImage}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={14} /> Remover imagem atual
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Status das Inscrições</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="w-full bg-luxury-950 border border-luxury-600/30 rounded-xl p-4 text-white focus:border-gold-500 outline-none transition-all cursor-pointer"
                  >
                    <option>Inscrições Abertas</option>
                    <option>Últimas Vagas</option>
                    <option>Esgotado</option>
                    <option>Lista de Espera</option>
                    <option>Em Breve</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gold-900/20 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-8 py-4 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-4 bg-gold-600 hover:bg-gold-500 text-white rounded-xl text-sm font-bold uppercase tracking-wide shadow-xl flex items-center gap-2 transition-all hover:shadow-gold-600/50 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Save size={18} /> {isSubmitting ? 'Criando...' : 'Criar Evento'}
                </button>
              </div>
            </form>
          ) : activeTab === 'manage' ? (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-white font-serif text-lg mb-1">Eventos Cadastrados</h3>
                <p className="text-gray-500 text-xs">Gerencie todos os eventos da agenda</p>
              </div>
              
              {events && events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="bg-luxury-950 border border-luxury-600/30 rounded-xl p-4 hover:border-gold-500/40 transition-all group">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-luxury-900">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Info */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-grow min-w-0">
                              <h4 className="text-white font-serif text-base mb-1 truncate">{event.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin size={12} className="text-gold-500 flex-shrink-0" />
                                  {event.city}
                                </span>
                                <span className="text-gray-700">•</span>
                                <span className="flex items-center gap-1 truncate">
                                  <Calendar size={12} className="text-gold-500 flex-shrink-0" />
                                  {event.date}
                                </span>
                              </div>
                            </div>
                            <span className="bg-gold-600/20 text-gold-400 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex-shrink-0">
                              {event.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mb-3 line-clamp-1">{event.description}</p>
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[10px] text-gray-700 truncate">
                              📍 {event.venue}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(event)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex-shrink-0"
                              >
                                <Edit2 size={12} />
                                Editar
                              </button>
                              <button
                                onClick={() => onDelete(event.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex-shrink-0"
                              >
                                <Trash2 size={12} />
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-base mb-1">Nenhum evento cadastrado</p>
                  <p className="text-xs">Crie seu primeiro evento na aba "Criar Evento"</p>
                </div>
              )}
            </div>
          ) : activeTab === 'stats' ? (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-white font-serif text-lg mb-1">Estatísticas dos Eventos</h3>
                <p className="text-gray-500 text-xs">Visão geral da agenda</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-luxury-950 border border-luxury-600/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gold-500/10 p-2 rounded-lg">
                      <Calendar size={20} className="text-gold-500" />
                    </div>
                    <h4 className="text-gray-400 text-xs uppercase font-bold">Total de Eventos</h4>
                  </div>
                  <p className="text-white text-3xl font-bold">{events?.length || 0}</p>
                </div>
                
                <div className="bg-luxury-950 border border-luxury-600/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                      <MapPin size={20} className="text-blue-500" />
                    </div>
                    <h4 className="text-gray-400 text-xs uppercase font-bold">Cidades</h4>
                  </div>
                  <p className="text-white text-3xl font-bold">{new Set(events?.map(e => e.city) || []).size}</p>
                </div>
                
                <div className="bg-luxury-950 border border-luxury-600/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-500/10 p-2 rounded-lg">
                      <CheckCircle2 size={20} className="text-green-500" />
                    </div>
                    <h4 className="text-gray-400 text-xs uppercase font-bold">Status Únicos</h4>
                  </div>
                  <p className="text-white text-3xl font-bold">{new Set(events?.map(e => e.status) || []).size}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-luxury-950 border border-luxury-600/30 rounded-xl p-4">
                  <h4 className="text-white font-serif text-base mb-3 flex items-center gap-2">
                    <BarChart3 size={18} className="text-gold-500" />
                    Por Status
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      (events || []).reduce((acc, ev) => {
                        acc[ev.status] = (acc[ev.status] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{status}</span>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-luxury-950 border border-luxury-600/30 rounded-xl p-4">
                  <h4 className="text-white font-serif text-base mb-3 flex items-center gap-2">
                    <TrendingUp size={18} className="text-gold-500" />
                    Por Cidade
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      (events || []).reduce((acc, ev) => {
                        acc[ev.city] = (acc[ev.city] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([city, count]) => (
                      <div key={city} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{city}</span>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// --- Agenda View Page & Modal ---

// Skeleton Loader para eventos
const SkeletonEventCard = () => (
  <div className="bg-luxury-900 border border-luxury-600/30 rounded-2xl overflow-hidden shadow-lg animate-pulse">
    <div className="h-48 bg-luxury-800"></div>
    <div className="p-6">
      <div className="h-4 bg-luxury-800 rounded w-1/3 mb-3"></div>
      <div className="h-6 bg-luxury-800 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-luxury-800 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-luxury-800 rounded w-full mb-2"></div>
      <div className="h-3 bg-luxury-800 rounded w-5/6 mb-6"></div>
      <div className="h-10 bg-luxury-800 rounded"></div>
    </div>
  </div>
);

const EventModal = ({ event, onClose }) => {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus close button on mount
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-luxury-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-luxury-600/20 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button 
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors backdrop-blur-md"
          aria-label="Fechar detalhes do evento"
        >
          <X size={20} />
        </button>

        {/* Header Image */}
        <div className="h-48 md:h-64 relative shrink-0">
          <img 
            src={event.image} 
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover grayscale-[20%]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-900 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 w-full">
             <h2 id="event-modal-title" className="font-serif text-3xl md:text-4xl text-white mb-2 leading-tight drop-shadow-lg">{event.title}</h2>
             <p className="text-gold-400 font-bold uppercase tracking-widest text-xs">{event.city}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-luxury-950 p-4 rounded-2xl border border-luxury-600/10 flex items-center gap-4">
              <div className="bg-gold-900/10 p-3 rounded-full text-gold-500">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold">Data</p>
                <p className="text-white text-sm font-medium">{event.date}</p>
              </div>
            </div>
            
            <div className="bg-luxury-950 p-4 rounded-2xl border border-luxury-600/10 flex items-center gap-4">
              <div className="bg-gold-900/10 p-3 rounded-full text-gold-500">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold">Horário</p>
                <p className="text-white text-sm font-medium">{event.time || '09:00 - 18:00'}</p>
              </div>
            </div>

            <div className="bg-luxury-950 p-4 rounded-2xl border border-luxury-600/10 flex items-center gap-4 col-span-1 md:col-span-2">
              <div className="bg-gold-900/10 p-3 rounded-full text-gold-500">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold">Local</p>
                <p className="text-white text-sm font-medium">{event.venue}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-white font-serif text-lg mb-4">Sobre o Evento</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              {event.description} Uma experiência imersiva desenhada para destravar seu potencial de liderança e alinhar seu propósito de vida com suas ações diárias.
            </p>
          </div>

          {event.schedule && event.schedule.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white font-serif text-lg mb-4">Programação</h3>
              <div className="space-y-4">
                {event.schedule.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start relative pl-2">
                    {/* Line */}
                    {idx !== event.schedule.length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-[-16px] w-[1px] bg-white/5"></div>
                    )}
                    <div className="bg-luxury-800 text-gold-400 p-1.5 rounded-full border border-white/5 z-10 mt-0.5">
                      <CheckCircle2 size={12} />
                    </div>
                    <div>
                      <p className="text-gold-600 text-xs font-bold">{item.time}</p>
                      <p className="text-gray-400 text-sm">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-white/5">
            <button className="w-full bg-gold-600 hover:bg-gold-500 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-lg hover:shadow-gold-500/20">
              Garantir Minha Vaga
            </button>
            <p className="text-center text-gray-600 text-xs mt-2">
              *Vagas limitadas sujeitas à disponibilidade.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

const AgendaPage = ({ onBack, events }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [selectedCity, setSelectedCity] = useState('all');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'city', 'status'
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  // Extrair cidades únicas dos eventos
  const cities = ['all', ...new Set(events.map(e => e.city))];

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFilters(query, selectedCity);
  };

  const handleCityFilter = (city) => {
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
    applyFilters(searchQuery, city);
  };

  const applyFilters = (query, city) => {
    let filtered = events;

    // Filtro de cidade
    if (city !== 'all') {
      filtered = filtered.filter(event => event.city === city);
    }

    // Filtro de busca
    if (query.trim() !== '') {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }

    // Ordenação
    if (sortBy === 'city') {
      filtered = [...filtered].sort((a, b) => a.city.localeCompare(b.city));
    } else if (sortBy === 'status') {
      filtered = [...filtered].sort((a, b) => a.status.localeCompare(b.status));
    } else {
      // Por data (padrão)
      filtered = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    }

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };

  // Paginação
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (newSortBy) => {
    setSortBy(newSortBy);
    applyFilters(searchQuery, selectedCity);
  };

  const handleShare = async (event) => {
    const shareData = {
      title: event.title,
      text: `${event.description}\\n\\n📍 ${event.city} | 📅 ${event.date}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      // Fallback: copiar link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-950 animate-fade-in flex flex-col">
      {/* Modal Render */}
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}

      {/* AGENDA HERO */}
      <header className="relative h-[60vh] min-h-[500px] flex flex-col">
        {/* Background */}
        <div className="absolute inset-0 z-0">
            <img 
              src={`${import.meta.env.BASE_URL}hero-agenda.png`}
              alt="Agenda Hero"
              className="w-full h-full object-cover" 
            />
            {/* Gradient para melhor contraste do texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        </div>

        {/* Nav (Absolute on top) */}
        <nav className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-gold-300 transition-colors text-sm uppercase tracking-widest font-bold group bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
           <div className="hidden md:flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 bg-black/50 backdrop-blur-md shadow-lg">
            <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></div>
            <span className="text-xs text-white font-medium drop-shadow-lg">Próximos Eventos Confirmados</span>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-grow flex flex-col justify-center items-center text-center px-4">
          <span className="text-gold-200 font-bold tracking-[0.25em] text-[10px] uppercase mb-4 animate-fade-in drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Programação Oficial</span>
          <h1 className="font-sans text-3xl md:text-4xl text-white mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] animate-fade-up font-light tracking-tight">
            Agenda & Imersões
          </h1>
          <p className="text-white max-w-xl mx-auto text-xs md:text-sm leading-relaxed font-light animate-fade-up drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Garanta seu lugar nos próximos passos da jornada Rota 360. 
            Experiências presenciais para transformar sua direção.
          </p>
        </div>
      </header>

      {/* SEARCH BAR (Overlapping) */}
      <div className="relative z-30 container mx-auto px-6 -mt-16 mb-16">
        <div className="bg-luxury-900 backdrop-blur-xl border border-gold-900/20 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
            
            <div className="flex-grow w-full md:w-auto bg-luxury-950 rounded-2xl flex items-center px-6 py-4 border border-luxury-600/30 focus-within:border-gold-500/50 transition-all group">
              <Search className="w-5 h-5 text-gray-600 group-focus-within:text-gold-500 transition-colors mr-3" />
              <input 
                type="text" 
                placeholder="Buscar por evento ou cidade..." 
                value={searchQuery}
                onChange={handleSearch}
                className="bg-transparent border-none outline-none text-gray-200 text-sm w-full placeholder-gray-600"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative">
               <div className="relative">
                 <button 
                   onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                   className="flex items-center justify-center gap-3 bg-luxury-950 hover:bg-luxury-800 text-gray-300 text-sm px-6 py-4 rounded-2xl border border-luxury-600/30 hover:border-gold-500/30 min-w-[180px] transition-all w-full"
                 >
                   {selectedCity === 'all' ? 'Todas as cidades' : selectedCity}
                   <ChevronDown className={`w-4 h-4 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {isCityDropdownOpen && (
                   <div className="absolute top-full mt-2 w-full bg-luxury-900 border border-luxury-600/30 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                     <button
                       onClick={() => handleCityFilter('all')}
                       className={`w-full text-left px-6 py-3 text-sm transition-all ${
                         selectedCity === 'all' 
                           ? 'bg-gold-600 text-white' 
                           : 'text-gray-300 hover:bg-luxury-800'
                       }`}
                     >
                       Todas as cidades
                     </button>
                     {cities.filter(c => c !== 'all').map((city) => (
                       <button
                         key={city}
                         onClick={() => handleCityFilter(city)}
                         className={`w-full text-left px-6 py-3 text-sm transition-all ${
                           selectedCity === city 
                             ? 'bg-gold-600 text-white' 
                             : 'text-gray-300 hover:bg-luxury-800'
                         }`}
                       >
                         {city}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>
        </div>
      </div>

      {/* Grid Content */}
      <main className="container mx-auto px-6 pb-24 flex-grow">
        {/* Ordenação */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400 text-sm">
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Ordenar por:</span>
            <button
              onClick={() => handleSort('date')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                sortBy === 'date' ? 'bg-gold-600 text-white' : 'bg-luxury-800 text-gray-400 hover:bg-luxury-700'
              }`}
            >
              Data
            </button>
            <button
              onClick={() => handleSort('city')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                sortBy === 'city' ? 'bg-gold-600 text-white' : 'bg-luxury-800 text-gray-400 hover:bg-luxury-700'
              }`}
            >
              Cidade
            </button>
            <button
              onClick={() => handleSort('status')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                sortBy === 'status' ? 'bg-gold-600 text-white' : 'bg-luxury-800 text-gray-400 hover:bg-luxury-700'
              }`}
            >
              Status
            </button>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentEvents.map((event) => (
              <div key={event.id} className="bg-luxury-900 rounded-2xl overflow-hidden border border-luxury-600/20 hover:border-gold-500/40 shadow-xl hover:shadow-2xl transition-all duration-500 group flex flex-col">
                
                {/* Card Header Image */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-900 via-luxury-900/40 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gold-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-gold-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                      <MapPin className="w-3 h-3" />
                      {event.city}
                    </div>
                    
                    <h3 className="font-serif text-xl text-white mb-3 group-hover:text-gold-200 transition-colors leading-tight">
                      {event.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-3 text-gray-400 text-xs mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-500" />
                        {event.time || '09:00 - 18:00'}
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-gray-500 font-medium">
                      📍 {event.venue}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                    {event.description}
                  </p>

                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => handleShare(event)}
                      className="flex-1 bg-luxury-800 hover:bg-luxury-700 text-gray-300 font-bold uppercase tracking-widest text-xs py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
                      aria-label="Compartilhar evento"
                    >
                      <Share2 size={14} />
                      Compartilhar
                    </button>
                  </div>

                  <button 
                    onClick={() => setSelectedEvent(event)}
                    className="w-full bg-gold-600 hover:bg-gold-500 text-white font-bold uppercase tracking-widest text-xs py-3 rounded-xl transition-all shadow-lg hover:shadow-gold-600/30 flex justify-center items-center gap-2 group"
                  >
                    Ver Detalhes
                    <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-luxury-800 text-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-luxury-700 transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentPage === i + 1
                      ? 'bg-gold-600 text-white'
                      : 'bg-luxury-800 text-gray-300 hover:bg-luxury-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-luxury-800 text-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-luxury-700 transition-all"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto mb-4 text-gray-600 opacity-50" />
            <p className="text-gray-400 text-lg mb-2">Nenhum evento encontrado</p>
            <p className="text-gray-600 text-sm">Tente buscar por outra cidade ou evento</p>
          </div>
        )}
      </main>
    </div>
  );
};

const MainContent = ({ onNavigate, onOpenAdmin, onOpenPdfPage }) => {

  return (
    <>
      <Header onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <QuickLinks onNavigate={onNavigate} onOpenPdfPage={onOpenPdfPage} />
      <MethodSection />
      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
};

// PDF Viewer Page - Full screen PDF only (no UI chrome)
const PdfViewerPage = ({ pdfId, onBack }) => {
  const card = CARDS.find(c => c.id === pdfId);
  const src = card?.pdf || null;

  useEffect(() => {
    // Add escape key to go back
    const handleEsc = (e) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onBack]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-luxury-950">
      {/* Minimal floating back button */}
      <button 
        onClick={onBack}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-luxury-900/90 backdrop-blur-md text-white hover:bg-luxury-800 transition-all rounded-full border border-luxury-700 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Voltar</span>
      </button>

      {/* Full screen PDF - com fallback para iOS */}
      {src ? (
        <>
          {/* Tentar com iframe primeiro (funciona em desktop) */}
          <iframe 
            src={`${src}#view=FitH&toolbar=0&navpanes=0`}
            className="absolute inset-0 w-full h-full border-0 md:block hidden" 
            title={card?.title || 'Documento'}
          ></iframe>
          
          {/* Fallback para mobile/iOS com object */}
          <object
            data={`${src}#view=FitH&toolbar=0`}
            type="application/pdf"
            className="absolute inset-0 w-full h-full border-0 md:hidden"
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-6">
              <p className="text-gray-400 mb-4 text-center">Este navegador não suporta visualização direta de PDF.</p>
              <a 
                href={src}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white font-bold rounded-xl transition-all"
              >
                Baixar PDF
              </a>
            </div>
          </object>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">PDF não encontrado</p>
        </div>
      )}
    </div>
  );
};

// About Modal Component
const AboutModal = ({ onClose }) => {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="about-modal-title">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-luxury-900 w-full max-w-3xl rounded-3xl border border-gold-900/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header with Image */}
        <div className="relative h-48 md:h-64 overflow-hidden">
            <img
              src="/bg-sobremim.png"
              alt="Sobre Mim"
              className="w-full h-full object-cover object-top grayscale-[30%]"
            />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-900 via-luxury-900/50 to-transparent"></div>
          
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2.5 rounded-full hover:bg-black/80 transition-colors backdrop-blur-md"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
            <div className="flex items-end gap-4">
              <div>
                <h2 id="about-modal-title" className="font-sans text-2xl md:text-3xl text-white mb-2 leading-tight drop-shadow-lg font-light tracking-tight">
                  Adriano Rodrigo
                </h2>
                <p className="text-gold-400 font-light tracking-wide text-[10px]">Mentor de Posicionamento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          
          <div className="prose prose-invert max-w-none">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gold-500/10 p-2.5 rounded-xl text-gold-500">
                  <Target size={18} />
                </div>
                <h3 className="text-white font-sans text-base m-0 font-medium">Minha Jornada</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-xs md:text-sm font-light">
                [Aqui você pode adicionar seu texto sobre você. Este é apenas um placeholder para você substituir com sua história, experiência e filosofia de trabalho.]
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gold-500/10 p-2.5 rounded-xl text-gold-500">
                  <Compass size={18} />
                </div>
                <h3 className="text-white font-sans text-base m-0 font-medium">Filosofia de Trabalho</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-xs md:text-sm font-light">
                [Adicione aqui sua filosofia e abordagem única. O que te diferencia como mentor? Qual é sua missão?]
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gold-500/10 p-2.5 rounded-xl text-gold-500">
                  <GraduationCap size={18} />
                </div>
                <h3 className="text-white font-sans text-base m-0 font-medium">Experiência & Formação</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-luxury-950 rounded-xl border border-luxury-600/10">
                  <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-gray-400 text-xs font-light">[Adicione suas credenciais, certificações e experiências relevantes]</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-luxury-950 rounded-xl border border-luxury-600/10">
                  <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <p className="text-gray-400 text-xs font-light">[Adicione mais experiências]</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gold-900/20 to-luxury-950 p-6 rounded-2xl border border-gold-900/30">
              <p className="text-gold-400 font-light text-sm md:text-base italic text-center leading-relaxed">
                "[Adicione aqui uma citação ou mensagem inspiradora que represente sua essência]"
              </p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="mt-8 pt-6 border-t border-luxury-600/20 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                setTimeout(() => smoothScrollTo('#contato'), 300);
              }}
              className="flex-1 bg-gold-600 hover:bg-gold-500 text-white font-normal tracking-wide text-[11px] py-4 rounded-xl transition-all shadow-lg hover:shadow-gold-500/20"
            >
              Entre em Contato
            </button>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => smoothScrollTo('#metodo'), 300);
              }}
              className="flex-1 border border-gold-600/30 hover:bg-gold-600/10 text-gold-100 font-normal tracking-wide text-[11px] py-4 rounded-xl transition-all"
            >
              Conheça o Método
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cookie Consent Component
const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    
    // Update GA4 consent
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-fade-in">
      <div className="container mx-auto max-w-5xl bg-luxury-900 border border-gold-900/30 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-start gap-4 flex-grow">
          <div className="bg-gold-500/10 p-3 rounded-xl text-gold-500 flex-shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-2">Privacidade & Cookies</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Usamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo. 
              Ao continuar navegando, você concorda com nossa política de privacidade.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={acceptCookies}
            className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white font-bold text-sm rounded-xl transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            Aceitar Todos
          </button>
          <button
            onClick={declineCookies}
            className="px-6 py-3 bg-luxury-800 hover:bg-luxury-700 text-gray-300 font-bold text-sm rounded-xl transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Apenas Essenciais
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentPdfId, setCurrentPdfId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Novos estados para funcionalidades avançadas
  const [sortBy, setSortBy] = useState('date'); // 'date', 'city', 'status'
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewEvent, setPreviewEvent] = useState(null);
  const eventsPerPage = 6;

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Load events from Firestore on mount com cache
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      
      // Tentar carregar do cache primeiro
      const cachedEvents = getFromCache();
      if (cachedEvents && cachedEvents.length > 0) {
        setEvents(cachedEvents);
        setIsLoadingEvents(false);
        // Atualizar do Firestore em background
        const firestoreEvents = await getAllEvents();
        if (firestoreEvents.length > 0) {
          setEvents(firestoreEvents);
          saveToCache(firestoreEvents);
        }
        return;
      }
      
      // Se não há cache, carregar do Firestore
      const firestoreEvents = await getAllEvents();
      
      // If Firestore has events, use them; otherwise use INITIAL_EVENTS
      if (firestoreEvents.length > 0) {
        setEvents(firestoreEvents);
        saveToCache(firestoreEvents);
      } else {
        setEvents(INITIAL_EVENTS);
      }
      
      setIsLoadingEvents(false);
    };
    
    loadEvents();
  }, []);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Handle popstate events (back/forward navigation) to support SPA routes
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (path.startsWith('/pdf/')) {
        const id = path.split('/pdf/')[1];
        const exists = CARDS.find(c => c.id === id);
        if (id && exists) {
          setCurrentPdfId(id);
          setCurrentView('pdf');
          return;
        }
      }
      if (path === '/agenda') {
        setCurrentView('agenda');
        setCurrentPdfId(null);
        return;
      }
      setCurrentView('home');
      setCurrentPdfId(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Initial path check when the app first loads
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/pdf/')) {
      const id = path.split('/pdf/')[1];
      const cardExists = CARDS.find(c => c.id === id);
      if (id && cardExists) {
        setCurrentPdfId(id);
        setCurrentView('pdf');
        return;
      }
    }
    if (path === '/agenda') {
      setCurrentView('agenda');
      setCurrentPdfId(null);
      return;
    }
    setCurrentView('home');
    setCurrentPdfId(null);
  }, []);

  const handleAddEvent = async (newEvent) => {
    // Save to Firestore
    const result = await createEvent(newEvent);
    
    if (result.success) {
      // Reload events from Firestore to get the new one with proper ID
      const updatedEvents = await getAllEvents();
      setEvents(updatedEvents);
      setToast({ type: 'success', message: 'Evento criado com sucesso!' });
      
      // Keep modal open but switch to manage tab (handled by AdminModal internally)
      // No need to change view here
    } else {
      // Handle error with toast
      console.error('Failed to create event:', result.error);
      setToast({ type: 'error', message: result.error || 'Erro ao criar evento' });
    }
  };

  // Navigation wrapper to keep URL in sync
  const handleNavigate = (viewName) => {
    setCurrentPdfId(null);
    if (viewName === 'about') {
      setIsAboutOpen(true);
      return;
    }
    setCurrentView(viewName);
    if (viewName === 'agenda') {
      window.history.pushState(null, '', '/agenda');
    } else if (viewName === 'home') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleOpenPdfPage = (id) => {
    setCurrentPdfId(id);
    setCurrentView('pdf');
    window.history.pushState(null, '', `/pdf/${id}`);
  };

  const handleDeleteEvent = async (eventId) => {
    // Show confirmation
    setConfirmDelete(eventId);
  };

  const confirmDeleteEvent = async () => {
    if (!confirmDelete) return;
    
    // Delete from Firestore
    const result = await deleteEventFromDB(confirmDelete);
    
    if (result.success) {
      // Reload events from Firestore to ensure sync
      const updatedEvents = await getAllEvents();
      setEvents(updatedEvents);
      setToast({ type: 'success', message: 'Evento excluído com sucesso!' });
    } else {
      console.error('Failed to delete event:', result.error);
      setToast({ type: 'error', message: result.error || 'Erro ao excluir evento' });
    }
    
    setConfirmDelete(null);
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    const result = await updateEvent(eventId, eventData);
    
    if (result.success) {
      const updatedEvents = await getAllEvents();
      setEvents(updatedEvents);
      setToast({ type: 'success', message: 'Evento atualizado com sucesso!' });
    } else {
      console.error('Failed to update event:', result.error);
      setToast({ type: 'error', message: result.error || 'Erro ao atualizar evento' });
    }
  };

  const handleLogout = async () => {
    const result = await firebaseLogout();
    if (result.success) {
      setIsAdminOpen(false);
      setToast({ type: 'info', message: 'Logout realizado com sucesso' });
    } else {
      setToast({ type: 'error', message: 'Erro ao fazer logout' });
    }
  };

  const handleOpenAdmin = () => {
    // Check if user is authenticated
    if (isAuthenticated) {
      setIsAdminOpen(true);
    } else {
      // Show login modal
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, open admin panel
    setIsLoginOpen(false);
    setIsAdminOpen(true);
  };

  // Funções de compartilhamento
  const handleShareEvent = async (event) => {
    const shareData = {
      title: event.title,
      text: `${event.description}\\n\\n📍 ${event.city} | 📅 ${event.date}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setToast({ type: 'success', message: 'Evento compartilhado!' });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      // Fallback: copiar link
      navigator.clipboard.writeText(window.location.href);
      setToast({ type: 'info', message: 'Link copiado para área de transferência' });
    }
  };

  // Calcular estatísticas
  const getStats = () => {
    const totalEvents = events.length;
    const byStatus = events.reduce((acc, ev) => {
      acc[ev.status] = (acc[ev.status] || 0) + 1;
      return acc;
    }, {});
    const byCity = events.reduce((acc, ev) => {
      acc[ev.city] = (acc[ev.city] || 0) + 1;
      return acc;
    }, {});
    return { totalEvents, byStatus, byCity };
  };

  return (
    <main className="font-sans text-gray-200 selection:bg-gold-600 selection:text-white min-h-screen relative">
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          type={toast.type} 
          message={toast.message} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* WhatsApp Flutuante */}
      <a
        href={WA_LINK(WHATSAPP_PHONE)}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[80] bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 animate-pulse hover:animate-none"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle size={28} />
      </a>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}></div>
          <div className="relative bg-luxury-900 w-full max-w-md rounded-3xl border border-red-900/30 shadow-2xl overflow-hidden p-8">
            <div className="text-center">
              <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-white font-serif text-2xl mb-3">Excluir Evento?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Esta ação não pode ser desfeita. O evento será permanentemente removido do banco de dados.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-6 py-3 bg-luxury-800 hover:bg-luxury-700 text-gray-300 font-bold text-sm rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteEvent}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Wallpaper background */}
      <div className="hidden md:block fixed inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}bg-central.png`}
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-luxury-950/50"></div>
      </div>

      {/* Desktop: Centered container with page scroll */}
      <div className="hidden md:block relative z-10 min-h-screen py-8">
        <div className="mx-auto w-[1200px] max-w-[90vw] shadow-2xl rounded-3xl border border-luxury-700/50 overflow-hidden">
          {/* Background image inside container */}
          <div className="absolute inset-0 z-0 bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}bg-central.png')` }} />
          <div className="relative z-10 bg-luxury-950/80">
            <CookieConsent />
            
            {isLoginOpen && (
              <LoginModal 
                onClose={() => setIsLoginOpen(false)} 
                onLoginSuccess={handleLoginSuccess}
              />
            )}
            
            {isAboutOpen && (
              <AboutModal onClose={() => setIsAboutOpen(false)} />
            )}
            
            {isAdminOpen && (
              <AdminModal 
                onClose={() => setIsAdminOpen(false)} 
                onSave={handleAddEvent}
                events={events}
                onDelete={handleDeleteEvent}
                onLogout={handleLogout}
                onUpdate={handleUpdateEvent}
              />
            )}
            
            {currentView === 'home' ? (
              <MainContent 
                onNavigate={handleNavigate} 
                onOpenAdmin={handleOpenAdmin}
                onOpenPdfPage={handleOpenPdfPage}
              />
            ) : currentView === 'agenda' ? (
              <AgendaPage 
                onBack={() => handleNavigate('home')} 
                events={events}
              />
            ) : currentView === 'pdf' ? (
              <PdfViewerPage pdfId={currentPdfId} onBack={() => handleNavigate('home')} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile: Original full-width layout */}
      <div className="md:hidden bg-luxury-950 min-h-screen">
        <CookieConsent />
        
        {isLoginOpen && (
          <LoginModal 
            onClose={() => setIsLoginOpen(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        
        {isAboutOpen && (
          <AboutModal onClose={() => setIsAboutOpen(false)} />
        )}
        
        {isAdminOpen && (
          <AdminModal 
            onClose={() => setIsAdminOpen(false)} 
            onSave={handleAddEvent}
            events={events}
            onDelete={handleDeleteEvent}
            onLogout={handleLogout}
            onUpdate={handleUpdateEvent}
          />
        )}
        
        {currentView === 'home' ? (
          <MainContent 
            onNavigate={handleNavigate} 
            onOpenAdmin={handleOpenAdmin}
            onOpenPdfPage={handleOpenPdfPage}
          />
        ) : currentView === 'agenda' ? (
          <AgendaPage 
            onBack={() => handleNavigate('home')} 
            events={events}
          />
        ) : currentView === 'pdf' ? (
          <PdfViewerPage pdfId={currentPdfId} onBack={() => handleNavigate('home')} />
        ) : null}
      </div>
    </main>
  );
};

export default App;