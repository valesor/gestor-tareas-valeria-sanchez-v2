// --- versión de  caché ---
const CACHE_NAME = "gestor-tareas-cache-v2"; 

const URLS_TO_CACHE = [

'/', // cacheo ruta raíz

// Archivos locales 
"index.html",
"css/styles.css",
"js/script.js",
"img/icono.png",
"img/192-icono.png",
"img/512-icono.png",
"img/organizacion.jpg",
"manifest.json", 
"screenshots/screen1.png",
"screenshots/screen2.png",

// --- Extra  añado las URLs de externos ---
'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
'https://code.jquery.com/jquery-3.5.1.slim.min.js',
'https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js',
'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'

];

// 1) Instalación: guardo en caché los recursos
self.addEventListener("install", (event) => {
/* console.log(`[SW ${CACHE_NAME}] Instalando...`);  */// prueba
event.waitUntil(
  caches
    .open(CACHE_NAME)
    .then((cache) => {
      console.log(`[SW ${CACHE_NAME}] Cache abierto. Añadiendo URLs al caché:`, URLS_TO_CACHE);
      return cache.addAll(URLS_TO_CACHE); //  cachea todas las URLs
    })
    .then(() => {
      console.log(`[SW ${CACHE_NAME}] Recursos cacheados exitosamente.`);
      return self.skipWaiting(); // Fuerza la activación del nuevo SW
    })
    .catch(err => {
       // Si addAll falla, la instalación del SW fallará.
       console.error(`[SW ${CACHE_NAME}] Falló cache.addAll(): `, err);
    })
);
});

// 2) Activación: limpio cachés antiguas
self.addEventListener("activate", (event) => {
console.log(`[SW ${CACHE_NAME}] Activando...`); 
event.waitUntil(
  caches
    .keys()
    .then((keys) => {
      // Filtro y elimina todas excepto la actual (CACHE_NAME)
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log(`[SW ${CACHE_NAME}] Eliminando caché antigua: ${key}`);
            return caches.delete(key);
          })
      );
    })
    .then(() => {
      console.log(`[SW ${CACHE_NAME}] Cachés antiguas limpiadas.`);
      return self.clients.claim(); 
    })
);
});

// 3) Fetch: respondo desde caché o red 
self.addEventListener("fetch", (event) => {
// Ignorar peticiones que no sean GET o de extensiones
if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
  return;
}
// No intentar cachear el propio service worker
if (event.request.url.includes("service-worker.js")) {
  return;
}

// Estrategia Cache-First
event.respondWith(
  caches.match(event.request).then((cachedResponse) => {
    
    if (cachedResponse) {
      // console.log(`[SW ${CACHE_NAME}] Sirviendo desde caché: ${event.request.url}`); test
      return cachedResponse;
    }
    // Si no está en caché, la busca en la red
    // console.log(`[SW ${CACHE_NAME}] No en caché, buscando en red: ${event.request.url}`); test
    return fetch(event.request);
  })
 

);
});