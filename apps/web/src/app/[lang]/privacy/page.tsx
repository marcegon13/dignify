export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-300 px-6 py-20 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black text-emerald-500 mb-8 tracking-tighter">POLÍTICA DE PRIVACIDAD</h1>
      <p className="mb-6 text-lg">En Dignify, respetamos tu vibra y tu privacidad. Solo usamos tus datos de Google para que puedas guardar tus favoritos y crear tus propias curaciones musicales.</p>
      
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase">1. DATOS QUE RECOGEMOS</h2>
          <p>Utilizamos Google Auth para darte acceso. Recogemos tu nombre y tu email para que tus listas te acompañen siempre. No compartimos tus datos con nadie (ni siquiera con una IA extraña).</p>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase">2. TU MÚSICA ES TUYA</h2>
          <p>Usamos APIs oficiales de YouTube, SoundCloud y Spotify para mostrarte resultados. Tu actividad de escucha y tus likes solo sirven para que tu experiencia en Dignify sea única.</p>
        </div>

        <div>
           <h2 className="text-xl font-bold text-white mb-2 uppercase">3. CONTACTO</h2>
           <p>Si tienes cualquier duda, búscanos por las redes o escribe al responsable de Dignify.</p>
        </div>
      </section>
      
      <div className="mt-20 pt-8 border-t border-neutral-800 text-sm text-neutral-500 text-center">
        Dignify ReFi Music - Curando la atmósfera global.
      </div>
    </div>
  );
}
