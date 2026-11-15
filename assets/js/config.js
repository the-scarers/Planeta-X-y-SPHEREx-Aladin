/* Planeta X y SPHEREx — configuración de la página.
   Textos, correo, enlaces de IRSA, las imágenes del visor, el
   comparador, la línea de tiempo, las preguntas y el equipo.
   Cambiar un texto o una fecha aquí cambia la página, sin tocar
   el HTML ni la lógica. Las imágenes se piden por nombre a
   window.IMAGES (assets/js/images.js), que se carga antes. */

window.CONFIG = {
  tituloProyecto: "Planeta X y SPHEREx",
  lema: "El cielo completo, en colores que tus ojos no pueden ver",
  subtitulo: "Somos un grupo de estudiantes curiosos. Armamos este visor para que cualquiera pueda mirar el cielo como lo ve SPHEREx, el telescopio infrarrojo de la NASA, y compararlo con los datos reales que se publican cada semana en IRSA.",
  correoContacto: "ejemplo@ejemplo.com",
  textoContacto: "¿Te quedó una duda? ¿Lo usaste en clase y pasó algo bueno (o algo raro)? Cuéntanos. Leemos todo, aunque a veces tardamos unos días en responder entre tareas.",
  irsaExplorer: "https://irsa.ipac.caltech.edu/applications/spherex/tool-spectrophotometry",
  irsaArchivo: "https://irsa.ipac.caltech.edu/cgi-bin/Gator/nph-scan?mission=irsa&submit=Select&projshort=SPHEREx",
  irsaGuia: "https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access/",
  imagenesVisor: [
    { src:IMAGES.mapaCieloCompleto, cat:"cielo", alt:"Mapa de todo el cielo en luz infrarroja: una franja brillante cruza el centro, que es el plano de nuestra galaxia, la Vía Láctea, rodeada de nubes de gas y polvo en tonos rojizos y azulados", titulo:"Mapa completo del cielo en infrarrojo", fecha:"Primer mapa completo de la misión", descripcion:"Todo el cielo en una sola imagen. La franja brillante del centro es nuestra galaxia vista de lado. Los colores no son los reales: cada uno representa un tipo de luz infrarroja y ayuda a distinguir gas, polvo y estrellas.", credito:"NASA / JPL-Caltech" },
    { src:IMAGES.mismaNubeDosColores, cat:"cielo", alt:"La misma región del cielo en dos colores infrarrojos: a la izquierda una nube brillante anaranjada y a la derecha esa misma nube casi desaparece y solo quedan las estrellas", titulo:"La misma nube, en dos colores distintos", fecha:"Primeras imágenes de prueba · 2025", descripcion:"A la izquierda la nube brilla en un color infrarrojo (3,29 micrómetros). A la derecha, en otro color (0,98 micrómetros), casi desaparece. Comparar así es, literalmente, como los astrónomos saben de qué está hecha una nube.", credito:"NASA / JPL-Caltech" },
    { src:IMAGES.spherexPruebasCamara, cat:"telescopio", alt:"El telescopio SPHEREx dentro de una cámara de pruebas, cubierto con una manta plateada brillante, iluminado con luz azul a un lado y roja al otro", titulo:"SPHEREx antes de volar: las pruebas", fecha:"Cámara de vacío térmico · antes del lanzamiento", descripcion:"Antes de ir al espacio lo metieron en esta cámara que imita el frío y el calor extremos de allá arriba. Su cono plateado no es decoración: es un escudo contra el calor del Sol.", credito:"NASA / JPL-Caltech" },
    { src:IMAGES.spherexIlustracion, cat:"ilustracion", alt:"Ilustración del telescopio SPHEREx flotando en el espacio sobre fondo negro: se ve su gran cono plateado abierto hacia arriba y el cuerpo del telescopio debajo", titulo:"Así es SPHEREx", fecha:"Ilustración del observatorio", descripcion:"Dato que nos sorprendió: SPHEREx mide unos 2,6 metros y pesa menos que un piano de cola. Pequeño, pero fotografía TODO el cielo.", credito:"NASA / JPL-Caltech" },
    { src:IMAGES.telescopioPorDentro, cat:"ilustracion", alt:"Ilustración que muestra el interior del telescopio SPHEREx dentro de su cono plateado: se aprecian el espejo, los soportes verdes y los instrumentos", titulo:"El telescopio por dentro", fecha:"Ilustración en corte del observatorio", descripcion:"Dentro del cono, un espejo recoge la luz y la reparte en 102 colores infrarrojos. Piensa en 102 fotos a la vez, cada una con un filtro distinto.", credito:"NASA / JPL-Caltech" },
    { src:IMAGES.todoLoQueObserva, cat:"ilustracion", alt:"Ilustración de SPHEREx en el espacio enviando un haz de colores arcoíris, rodeado de dibujos de galaxias, nebulosas y la red cósmica que el telescopio estudia", titulo:"Todo lo que SPHEREx observa", fecha:"Póster de la misión", descripcion:"Galaxias lejanas, lugares donde nacen estrellas, hielo escondido entre las nubes de la galaxia… y todo eso termina en mapas que cualquiera puede descargar gratis.", credito:"NASA / JPL-Caltech" }
  ],
  comparacion: {
    /* ===== COMPARADOR "ANTES Y AHORA" =====
       Una imagen PASADA y una ACTUAL de la misión, lado a lado.
       REGLA: entre las dos fechas debe haber 6 MESES como mínimo.
       Ninguna de las dos es el mapa completo del cielo, y no es la misma
       nube repetida en otro color: son dos regiones distintas del cielo.
       Para actualizar la comparación, cambia la imagen "actual" por una
       más nueva y pon su fecha real en fechaISO (año-mes-día). La página
       calcula sola cuántos meses hay entre las dos y avisa si son menos de 6. */
    pasada: { src:IMAGES.comparadorPasada, fechaISO:"2025-04-01", fechaTexto:"Abril de 2025", titulo:"Una de las primeras imágenes: nube de polvo en la Gran Nube de Magallanes", detalle:"Imagen de prueba en un solo color infrarrojo (3,29 µm)", alt:"Imagen pasada de SPHEREx, de abril de 2025: una nube de polvo anaranjada llena de estrellas dentro de la Gran Nube de Magallanes, vista en un solo color infrarrojo", credito:"NASA / JPL-Caltech" },
    actual: { src:IMAGES.comparadorActual, fechaISO:"2025-12-18", fechaTexto:"Diciembre de 2025", titulo:"Lo más reciente: nebulosas y polvo sobre el plano de la Vía Láctea", detalle:"Detalle (recorte ampliado) del primer mapa del cielo, publicado el 18 de diciembre de 2025", alt:"Imagen actual de SPHEREx, de diciembre de 2025: detalle de una región del cielo con nebulosas azuladas y polvo rojizo sobre la franja brillante del plano de la Vía Láctea. Es un recorte ampliado, no el mapa completo", credito:"NASA / JPL-Caltech" }
  },
  lineaDeTiempo: [
    { etiqueta:"Antes del lanzamiento · Las pruebas", imagen:2, nota:"Antes de volar, SPHEREx aguantó frío y calor extremos en una cámara que imita el espacio. Si sobrevivía ahí, sobrevivía allá arriba." },
    { etiqueta:"11 de marzo de 2025 · Lanzamiento", imagen:3, nota:"Despegó desde California en un Falcon 9. Desde entonces da vueltas a la Tierra de polo a polo, unas 14 veces y media al día." },
    { etiqueta:"Primavera 2025 · Primeras imágenes", imagen:1, nota:"Llegaron las primeras imágenes de prueba. Todavía no eran 'ciencia oficial', pero ya se veía lo importante: el telescopio ve lo invisible." },
    { etiqueta:"2025 – 2026 · Barridos del cielo", imagen:0, nota:"SPHEREx fotografía el cielo completo una y otra vez, en 102 colores. Cada semana, imágenes nuevas llegan al archivo IRSA." },
    { etiqueta:"Mapas para todas y todos", imagen:5, nota:"Los mapas se publican abiertos. Científicos, escuelas o simplemente tú, un martes a las 11 de la noche, pueden usarlos." }
  ],
  preguntas: [
    { p:"¿Qué significa SPHEREx?", r:"Es la abreviatura en inglés de Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer. Traducido sin solemnidad: un telescopio que estudia la historia del universo y busca hielo en el espacio separando la luz en muchos colores." },
    { p:"¿Por qué mira en infrarrojo y no con luz normal?", r:"Porque hay cosas que solo aparecen en infrarrojo: nubes frías donde nacen estrellas, galaxias lejanísimas y hielo escondido. Además el infrarrojo atraviesa el polvo que nos tapa la vista. Es parecido a ver el calor en la oscuridad." },
    { p:"¿Cuántas galaxias va a mapear?", r:"Unas 450 millones de galaxias y más de 100 millones de estrellas de la nuestra. Con eso se arma un mapa en 3D del universo." },
    { p:"¿Cuánto dura la misión?", r:"La misión principal dura unos dos años. En ese tiempo recorre el cielo completo varias veces." },
    { p:"¿Las imágenes de esta página son reales?", r:"Sí, son imágenes e ilustraciones oficiales de NASA / JPL-Caltech. Cuando algo es ilustración de artista, lo decimos en la descripción. Sin trucos." },
    { p:"¿Qué es IRSA y qué hace su herramienta de espectrofotometría?", r:"IRSA es el archivo oficial donde se guardan los datos infrarrojos de la NASA (lo opera IPAC, en Caltech). Su herramienta de espectrofotometría de SPHEREx te deja elegir un punto del cielo y ver su espectro: cuánta luz infrarroja llega en cada color. Es el enlace que abren todos los botones IRSA de esta página." },
    { p:"¿Puedo usar las imágenes en mi escuela o proyecto?", r:"Las imágenes de NASA suelen ser de uso libre para fines educativos citando la fuente: NASA/JPL-Caltech. Si es algo comercial, revisa el crédito en la página oficial de cada imagen." }
  ],
  nombreEquipo: "THE SCARERS",
  equipo: [
    { iniciales:"EJ", nombre:"Tu nombre aquí", rol:"Coordinación", frase:"Espacio de ejemplo: escribe aquí qué hace esta persona. Se cambia en 10 segundos con el botón Editar." },
    { iniciales:"EJ", nombre:"Tu nombre aquí", rol:"Contenidos", frase:"Espacio de ejemplo: una frase corta y honesta vale más que un currículum entero." },
    { iniciales:"EJ", nombre:"Tu nombre aquí", rol:"Diseño web", frase:"Espacio de ejemplo: quién peleó con los colores hasta que la página se vio bien en el celular." },
    { iniciales:"EJ", nombre:"Tu nombre aquí", rol:"Divulgación", frase:"Espacio de ejemplo: quién explica SPHEREx sin que nadie se duerma en el intento." },
    { iniciales:"EJ", nombre:"Tu nombre aquí", rol:"Investigación en IRSA", frase:"Espacio de ejemplo: quién busca las coordenadas y comprueba los datos en el archivo oficial." },
    { iniciales:"EJ", nombre:"Tu nombre aquí", rol:"Imágenes y comparador", frase:"Espacio de ejemplo: quién elige las imágenes nuevas y revisa que se vean bien en el visor." }
  ],
  datosCuriosos: [
    "SPHEREx pesa menos que un piano de cola, pero va a mapear 450 millones de galaxias.",
    "Cada imagen de SPHEREx guarda 102 colores. Tus ojos distinguen, en la práctica, tres.",
    "El telescopio trabaja a unos −210 °C. Más frío que una noche en Plutón… bueno, casi.",
    "Da unas 14 vueltas y media a la Tierra cada día. En lo que dura tu jornada escolar, ya dio varias.",
    "El hielo que busca SPHEREx no está en planetas: flota en nubes entre las estrellas.",
    "Los datos son públicos y gratuitos. Sí, también para ti. Están en IRSA."
  ]
};
