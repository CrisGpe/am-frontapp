'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Servicio {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  duracionMinutos: number;
  precioSoles: number;
}

export default function CatalogoPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await fetch('/api/servicios');
        if (res.ok) {
          const data = await res.json();
          setServicios(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching servicios', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServicios();
  }, []);

  const categories = ['Todos', 'Cabello', 'Uñas', 'Facial', 'Corporal', 'Otro'];

  const filteredServicios = servicios.filter((servicio) => {
    const matchesSearch = servicio.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (servicio.descripcion && servicio.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || servicio.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-sand-50 font-sans text-earth-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-earth-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-serif text-earth-800 tracking-tight">Salón Élite & Spa</h1>
          <p className="text-xs text-earth-500">Av. Horacio Urteaga, Jesús María, Lima, Perú</p>
        </div>
        <Link href="/login" className="bg-gold-500 hover:bg-gold-600 text-white font-medium px-5 py-2.5 rounded-md transition-colors text-sm shadow-sm">
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero Banner */}
      <section className="bg-earth-800 text-white py-16 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-serif mb-4 text-gold-400">Descubre Tu Mejor Versión</h2>
        <p className="text-lg md:text-xl text-earth-200 max-w-2xl mx-auto font-light">
          Experiencia, lujo y dedicación en cada detalle. Reserva hoy y déjate consentir por nuestros expertos.
        </p>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-earth-700 text-white' 
                    : 'bg-white text-earth-700 border border-earth-200 hover:border-earth-400 hover:bg-earth-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Search */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-earth-200 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
            />
            <span className="absolute left-3 top-2.5 text-earth-400">
              🔍
            </span>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-20 text-earth-500">Cargando servicios...</div>
        ) : filteredServicios.length === 0 ? (
          <div className="text-center py-20 text-earth-500">No se encontraron servicios que coincidan con tu búsqueda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServicios.map((servicio) => (
              <div key={servicio.id} className="bg-white rounded-xl shadow-sm border border-earth-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-3 py-1 bg-sand-100 text-earth-700 text-xs font-semibold rounded-full">
                      {servicio.categoria}
                    </span>
                    <span className="text-sm font-medium text-earth-500">⏱️ {servicio.duracionMinutos} min</span>
                  </div>
                  <h3 className="text-xl font-medium text-earth-800 mb-2">{servicio.nombre}</h3>
                  <p className="text-earth-600 text-sm line-clamp-3 mb-6">
                    {servicio.descripcion || "Servicio profesional en Salón Élite."}
                  </p>
                </div>
                <div className="px-6 py-5 bg-sand-50 border-t border-earth-100 flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-earth-900">S/ {servicio.precioSoles.toFixed(2)}</span>
                  <Link 
                    href={`/login?redirect=/cliente/citas&servicioId=${servicio.id}`}
                    className="bg-earth-800 hover:bg-earth-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Reservar Cita
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/51999999999?text=Hola,%20quisiera%20consultar%20sobre%20sus%20servicios%20en%20Salón%20Élite"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
