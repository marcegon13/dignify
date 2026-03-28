export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-300 px-6 py-20 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black text-emerald-500 mb-8 tracking-tighter uppercase">Términos del Servicio</h1>
      <p className="mb-6 text-lg tracking-wide">Dignify es una red de curación dinámica. Al usarla, aceptas que la música mueva el mundo en armonía.</p>
      
      <section className="space-y-6">
        <div>
           <h2 className="text-xl font-bold text-white mb-2 uppercase">1. USO LEGÍTIMO</h2>
           <p>En Dignify puedes buscar, filtrar y curar música. Como usuario, te comprometes a no usar la plataforma de forma abusiva ni malintencionada.</p>
        </div>

        <div>
           <h2 className="text-xl font-bold text-white mb-2 uppercase">2. PROPIEDAD INTELECTUAL</h2>
           <p>Respetamos profundamente a los creadores. El contenido mostrado (YouTube, SoundCloud, Spotify) viaja directamente desde sus dueños originales vía API oficial.</p>
        </div>
        
        <div>
           <h2 className="text-xl font-bold text-white mb-2 uppercase">3. MODIFICACIONES</h2>
           <p>Dignify está en constante evolución. Nos reservamos el derecho de mejorar las funciones sin previo aviso (¡siempre para bien!).</p>
        </div>
      </section>
      
      <div className="mt-20 pt-8 border-t border-neutral-800 text-sm text-neutral-500 text-center uppercase tracking-widest">
        Dignify ReFi Music - Hecho por curadores para amantes del sonido.
      </div>
    </div>
  );
}
