# 🚀 Dignify: Road to Monetization & Google Play

## 1. Estrategia de Monetización
Dignify se diferenciará de Spotify por ser la plataforma de los artistas independientes y la alta fidelidad.

### Plan Oyente (Freemium)
- **Gratis:** Escucha desde YouTube/Deezer con calidad estándar.
- **Premium:** Acceso a audio **WAV original** (subido por artistas), sin interrupciones, y modo offline.

### Plan Artista (El Modelo /tanodelatierra)
- **Costo:** Suscripción mensual por espacio de almacenamiento (Cloud Hosting).
- **Control:** El artista sube sus archivos Master (WAV) y tiene su propio link directo.
- **Monetización Directa:** Soporte para "Tips" de fans.

## 2. Requisitos de Google Play Store (2024)
Para publicar, Google exige pasar por una fase de **Pruebas Cerradas**.

### El Desafío de los 20 Testers
- **Mecanismo:** Debemos recolectar 20 correos de Google (Gmail/Workspace).
- **Acción:** Registramos esos correos en la Play Console bajo "Pruebas Cerradas".
- **Condición:** Los 20 testers deben tener la app instalada durante **14 días consecutivos**.
- **Informe:** Al final de los 14 días, enviamos un informe a Google detallando qué feedback recibimos.

### Tareas Técnicas Pendientes para Calidad Pro
- [ ] **Optimización de Memoria:** Asegurar que el reproductor no consuma batería excesiva en segundo plano.
- [ ] **Sistema de Upload:** Crear la interfaz para que tú (y otros artistas) suban sus WAVs.
- [ ] **Pasarela de Pagos:** Integrar **Stripe** o **Mercado Pago** para las suscripciones.
- [ ] **Conversión a APK/Bundle:** Usar herramientas como `Capacitor` o `TWA` para empaquetar la web actual en un archivo instalable de Android.

## 3. Próximos Pasos Sugeridos
1. **Módulo de Perfil de Artista:** Crear la página donde se verán tus canciones exclusivas.
2. **Setup de Almacenamiento:** Configurar un "Bucket" (espacio en la nube) para guardar los archivos WAV pesados.
3. **Formulario de Registro de Testers:** Crear una pequeña landing dentro de Dignify para que la gente se anote como tester y así consigamos los 20 rápidamente.
