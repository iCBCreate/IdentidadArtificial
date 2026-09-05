# Plan integral de rediseño UX, compatibilidad y SEO

Fecha: 5 de septiembre de 2026. Estado: implementación completada localmente en `codex/rediseno-ux-seo`; pendiente de revisión manual en Edge y publicación.

Este documento sustituye y amplía el plan anterior. Conserva sus correcciones y define la experiencia de todas las páginas y plantillas del sitio. La dirección elegida por el usuario es simplificar la portada manteniendo la identidad oscura y violeta.

## 1. Objetivo y evidencia

Hacer que cualquier visitante pueda encontrar un contenido, comprenderlo y continuar hacia un artículo, tutorial o experimento relacionado sin que la decoración o la explicación técnica del sitio se interpongan.

Público principal: personas que quieren comprender y utilizar la IA, incluidas personas sin experiencia técnica. Los detalles avanzados permanecen disponibles mediante una jerarquía de lectura progresiva.

### Hallazgos que conserva el plan

| Prioridad | Evidencia de la revisión previa en esta conversación | Resultado exigido |
| --- | --- | --- |
| Alta | Tablas Markdown mostradas como texto con barras en GPT-6 y GPT vs Skill | Tablas HTML semánticas y legibles en ambas colecciones |
| Alta | Abrir menú móvil y ampliar ventana mantiene el contenido con `inert` | Recuperar interacción y foco al cerrar o cambiar de tamaño |
| Alta | 63 destinos de etiquetas rotos: 56 respuestas 404 y 7 respuestas 410 | No emitir enlaces internos a etiquetas inexistentes o retiradas |
| Alta | `/tag/gemini/` en sitemap responde 200 mostrando «410 Gone» | Archivo Gemini válido, con canonical y contenido |
| Resuelto en la migración Astro 7 | El diagnóstico inicial encontró Astro 7.2.2 instalado frente a 6.4.8 en el lockfile | `package.json` y lockfile se alinearon con Astro 7.2.2; mantener `npm ci` y la comprobación del build de despliegue |
| Media | Portada con 1.209 etiquetas decorativas y unos 238 kB de HTML sin comprimir | Eliminar repetición masiva y reducir el HTML de portada al menos un 30% |
| Media | Título y botones dependen de animaciones de opacidad | Contenido principal visible desde el primer render |
| Media | Navegación se comprime y parte textos a 768 px | Menú compacto por debajo de 1024 px |
| Media | Sitemap basado en `mtime`; múltiples contenidos con casi la misma hora | Fechas editoriales estables |

Se rastrearon las 83 URLs del sitemap y se inspeccionaron plantillas. Eso no equivale a una auditoría exhaustiva de todas las interacciones. No hay medición actual de Core Web Vitals ni datos actuales de Search Console. Edge no está instalado en el Mac examinado: su problema específico sigue pendiente de reproducción.

Se solicitaron tres agentes para UX editorial, laboratorio y arquitectura global. Los tres fallaron por límite de uso antes de entregar resultados. La especificación se completó mediante revisión directa del código; no se atribuyen conclusiones a esos agentes.

## 2. Arquitectura y sistema visual

### Navegación

- Logo enlazado a inicio. Cinco entradas principales: **Artículos**, **Tutoriales**, **Laboratorio**, **Explorar**, **Sobre**.
- Artículos enlaza a `/archivo/`. Explorar es un botón de despliegue con enlaces reales a Mapa IA y Radar editorial; no se crea otra ruta.
- Sobre enlaza a `/sobre/`, que conduce a Cómo funciona. El pie mantiene enlaces directos a ambas páginas, mapa, radar, RSS, redes y legales.
- En móvil, un panel desplegable en el flujo, con grupos visibles, cierre con Escape y devolución del foco al botón. Evitar comportamiento modal: no bloquear el contenido con `inert`.
- Al superar 1024 px se reinicia el estado móvil. El elemento activo usa `aria-current`; los desplegables funcionan por clic y teclado, sin depender del hover.
- Todas las páginas interiores muestran breadcrumbs con nombres comprensibles. Los títulos largos se ajustan en varias líneas sin invadir otros elementos.

### Dirección visual común

| Elemento | Decisión |
| --- | --- |
| Color | Fondo `#1C1C2C`, superficie `#24243A`, texto principal `#E8E8F0`, secundario `#C8C8E0`, enlaces `#A78BFA`. Validar contraste de cada combinación y estado |
| Tipografía | Mantener Inter local; JetBrains Mono solo en código y datos que lo justifiquen |
| Lectura | Cuerpo 18 px en escritorio y 17 px en móvil; interlineado 1,7; columna editorial máxima de 68 caracteres |
| Anchura | Contenedor general máximo de 1152 px; laterales 20 px en móvil y 32 px en escritorio |
| Escala | Espaciado de 4, 8, 12, 16, 24, 32, 48 y 64 px; títulos fluidos de 30 a 48 px |
| Superficies | Bordes discretos, radios de 8–12 px y una sola capa de tarjeta. Evitar anidar tarjetas para cada párrafo |
| Controles | Área táctil mínima de 44 × 44 px; etiquetas persistentes; foco visible; estado deshabilitado distinguible |
| Movimiento | Sin bucles decorativos. Transiciones de estado cortas; contenido visible aunque no se ejecute la animación; respetar movimiento reducido |
| Imágenes | Conservar imágenes editoriales y reservar dimensiones. AVIF/WebP con fallback JPEG mediante `picture` donde corresponda, sin deformación |

Unificar cabecera, pie, encabezado de página, breadcrumbs, tarjetas, botones, campos, avisos, tablas, índice de lectura, bloques relacionados y estados de herramienta. Mantener Astro y reutilizar el JavaScript existente; no introducir un framework de aplicación para el rediseño.

## 3. Diseño página por página

### Descubrimiento y lectura

| Página o plantilla | Nueva composición, en orden | Acción y comportamiento |
| --- | --- | --- |
| **Inicio** `/` | Presentación de dos líneas; artículo más reciente destacado; cinco entradas recientes; acceso a tutoriales; cuatro experimentos; enlaces a mapa y radar | Principal: leer el destacado. Presentación sin ocupar toda la pantalla; comienzo del contenido editorial visible a 1280 × 720. Cronología de modelos trasladada a Mapa IA y ticker retirado de la portada |
| **Archivo** `/archivo/` | Título breve; búsqueda y categorías; contador; listado; paginación | Buscar por título, descripción y etiquetas en todo el corpus. Categorías son enlaces a sus páginas. Sin hero de pantalla completa |
| **Paginación** `/pagina/[page]/` y `/archivo/pagina/[page]/` | Encabezado «Artículos · Página N»; listado; anterior/siguiente y números | Conservar rutas, orden cronológico y enlaces HTML. Mostrar ubicación y no repetir la presentación de inicio. Mantener `noindex,follow` y canonical propio |
| **Categoría** `/categoria/[categoria]/` | Nombre; introducción específica de 2–3 frases; selección para empezar; todos los artículos | Empezar por el contenido más útil y continuar por fecha. Usar las seis categorías existentes; no crear otras sin contenido |
| **Etiqueta** `/tag/[tag]/` | Tema; explicación breve; contenidos relacionados; vínculo a categorías relevantes | Enlazar solo etiquetas publicables. Las etiquetas sin página siguen visibles como texto, sin enlace ficticio |
| **Artículo** `/[slug]/` | Breadcrumbs; título, descripción, autor, publicación/actualización y lectura; imagen; índice; cuerpo; fuentes/transparencia; continuación | Índice lateral desde 1200 px y desplegable encima del cuerpo en tamaños menores. Unificar relacionados semánticos y editoriales en un máximo de tres destinos sin duplicados |
| **Tutoriales** `/tutoriales/` | Introducción «Qué quieres aprender»; selector de herramienta; listado con dificultad, tiempo y resultado esperado | Filtrar las guías existentes por herramienta. Mantener todas visibles sin JS; no crear subsecciones vacías para aparentar más contenido |
| **Tutorial** `/tutoriales/[slug]/` | Resultado esperado; requisitos; tiempo/dificultad; índice de pasos; contenido; comprobación final; siguiente tutorial o experimento | Diferenciar instrucciones, ejemplos y resultado. Mantener pasos y secciones existentes, sin inventar procedimientos. Eliminar pies de imagen huérfanos y mostrar correctamente tablas |

### Laboratorio y exploración

Las herramientas comparten: encabezado corto → ejemplo opcional → entrada → resultado → interpretación → enlace para aprender más. En escritorio, entrada y resultado pueden ocupar dos columnas; en móvil se apilan en ese orden. No ocultar la explicación editorial tras la carga de una dependencia.

| Página | Nueva experiencia | Estados y criterio específico |
| --- | --- | --- |
| **Laboratorio** `/laboratorio/` | Cuatro tarjetas orientadas a tareas: contar tokens, explorar generación, comparar contexto/coste y comparar significados | Mostrar qué se obtiene y si necesita descarga. El tamaño de descarga se destaca en embeddings; evitar detalles como «carga diferida» en tarjetas ordinarias |
| **Tokenizador** `/laboratorio/tokenizador/` | Texto, botón «Probar ejemplo», «Limpiar»; total de tokens y caracteres; tokens coloreados; explicación breve | Inicio vacío con instrucción útil; carga anunciada; error con reintento conservando texto. Identificar `o200k_base` y no prometer exactitud para todos los modelos |
| **Contexto y costes** `/laboratorio/calculadora-contexto/` | Modos explícitos «Texto» y «Número de tokens»; salida prevista; resultados por modelo; detalle de tarifas | En modo texto, el recuento calculado es de solo lectura; en manual, solo manda el número introducido. Mostrar método, USD, fecha y fuente; distinguir coste de esta consulta de tarifa por millón. Advertir cuando entrada más salida exceda contexto |
| **Sampling** `/laboratorio/sampling/` | Frase de ejemplo; parámetros con valor numérico; gráfico; «Muestrear token»; «Restablecer»; interpretación | Identificar la distribución como demostración sintética. Añadir tabla textual equivalente al gráfico y estado del token obtenido, accesible con teclado |
| **Embeddings** `/laboratorio/embeddings/` | Explicación breve y descarga explícita; progreso; frases; calcular; vista de similitudes y mapa; interpretación | No descargar automáticamente. Conservar entrada tras error; mostrar reintento. Explicar que el texto se procesa localmente y el modelo se descarga de un proveedor externo. La caché puede ser eliminada por el navegador |
| **Mapa IA** `/mapa-ia/` | Explicación de utilidad; selección de concepto/empresa; lista de artículos relacionados; grafo; cronología de modelos; metodología | Lista HTML como vista inicial móvil y alternativa accesible siempre disponible. La selección se comparte entre lista y grafo; limpiar selección devuelve el conjunto. No presentar proximidad gráfica como una medida científica |
| **Radar** `/radar/` | «Temas por explorar»; explicación de que son propuestas editoriales; temas con motivo y lecturas existentes; metodología | Diferenciar propuestas de artículos ya publicados. Enlazar solo contenidos existentes; no aparentar noticias en directo ni calendario comprometido |

### Confianza, gestión y errores

| Página | Nueva experiencia | Límite |
| --- | --- | --- |
| **Sobre** `/sobre/` | Qué aporta el sitio; autor; cómo se revisa; transparencia; enlaces profesionales y metodología | Mantener información comprobable. No inventar credenciales, retratos ni testimonios |
| **Cómo funciona** `/como-funciona/` | Resumen comprensible del proceso editorial; etapas; revisión; índice a detalles técnicos | Arquitectura, frontmatter e infraestructura pasan a una segunda sección para lectores técnicos, con fragmentos extensos plegables |
| **Aviso legal** `/aviso-legal/` | Encabezado compacto; índice cuando proceda; texto con ancho editorial | Preservar contenido legal; no reescribir obligaciones como parte del rediseño |
| **Privacidad** `/politica-de-privacidad/` | Misma plantilla documental; jerarquía clara y enlaces legibles | Preservar contenido; contrastar cualquier explicación sobre tratamiento de datos con el funcionamiento real |
| **Métricas** `/metricas/` | Formulario compacto; estado de consulta; periodo; indicadores; tablas y descargas | Mantener fuera de navegación pública y con `noindex`. Sin almacenamiento persistente del token. Distinguir sin datos, carga, error y datos obtenidos; nunca usar cero como sustituto de ausencia |
| **404** | Mensaje claro; acceso a archivo, tutoriales e inicio | HTTP 404 real, noindex y sin controles decorativos que simulen una búsqueda |
| **410** | Explicación de retirada; enlace a sustituto solo si existe relación documentada; acceso al archivo | HTTP 410 real. No devolver una plantilla de retirada con 200 ni incluirla en sitemap |

RSS, sitemaps, endpoints API y archivos para rastreadores no reciben una interfaz visual. Se conserva su contrato y se valida su coherencia con las páginas.

## 4. Datos, comportamiento y SEO

### Contratos que cambian

- Añadir `updatedAt?: Date` en artículos y tutoriales; no derivarlo de la fecha de generación. Fecha modificada = actualización editorial documentada o publicación. Migrar únicamente fechas verificables.
- Añadir configuración editorial de categorías: título, introducción y selección de slugs existentes. Para tutoriales, `learningOutcome?: string` y `prerequisites?: string[]`; completar los cuatro actuales desde su contenido.
- Crear un registro compartido de etiquetas y rutas retiradas usado por generación, enlaces, sitemap y validación. Etiqueta publicable: al menos dos artículos distintos y ausencia de retirada explícita.
- Recuperar Gemini retirándolo del registro de bajas. Conservar las otras retiradas hasta que exista justificación editorial para recuperarlas. No redirigir automáticamente todos los 404 al archivo.
- Índice de búsqueda estático con título, descripción, tags y URL de artículos; sin cuerpos completos ni llamadas a IA. Carga solo en archivo, comparación insensible a mayúsculas y acentos, todos los términos deben aparecer en el conjunto de campos.
- `/archivo/?q=...` restaura la consulta. Sin consulta se mantiene la paginación estática; con consulta se muestran todas las coincidencias por fecha y contador. Limpiar vuelve a `/archivo/`; atrás/adelante restauran el estado. Canonical siempre `/archivo/`, sin incluir búsquedas en sitemap.
- Eliminar `SearchAction` del JSON-LD; la búsqueda se incorpora por utilidad para el lector. Alinear `ItemList` del archivo con el listado estático visible de cada página.
- Los filtros de tutoriales y la selección del mapa son locales a la página, sin nuevas URLs indexables ni persistencia entre sesiones.

### Estructura editorial y rastreo

- Conservar slugs, colecciones separadas y enlaces existentes válidos. No mover artículos a una nueva jerarquía de URL.
- Introducciones de categorías y selección de lecturas orientadas a una intención concreta; no añadir texto repetitivo para llenar páginas.
- Enlazar concepto → tutorial → herramienta cuando exista relación real. Asegurar acceso a cada contenido importante mediante navegación HTML y no solo mediante un grafo o filtro.
- Canonical, metadatos sociales, breadcrumbs y datos estructurados deben describir la página visible. En tutoriales, usar tipo social de artículo e imagen editorial cuando exista.
- `lastmod` de contenido procede de fecha editorial; de categorías, de sus contenidos y cambios editoriales documentados. Omitir la fecha cuando no sea fiable. No utilizar `mtime` de checkout.
- Mantener las exclusiones actuales de paginación, métricas y legales del sitemap. Etiquetas válidas siguen siendo indexables; no fusionar categorías y tags automáticamente sin analizar su intención.
- Sustituir el informe SEO antiguo por resultados con fecha, método y limitaciones. No reutilizar sus puntuaciones ni estimaciones de rendimiento como mediciones actuales.

## 5. Implementación por fases y responsabilidades

1. **Base reproducible y errores:** instalación aislada desde lockfile, diagnóstico MDX, tablas, etiquetas/retiradas, menú y fechas SEO. No asumir que un cambio de CSS arregla el procesamiento Markdown.
2. **Sistema visual:** componentes compartidos y tres pantallas de referencia en previsualización: inicio, artículo y herramienta. Revisar escritorio y móvil antes de extender las reglas.
3. **Plantillas editoriales:** inicio, archivo, paginaciones, categorías, etiquetas, artículos y tutoriales; búsqueda e interconexiones.
4. **Herramientas y confianza:** laboratorio, mapa, radar, sobre, metodología, legales, métricas y errores.
5. **Verificación y publicación:** pruebas, comparación visual, rastreo de previsualización, revisión de cambios y despliegue por el procedimiento del repositorio cuando se autorice la implementación/publicación.

Cuando vuelvan a estar disponibles, repartir el trabajo entre agentes con estas responsabilidades:

| Rol | Responsabilidad exclusiva |
| --- | --- |
| Coordinación y sistema visual | Tokens, componentes compartidos, navegación, interfaces y resolución de integración |
| UX/frontend editorial | Páginas y plantillas de lectura y descubrimiento, sin cambiar tokens comunes unilateralmente |
| UX/frontend herramientas | Laboratorio y exploración, estados e interacciones, sin modificar cálculo semántico o tarifas por motivos visuales |
| QA y SEO | Revisión independiente, regresiones, rastreo, metadatos y evidencia de compatibilidad; no sustituir pruebas por opinión visual |

Los agentes reciben las interfaces compartidas antes de trabajar en paralelo y no revierten cambios ajenos. Si el límite de uso continúa, ejecutar las mismas fases secuencialmente; no afirmar que hubo revisión independiente.

## 6. Pruebas y definición de terminado

### Funcionales y visuales

- Revisar cada plantilla de la matriz a 390, 768, 1024 y 1280 px; comprobar también reflujo a 320 px y zoom 200%. Sin desbordamiento de página; tablas y gráficos pueden tener un área de desplazamiento explícita.
- Pruebas reales en Edge y Chrome. Registrar sistema operativo y versión; incluir Edge en Windows para cerrar el problema comunicado. Hasta disponer de ese entorno, marcarlo pendiente.
- Menú por teclado, Escape, cambio de ancho, foco y navegación. Contenido esencial visible con movimiento reducido, sin animaciones y sin JavaScript.
- Artículo y tutorial con tabla larga, código, enlaces extensos e índice. Comprobar que existen `table`, `thead` y celdas, no solo aspecto parecido a tabla.
- Archivo: consulta con acentos, sin coincidencias, consulta vacía, coincidencia en artículo de otra página, atrás/adelante y JavaScript desactivado.
- Herramientas: vacío, ejemplo, cálculo válido, entrada inválida, dependencia bloqueada, reintento y cambio de texto durante carga. Embeddings: probar sin descargar antes de consentimiento y comprobar texto conservado tras error.
- Contraste WCAG AA, controles etiquetados, foco visible y gráficos con equivalente textual. Auditoría automática complementada con recorrido manual; no prometer conformidad completa solo por una captura.
- Verificar que cambios de presentación no alteran cálculos, probabilidades, formatos de descarga ni privacidad. Revisar estados de métricas con datos simulados; no necesita credenciales reales para desarrollar la interfaz.

### SEO y rendimiento

- Recorrer sitemap y todos los enlaces internos relevantes: cero enlaces emitidos a destinos 404/410, cero retiradas dentro del sitemap y cero respuestas 200 con página de error.
- Un H1 claro por plantilla, títulos y descripciones propios, canonical coherente y JSON-LD alineado con contenido visible. Fechas idénticas en builds sucesivos si no cambia contenido.
- Ejecutar pruebas del repositorio y build con dependencias reproducibles. Añadir regresiones de los fallos reales: tablas, menú, etiquetas, búsqueda y fechas.
- Medir portada, artículo, tutorial y laboratorio antes/después bajo iguales condiciones; tres ejecuciones y mediana. Separar pruebas de laboratorio de datos reales de usuarios.
- Objetivos: HTML de portada al menos 30% menor; ningún modelo ni herramienta pesada precargada al leer un artículo; evitar prerender de rutas costosas del laboratorio. LCP ≤2,5 s y CLS ≤0,1 como objetivos de laboratorio; INP <200 ms solo se confirma con medición adecuada, no por inspección de código.
- Después de publicar: comprobar HTTP, recursos, sitemap y enlaces; notificar URLs modificadas con mecanismos existentes únicamente tras verificar producción. Observar indexación y rendimiento con Search Console cuando haya acceso, sin prometer un aumento concreto de tráfico.

### Entregables

- Sitio rediseñado por todas las plantillas de esta especificación, manteniendo contenido y URLs válidas.
- Evidencia de escritorio/móvil y estados críticos; informe con qué se probó y qué quedó bloqueado.
- Documento SEO actualizado y plan de reversión mediante el despliegue anterior, sin migración destructiva de contenido.

**Siguiente acción:** revisar manualmente en Edge, publicar mediante el procedimiento habitual y verificar las URLs de producción.
