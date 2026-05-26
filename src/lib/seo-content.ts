export type LandingPage = {
  slug: string;
  type: 'commercial' | 'industry' | 'comparison' | 'faq';
  title: string;
  metaTitle: string;
  description: string;
  h1: string;
  eyebrow: string;
  problem: string;
  solution: string;
  example: string;
  bullets: string[];
  faqs: Array<{ question: string; answer: string }>;
  ctaText: string;
  whatsappMessage: string;
  priority: number;
};

export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
};

export const landingPages: LandingPage[] = [
  {
    slug: 'facturar-recibos-por-whatsapp',
    type: 'commercial',
    title: 'Facturar recibos por WhatsApp',
    metaTitle: 'Facturar recibos por WhatsApp en México',
    description: 'Tu equipo manda fotos de tickets por WhatsApp. Factura Mis Gastos solicita el CFDI, ordena el gasto y prepara el corte mensual para tu contador.',
    h1: 'Facturar recibos por WhatsApp sin perseguir tickets',
    eyebrow: 'Recibo -> CFDI -> reporte',
    problem: 'Cuando cada empleado guarda tickets en su celular, en su cartera o en chats separados, el cierre mensual se vuelve una persecución. Muchos gastos ya pagados terminan sin CFDI o llegan tarde al contador.',
    solution: 'FMG centraliza la captura por WhatsApp: tu equipo manda la foto del recibo y nosotros gestionamos la factura, la validamos y la ordenamos por mes para tu contador.',
    example: 'Un vendedor en campo paga gasolina, manda la foto del ticket al momento y FMG deja el gasto en seguimiento hasta conseguir o marcar el CFDI correspondiente.',
    bullets: [
      'Captura por WhatsApp sin capacitar al equipo en software complejo',
      'Seguimiento de tickets pendientes de factura',
      'Orden mensual en Drive por negocio y mes',
      'Reporte para contador con recibos facturados y pendientes',
    ],
    faqs: [
      {
        question: '¿El empleado necesita instalar una app?',
        answer: 'No. El flujo principal usa WhatsApp para que el equipo solo mande la foto del recibo.',
      },
      {
        question: '¿Qué pasa si el ticket no se puede facturar?',
        answer: 'Lo marcamos como pendiente o no facturable según el caso, para que el contador tenga visibilidad y no se pierda dentro del cierre mensual.',
      },
      {
        question: '¿Sirve para tickets de gasolina, casetas o restaurantes?',
        answer: 'Sí. Esos gastos son casos comunes porque suelen generarse fuera de oficina y se pierden con facilidad.',
      },
    ],
    ctaText: 'Mandar mi primer recibo',
    whatsappMessage: 'Hola, quiero facturar recibos por WhatsApp con Factura Mis Gastos. Te mando mi primer recibo.',
    priority: 0.9,
  },
  {
    slug: 'control-de-gastos-empresariales',
    type: 'commercial',
    title: 'Control de gastos empresariales',
    metaTitle: 'Control de gastos empresariales para PyMEs en México',
    description: 'Controla gastos por persona, sucursal o departamento. FMG convierte recibos dispersos en reportes mensuales ordenados para dirección y contador.',
    h1: 'Control de gastos empresariales sin depender de Excel',
    eyebrow: 'Gastos visibles, cierre ordenado',
    problem: 'Sin un flujo claro, los gastos aparecen hasta final de mes: tickets incompletos, compras sin responsable y reportes armados a mano cuando ya urge cerrar.',
    solution: 'FMG recibe comprobantes, da seguimiento a facturas y entrega una estructura mensual para saber quién gastó, cuánto gastó y qué quedó pendiente.',
    example: 'Una empresa con equipo en campo puede separar gastos por persona y detectar si gasolina, comida o materiales están creciendo fuera de política.',
    bullets: [
      'Control por empleado, sucursal o departamento',
      'Visibilidad de comprobantes pendientes',
      'Reglas básicas para límites y aprobaciones',
      'Corte mensual preparado para revisión contable',
    ],
    faqs: [
      {
        question: '¿FMG reemplaza mi sistema contable?',
        answer: 'No. FMG prepara y ordena la información para que tu contador o sistema contable trabaje con mejor evidencia.',
      },
      {
        question: '¿Puedo revisar gastos por persona?',
        answer: 'Sí. El servicio puede ordenar recibos por integrante del equipo, área, sucursal o negocio.',
      },
      {
        question: '¿Qué tamaño de empresa aplica?',
        answer: 'Funciona especialmente bien para PyMEs mexicanas con empleados que hacen compras frecuentes para operar.',
      },
    ],
    ctaText: 'Revisar mi flujo de gastos',
    whatsappMessage: 'Hola, quiero mejorar el control de gastos empresariales con Factura Mis Gastos.',
    priority: 0.88,
  },
  {
    slug: 'control-de-viaticos',
    type: 'commercial',
    title: 'Control de viáticos',
    metaTitle: 'Control de viáticos y gastos de viaje para empresas',
    description: 'Gestiona tickets de hoteles, taxis, gasolina, casetas y comidas. FMG ayuda a recuperar comprobantes y preparar el cierre mensual de viáticos.',
    h1: 'Control de viáticos sin perder tickets en el viaje',
    eyebrow: 'Viajes, tickets y facturas en orden',
    problem: 'Los viáticos se generan lejos de oficina. El empleado paga, toma foto tarde o pierde el ticket, y contabilidad intenta reconstruir el viaje días después.',
    solution: 'Con FMG, cada recibo se manda por WhatsApp en cuanto ocurre el gasto. Nosotros damos seguimiento al CFDI y dejamos el paquete listo para el contador.',
    example: 'Un técnico viaja a otra ciudad, manda recibos de hotel, comida, taxi y casetas durante el día. Al cierre, dirección recibe un paquete ordenado por viaje.',
    bullets: [
      'Recibos de hotel, gasolina, casetas, taxis y comidas',
      'Seguimiento de facturas faltantes',
      'Orden por empleado, viaje o proyecto',
      'Corte mensual para reembolso y deducción',
    ],
    faqs: [
      {
        question: '¿Se pueden controlar viáticos de varios empleados?',
        answer: 'Sí. FMG puede organizar comprobantes por empleado, proyecto, viaje, sucursal o departamento.',
      },
      {
        question: '¿Qué pasa con gastos sin factura?',
        answer: 'Se documentan y se marcan para revisión, evitando que queden mezclados con los gastos facturados.',
      },
      {
        question: '¿Ayuda con reembolsos?',
        answer: 'Sí. Al tener comprobantes ordenados por persona, el proceso de revisión y reembolso se vuelve más claro.',
      },
    ],
    ctaText: 'Ordenar mis viáticos',
    whatsappMessage: 'Hola, quiero controlar viáticos con Factura Mis Gastos.',
    priority: 0.86,
  },
  {
    slug: 'deducciones-fiscales-empresas',
    type: 'commercial',
    title: 'Deducciones fiscales para empresas',
    metaTitle: 'Evita perder deducciones fiscales por tickets sin CFDI',
    description: 'Reduce recibos olvidados y gastos sin factura. FMG ayuda a convertir tickets de operación en comprobantes ordenados para tu contador.',
    h1: 'Evita perder deducciones por tickets olvidados',
    eyebrow: 'Más comprobantes útiles para tu cierre',
    problem: 'Muchas empresas sí hacen el gasto, pero no aprovechan la deducción porque el ticket se pierde, se factura tarde o nunca llega al contador.',
    solution: 'FMG crea un proceso simple para capturar tickets, solicitar CFDI y entregar al contador un paquete mensual más completo y auditable.',
    example: 'Si cada semana se pierden tickets de gasolina, casetas y restaurantes, el negocio no solo pierde orden: puede perder comprobantes útiles para su cierre fiscal.',
    bullets: [
      'Seguimiento de tickets antes del cierre mensual',
      'Separación de facturados, pendientes y no facturables',
      'Validación y organización documental',
      'Entrega clara para revisión del contador',
    ],
    faqs: [
      {
        question: '¿FMG da asesoría fiscal?',
        answer: 'No. FMG ordena y gestiona comprobantes; la decisión fiscal final corresponde a tu contador.',
      },
      {
        question: '¿Garantizan que todo ticket sea deducible?',
        answer: 'No. Algunos comprobantes no cumplen requisitos. FMG ayuda a identificarlos y ordenarlos para revisión.',
      },
      {
        question: '¿Por qué ayuda a recuperar deducciones?',
        answer: 'Porque reduce tickets olvidados y mejora la probabilidad de pedir facturas a tiempo.',
      },
    ],
    ctaText: 'Revisar mis recibos',
    whatsappMessage: 'Hola, quiero evitar perder deducciones por tickets sin factura.',
    priority: 0.84,
  },
  {
    slug: 'gastos-por-empleado',
    type: 'commercial',
    title: 'Gastos por empleado',
    metaTitle: 'Control de gastos por empleado, sucursal o departamento',
    description: 'Ordena recibos por persona y entiende quién gasta, cuánto gasta y qué comprobantes faltan antes del cierre mensual.',
    h1: 'Controla gastos por empleado sin perseguir comprobantes',
    eyebrow: 'Quién gastó, cuánto y en qué',
    problem: 'Cuando varios empleados compran para operar, los tickets se mezclan. Dirección ve el total al final, pero no siempre sabe quién gastó, qué falta o qué gasto necesita aprobación.',
    solution: 'FMG organiza comprobantes por empleado y deja trazabilidad básica para que dirección y contador trabajen con información más clara.',
    example: 'Una sucursal puede separar gastos de encargado, mantenimiento y ventas, en lugar de recibir un paquete de fotos sueltas al cierre.',
    bullets: [
      'Historial de recibos por integrante del equipo',
      'Orden por departamento, sucursal o proyecto',
      'Alertas manuales para gastos que requieren revisión',
      'Paquete mensual para dirección y contador',
    ],
    faqs: [
      {
        question: '¿Puedo limitar quién envía recibos?',
        answer: 'Sí. El flujo puede activarse para usuarios específicos del equipo.',
      },
      {
        question: '¿Se puede usar en varias sucursales?',
        answer: 'Sí. Los comprobantes pueden ordenarse por negocio, sucursal o centro de costo.',
      },
      {
        question: '¿El empleado ve reportes?',
        answer: 'Puede tener visibilidad básica del estado de sus recibos si el negocio lo requiere.',
      },
    ],
    ctaText: 'Controlar gastos por empleado',
    whatsappMessage: 'Hola, quiero controlar gastos por empleado con Factura Mis Gastos.',
    priority: 0.82,
  },
  {
    slug: 'facturacion-cfdi-para-pymes',
    type: 'commercial',
    title: 'Facturación CFDI para PyMEs',
    metaTitle: 'Facturación CFDI para gastos de PyMEs mexicanas',
    description: 'FMG ayuda a PyMEs mexicanas a solicitar, validar y ordenar CFDI de gastos operativos recibidos por WhatsApp.',
    h1: 'Facturación CFDI de gastos para PyMEs mexicanas',
    eyebrow: 'Tickets operativos convertidos en orden contable',
    problem: 'Las PyMEs suelen resolver la facturación de gastos con mensajes sueltos, correos y hojas de cálculo. Eso crea errores y comprobantes faltantes.',
    solution: 'FMG recibe tickets, solicita CFDI al proveedor cuando aplica y deja la evidencia organizada para que el contador revise y cierre mejor.',
    example: 'Un negocio con 75 comprobantes al mes puede dejar de capturar tickets manualmente y concentrarse en operar.',
    bullets: [
      'Recepción de tickets y recibos por WhatsApp',
      'Solicitud y seguimiento de CFDI',
      'Orden por mes y negocio',
      'Integración operativa con contador',
    ],
    faqs: [
      {
        question: '¿FMG emite facturas?',
        answer: 'FMG gestiona la solicitud y orden de CFDI de gastos; no reemplaza la facturación propia de cada proveedor.',
      },
      {
        question: '¿Funciona para CFDI 4.0?',
        answer: 'El flujo contempla validación documental y revisión de datos fiscales con enfoque en operación mexicana.',
      },
      {
        question: '¿Sirve si ya tengo contador?',
        answer: 'Sí. FMG le entrega al contador información más ordenada y con menos tickets perdidos.',
      },
    ],
    ctaText: 'Empezar con mis CFDI',
    whatsappMessage: 'Hola, quiero ordenar la facturación CFDI de gastos de mi PyME.',
    priority: 0.8,
  },
  {
    slug: 'logistica-transporte',
    type: 'industry',
    title: 'Gastos para logística y transporte',
    metaTitle: 'Control de gastos y viáticos para logística y transporte',
    description: 'Controla tickets de gasolina, casetas, comidas y mantenimiento de operadores. FMG ayuda a ordenar gastos de transporte para el cierre mensual.',
    h1: 'Control de gastos para logística y transporte',
    eyebrow: 'Gasolina, casetas y viáticos bajo control',
    problem: 'En transporte, los gastos ocurren en ruta. Casetas, gasolina, comidas y mantenimiento se pagan lejos de oficina, y muchos tickets llegan tarde o nunca llegan.',
    solution: 'FMG permite que operadores manden recibos por WhatsApp y deja un paquete mensual ordenado por operador, unidad, ruta o negocio.',
    example: 'Un operador manda tickets de casetas y gasolina durante el viaje. FMG da seguimiento a facturas y separa lo pendiente antes del cierre.',
    bullets: [
      'Tickets de gasolina, casetas, alimentos y mantenimiento',
      'Orden por operador, ruta o unidad',
      'Seguimiento de CFDI faltantes',
      'Reporte mensual para administración y contador',
    ],
    faqs: [
      {
        question: '¿Sirve para operadores en ruta?',
        answer: 'Sí. WhatsApp reduce la fricción porque el operador solo manda foto del ticket.',
      },
      {
        question: '¿Puedo separar gastos por unidad?',
        answer: 'Sí. El orden puede adaptarse por unidad, operador o centro de costo.',
      },
      {
        question: '¿Qué pasa si no hay señal en carretera?',
        answer: 'El operador puede enviar el comprobante cuando tenga conexión; lo importante es capturarlo lo antes posible.',
      },
    ],
    ctaText: 'Ordenar gastos de transporte',
    whatsappMessage: 'Hola, quiero controlar gastos de logística y transporte con Factura Mis Gastos.',
    priority: 0.76,
  },
  {
    slug: 'ventas-en-campo',
    type: 'industry',
    title: 'Gastos para ventas en campo',
    metaTitle: 'Control de gastos para equipos de ventas en campo',
    description: 'Ordena gasolina, comidas, estacionamientos y visitas comerciales de vendedores en campo con captura simple por WhatsApp.',
    h1: 'Control de gastos para ventas en campo',
    eyebrow: 'Recibos de calle, reportes claros',
    problem: 'Los vendedores generan gastos pequeños durante visitas: gasolina, comidas, estacionamientos y traslados. Si se reportan tarde, se pierden tickets y contexto.',
    solution: 'FMG captura recibos por WhatsApp y los organiza por vendedor, cliente, ruta o mes para que administración revise sin perseguir comprobantes.',
    example: 'Un vendedor manda el ticket de gasolina al salir de una visita. El gasto queda asignado a su historial mensual.',
    bullets: [
      'Captura simple desde el celular del vendedor',
      'Orden por persona, ruta o cliente',
      'Estatus de recibos facturados y pendientes',
      'Menos tiempo administrativo al cierre',
    ],
    faqs: [
      {
        question: '¿Sirve para equipos comerciales pequeños?',
        answer: 'Sí. Es ideal para equipos que no necesitan un ERP, pero sí orden mensual.',
      },
      {
        question: '¿Puedo controlar gastos por vendedor?',
        answer: 'Sí. Ese es uno de los usos principales del servicio.',
      },
      {
        question: '¿Puedo usarlo sin política de gastos formal?',
        answer: 'Sí. FMG puede ser el primer paso para crear visibilidad antes de formalizar reglas.',
      },
    ],
    ctaText: 'Controlar ventas en campo',
    whatsappMessage: 'Hola, quiero controlar gastos de mi equipo de ventas en campo.',
    priority: 0.74,
  },
  {
    slug: 'construccion',
    type: 'industry',
    title: 'Gastos para construcción',
    metaTitle: 'Control de gastos para obras y empresas de construcción',
    description: 'Ordena tickets de materiales, herramientas, traslados y gastos por obra. FMG ayuda a controlar comprobantes dispersos en construcción.',
    h1: 'Control de gastos para obras y construcción',
    eyebrow: 'Materiales, herramientas y tickets por obra',
    problem: 'En construcción, las compras urgentes son normales. Materiales, herramientas, traslados y comidas se pagan rápido, pero la factura queda para después.',
    solution: 'FMG captura recibos por WhatsApp y permite ordenar comprobantes por obra, encargado o proveedor para cerrar con mejor evidencia.',
    example: 'El encargado de obra compra material faltante, manda el ticket y FMG lo deja asociado al mes y proyecto correspondiente.',
    bullets: [
      'Orden por obra, encargado o proveedor',
      'Seguimiento de tickets de materiales y herramientas',
      'Control de gastos pequeños frecuentes',
      'Cierre mensual más claro para administración',
    ],
    faqs: [
      {
        question: '¿Se puede separar por obra?',
        answer: 'Sí. El orden por obra o proyecto es clave para empresas de construcción.',
      },
      {
        question: '¿Funciona para compras urgentes?',
        answer: 'Sí. La captura por WhatsApp ayuda justo cuando el gasto ocurre fuera de oficina.',
      },
      {
        question: '¿Ayuda a calcular rentabilidad por proyecto?',
        answer: 'Ayuda a tener comprobantes mejor clasificados; la rentabilidad final se calcula con tus costos completos.',
      },
    ],
    ctaText: 'Ordenar gastos de obra',
    whatsappMessage: 'Hola, quiero ordenar gastos de construcción por obra con Factura Mis Gastos.',
    priority: 0.72,
  },
  {
    slug: 'consultorias-agencias',
    type: 'industry',
    title: 'Gastos para consultorías y agencias',
    metaTitle: 'Control de gastos para consultorías y agencias',
    description: 'Ordena gastos por cliente, proyecto o equipo. FMG ayuda a consultorías y agencias a no perder comprobantes de operación.',
    h1: 'Control de gastos por cliente y proyecto',
    eyebrow: 'Consultorías, agencias y servicios profesionales',
    problem: 'En servicios profesionales, los gastos se mezclan entre clientes, reuniones, traslados, herramientas y eventos. Sin orden, cuesta saber qué corresponde a cada proyecto.',
    solution: 'FMG recibe comprobantes por WhatsApp y los organiza por persona, cliente o proyecto, dejando un cierre mensual útil para administración.',
    example: 'Una agencia puede separar comidas de producción, traslados a cliente y compras de proyecto sin depender de notas manuales al final del mes.',
    bullets: [
      'Orden por cliente, proyecto o integrante',
      'Captura rápida de gastos de reuniones y producción',
      'Corte mensual para administración',
      'Mejor visibilidad de costos operativos',
    ],
    faqs: [
      {
        question: '¿Puedo asignar un gasto a un cliente?',
        answer: 'Sí. El flujo puede incluir cliente, proyecto o centro de costo cuando se capture el recibo.',
      },
      {
        question: '¿Sirve para gastos de producción?',
        answer: 'Sí. FMG ayuda a que esos tickets no queden perdidos en chats o carpetas.',
      },
      {
        question: '¿Puedo empezar con pocos usuarios?',
        answer: 'Sí. Puedes probar con un primer lote de recibos y crecer si el flujo funciona.',
      },
    ],
    ctaText: 'Ordenar gastos por proyecto',
    whatsappMessage: 'Hola, quiero ordenar gastos por cliente o proyecto con Factura Mis Gastos.',
    priority: 0.7,
  },
  {
    slug: 'gimnasios-multisucursal',
    type: 'industry',
    title: 'Gastos para gimnasios y sucursales',
    metaTitle: 'Control de gastos para gimnasios y negocios multi-sucursal',
    description: 'Controla gastos de mantenimiento, insumos y compras por sucursal. FMG ayuda a ordenar tickets de operación en negocios con varias ubicaciones.',
    h1: 'Control de gastos para gimnasios y negocios multi-sucursal',
    eyebrow: 'Compras por sucursal sin caos mensual',
    problem: 'En una operación con sucursales, cada encargado compra insumos, mantenimiento o materiales. Sin proceso, los comprobantes se mezclan y dirección pierde visibilidad.',
    solution: 'FMG permite capturar tickets por WhatsApp y ordenarlos por sucursal, encargado o mes para preparar el cierre de gastos.',
    example: 'Una sucursal compra productos de limpieza y mantenimiento menor; el ticket se manda al momento y queda asociado a esa ubicación.',
    bullets: [
      'Orden por sucursal o encargado',
      'Gastos de mantenimiento, insumos y compras operativas',
      'Reporte mensual para dirección',
      'Menos fricción para equipos no administrativos',
    ],
    faqs: [
      {
        question: '¿Sirve para varias sucursales?',
        answer: 'Sí. El flujo puede organizar comprobantes por sucursal o negocio.',
      },
      {
        question: '¿Necesito capacitar mucho al equipo?',
        answer: 'No. La captura por WhatsApp está pensada para reducir capacitación.',
      },
      {
        question: '¿Puedo saber qué sucursal gasta más?',
        answer: 'Sí, si los comprobantes se capturan y clasifican por sucursal.',
      },
    ],
    ctaText: 'Controlar gastos por sucursal',
    whatsappMessage: 'Hola, quiero controlar gastos por sucursal con Factura Mis Gastos.',
    priority: 0.68,
  },
  {
    slug: 'servicios-profesionales',
    type: 'industry',
    title: 'Gastos para servicios profesionales',
    metaTitle: 'Control de gastos para despachos y servicios profesionales',
    description: 'Ordena recibos de traslados, comidas, herramientas y gastos administrativos para despachos y empresas de servicios profesionales.',
    h1: 'Control de gastos para servicios profesionales',
    eyebrow: 'Orden para equipos que operan con clientes',
    problem: 'Despachos, consultores y servicios técnicos suelen tener gastos pequeños y frecuentes que se mezclan entre clientes, visitas y operación interna.',
    solution: 'FMG captura comprobantes por WhatsApp y los organiza para que el cierre mensual sea más claro y útil para el contador.',
    example: 'Un consultor visita clientes durante la semana, manda recibos de comida y traslado, y el reporte mensual los separa por persona o proyecto.',
    bullets: [
      'Gastos por persona, cliente o proyecto',
      'Captura de recibos desde WhatsApp',
      'Seguimiento de CFDI faltantes',
      'Paquete mensual para contador',
    ],
    faqs: [
      {
        question: '¿Sirve para despachos chicos?',
        answer: 'Sí. No necesitas una implementación compleja para empezar a ordenar recibos.',
      },
      {
        question: '¿Puedo separar gastos internos y de clientes?',
        answer: 'Sí. La clasificación puede adaptarse a tu operación.',
      },
      {
        question: '¿Puedo probar antes de activar a todo el equipo?',
        answer: 'Sí. El plan de primer lote permite probar con tickets reales.',
      },
    ],
    ctaText: 'Ordenar gastos del despacho',
    whatsappMessage: 'Hola, quiero ordenar gastos de servicios profesionales con Factura Mis Gastos.',
    priority: 0.66,
  },
  {
    slug: 'fmg-vs-excel',
    type: 'comparison',
    title: 'FMG vs Excel',
    metaTitle: 'Factura Mis Gastos vs Excel para controlar recibos',
    description: 'Excel ayuda a registrar gastos, pero no persigue recibos ni solicita CFDI. Compara cuándo usar una hoja y cuándo activar FMG.',
    h1: 'Factura Mis Gastos vs Excel para controlar recibos',
    eyebrow: 'Comparativa práctica',
    problem: 'Excel puede servir para registrar datos, pero el problema real suele ocurrir antes: el ticket no llega, llega tarde o nadie pide la factura.',
    solution: 'FMG complementa o reemplaza la hoja manual capturando recibos por WhatsApp, dando seguimiento al CFDI y preparando el paquete mensual.',
    example: 'Si hoy una persona captura tickets cada viernes, FMG reduce la persecución porque el empleado manda el comprobante cuando ocurre el gasto.',
    bullets: [
      'Excel registra; FMG captura y da seguimiento',
      'Menos dependencia de captura manual',
      'Mejor trazabilidad de pendientes',
      'Salida lista para contador',
    ],
    faqs: [
      {
        question: '¿FMG elimina Excel completamente?',
        answer: 'No necesariamente. Puede entregar información ordenada que después se exporte o revise en hoja de cálculo.',
      },
      {
        question: '¿Cuándo basta Excel?',
        answer: 'Cuando hay pocos gastos, pocos usuarios y disciplina alta para pedir facturas a tiempo.',
      },
      {
        question: '¿Cuándo conviene FMG?',
        answer: 'Cuando hay varios empleados generando recibos y el cierre mensual ya consume tiempo o pierde comprobantes.',
      },
    ],
    ctaText: 'Comparar mi proceso',
    whatsappMessage: 'Hola, quiero comparar mi control en Excel contra Factura Mis Gastos.',
    priority: 0.62,
  },
  {
    slug: 'fmg-vs-contador',
    type: 'comparison',
    title: 'FMG vs contador',
    metaTitle: 'Factura Mis Gastos no sustituye a tu contador: lo ayuda',
    description: 'FMG ordena recibos y CFDI para que tu contador reciba mejor información. No sustituye la revisión fiscal profesional.',
    h1: 'FMG no sustituye a tu contador: lo ayuda',
    eyebrow: 'Comparativa sin prometer de más',
    problem: 'Muchos negocios mandan al contador fotos sueltas, tickets incompletos y comprobantes tarde. El contador termina limpiando el desorden en lugar de revisar.',
    solution: 'FMG opera antes del contador: captura, gestiona y ordena comprobantes para que la revisión fiscal llegue con mejor evidencia.',
    example: 'En vez de enviar 80 fotos al cierre, el contador recibe carpetas y reportes con facturados, pendientes y no facturables separados.',
    bullets: [
      'FMG ordena; el contador revisa y decide',
      'Menos persecución de comprobantes al cierre',
      'Mayor claridad de pendientes',
      'Mejor comunicación entre operación y contabilidad',
    ],
    faqs: [
      {
        question: '¿FMG reemplaza a mi contador?',
        answer: 'No. FMG prepara comprobantes y reportes; tu contador mantiene la revisión y criterio fiscal.',
      },
      {
        question: '¿Mi contador puede usar el reporte?',
        answer: 'Sí. La idea es entregarle un paquete mensual más claro.',
      },
      {
        question: '¿Sirve si mi contador ya pide facturas?',
        answer: 'Sí, porque FMG ayuda a que los recibos lleguen antes y mejor organizados.',
      },
    ],
    ctaText: 'Ayudar a mi contador',
    whatsappMessage: 'Hola, quiero ordenar mis recibos para ayudar a mi contador.',
    priority: 0.6,
  },
  {
    slug: 'preguntas-frecuentes',
    type: 'faq',
    title: 'Preguntas frecuentes',
    metaTitle: 'Preguntas frecuentes sobre Factura Mis Gastos',
    description: 'Respuestas directas sobre recibos, tickets, CFDI, deducciones, contadores, WhatsApp y control mensual de gastos con FMG.',
    h1: 'Preguntas frecuentes sobre Factura Mis Gastos',
    eyebrow: 'Respuestas claras para decidir',
    problem: 'Antes de activar un proceso de recibos y facturas, es normal tener dudas sobre impuestos, operación, WhatsApp, datos fiscales y el papel del contador.',
    solution: 'Esta página concentra respuestas prácticas para entender qué hace FMG, qué no hace y cómo empezar con tickets reales.',
    example: 'Si no sabes si tus tickets aplican, puedes mandar un primer recibo y revisamos el caso antes de activar un flujo mensual.',
    bullets: [
      'Qué hace y qué no hace FMG',
      'Cómo se manejan tickets no facturables',
      'Qué papel mantiene el contador',
      'Cómo empezar con un primer lote',
    ],
    faqs: [
      {
        question: '¿Qué es Factura Mis Gastos?',
        answer: 'Es un servicio mexicano para capturar recibos por WhatsApp, gestionar CFDI cuando aplica y ordenar el cierre mensual para contador.',
      },
      {
        question: '¿Cuánto cuesta Factura Mis Gastos?',
        answer: 'Los planes actuales son Primer lote de recibos por $999 MXN/mes, FMG Recibo a Factura por $1,499 MXN/mes y FMG Empresa desde $2,499 MXN/mes.',
      },
      {
        question: '¿FMG sustituye a mi contador?',
        answer: 'No. FMG ayuda a ordenar comprobantes para que tu contador revise con mejor información.',
      },
      {
        question: '¿Qué pasa si un proveedor no emite factura?',
        answer: 'El recibo se marca como pendiente o no facturable según el caso, para que no quede perdido dentro del paquete mensual.',
      },
      {
        question: '¿Puedo usarlo solo para probar?',
        answer: 'Sí. Puedes iniciar con un primer lote de recibos reales para validar si el flujo aplica a tu negocio.',
      },
    ],
    ctaText: 'Resolver mi caso por WhatsApp',
    whatsappMessage: 'Hola, tengo dudas sobre Factura Mis Gastos y quiero revisar mi caso.',
    priority: 0.64,
  },
];

export const blogArticles: BlogArticle[] = [
  {
    slug: 'caso-exito-logistica',
    title: 'Caso de éxito: empresa de logística recupera control de sus deducciones',
    description: 'Cómo una empresa de logística redujo tickets perdidos y ordenó gastos de operadores con un flujo de recibos por WhatsApp.',
    date: '2026-01-28',
    readTime: '5 min',
    category: 'Casos de éxito',
    content: `
## El desafío

Una empresa de logística con operadores en ruta perdía tickets de gasolina, casetas y alimentos todos los meses. El problema no era solo contable: administración no tenía visibilidad completa de qué gasto pertenecía a qué operador o ruta.

## El proceso aplicado

1. Los operadores mandan foto del ticket por WhatsApp.
2. FMG registra el comprobante y da seguimiento al CFDI.
3. Los gastos se ordenan por mes y responsable.
4. El contador recibe un paquete más claro para revisar.

## Resultado esperado

Menos tickets perdidos, menos persecución al cierre y mejor evidencia para decidir qué puede revisar el contador como gasto de operación.
`,
  },
  {
    slug: 'guia-viaticos-empleados',
    title: 'Cómo gestionar viáticos de empleados sin perder deducciones',
    description: 'Guía práctica para controlar hoteles, taxis, gasolina, comidas y casetas sin perseguir tickets al cierre mensual.',
    date: '2026-01-25',
    readTime: '7 min',
    category: 'Guías prácticas',
    content: `
## El problema de los viáticos

Los viáticos ocurren fuera de oficina. El empleado paga, guarda el ticket y muchas veces lo manda tarde. Cuando administración lo pide, el viaje ya terminó y el proveedor ya no siempre responde igual.

## Qué gastos conviene capturar

- Hoteles
- Taxis y transporte
- Gasolina
- Casetas
- Comidas
- Estacionamientos

## Proceso recomendado

El empleado debe mandar el ticket por WhatsApp en cuanto ocurre el gasto. Después, el equipo administrativo puede revisar si falta información fiscal, si se solicitó CFDI y si el gasto corresponde al viaje.

## Cómo ayuda FMG

FMG recibe el comprobante, da seguimiento a la factura y entrega un corte mensual ordenado para que el contador revise con mejor información.
`,
  },
  {
    slug: '5-senales-control-gastos',
    title: '5 señales de que tu empresa necesita un sistema de control de gastos',
    description: 'Identifica si tu empresa está perdiendo tiempo, visibilidad y comprobantes por no tener un proceso claro de recibos.',
    date: '2026-01-20',
    readTime: '4 min',
    category: 'Diagnóstico',
    content: `
## Señal 1: los recibos llegan tarde

Si los tickets aparecen hasta el cierre, el proceso ya está trabajando contra reloj.

## Señal 2: no sabes quién gastó qué

Tener el total mensual no basta. Dirección necesita saber persona, área, sucursal o proyecto.

## Señal 3: todo depende del contador

El contador debería revisar, no perseguir fotos sueltas.

## Señal 4: no hay estatus de pendientes

Si nadie sabe qué tickets ya tienen CFDI y cuáles faltan, el cierre se vuelve ambiguo.

## Señal 5: cada mes se repite el caos

Cuando el mismo problema aparece en cada cierre, ya no es una excepción: es falta de proceso.
`,
  },
  {
    slug: 'ticket-no-se-puede-facturar',
    title: 'Qué hacer si un ticket no se puede facturar',
    description: 'No todos los tickets terminan en CFDI. Aprende cómo documentarlos, marcarlos y evitar que contaminen tu cierre mensual.',
    date: '2026-05-25',
    readTime: '5 min',
    category: 'CFDI',
    content: `
## No todo ticket se convierte en CFDI

Algunos recibos no tienen datos suficientes, fueron emitidos por proveedores sin proceso claro o llegan demasiado tarde. El error común es mezclarlos con los comprobantes correctos.

## Qué hacer

1. Guardar foto del ticket.
2. Identificar proveedor y fecha.
3. Intentar solicitar CFDI.
4. Marcar el resultado: facturado, pendiente o no facturable.
5. Entregar el caso al contador con contexto.

## Por qué importa

Un ticket no facturable también necesita orden. Si queda perdido en WhatsApp, nadie sabe si se revisó o no.
`,
  },
  {
    slug: 'evitar-perder-deducciones-recibos',
    title: 'Cómo evitar perder deducciones por recibos olvidados',
    description: 'La clave no es solo pedir facturas: es capturar el recibo a tiempo y dar seguimiento antes del cierre mensual.',
    date: '2026-05-25',
    readTime: '6 min',
    category: 'Deducciones',
    content: `
## El gasto ya ocurrió

Cuando una empresa pierde una deducción por falta de comprobante, no es porque el gasto no exista. Es porque el proceso falló.

## Dónde se pierden los recibos

- Bolsillos
- Fotos personales
- Chats con encargados
- Correos no reenviados
- Tickets enviados después del cierre

## Solución práctica

Define un canal único para capturar recibos. WhatsApp funciona porque el equipo ya lo usa y reduce la fricción.
`,
  },
  {
    slug: 'controlar-gastos-sin-excel',
    title: 'Cómo controlar gastos de empleados sin depender de Excel',
    description: 'Excel puede registrar gastos, pero no resuelve la captura ni el seguimiento de CFDI. Este es el flujo recomendado.',
    date: '2026-05-25',
    readTime: '5 min',
    category: 'Operación',
    content: `
## Excel no es el problema

Excel es útil para ordenar datos. El problema es que muchos datos nunca llegan completos.

## Antes de la hoja está el recibo

Si el empleado no manda el ticket, si nadie pide CFDI o si no hay estatus de seguimiento, ninguna hoja salva el cierre.

## El flujo correcto

Captura primero. Seguimiento después. Reporte al final.
`,
  },
  {
    slug: 'datos-necesita-ticket-cfdi',
    title: 'Qué datos necesita un ticket para pedir CFDI',
    description: 'Datos básicos que ayudan a solicitar factura: proveedor, fecha, monto, concepto y datos fiscales correctos.',
    date: '2026-05-25',
    readTime: '4 min',
    category: 'CFDI',
    content: `
## Datos mínimos útiles

Para pedir factura normalmente ayuda tener proveedor, fecha, monto, concepto y datos fiscales correctos de la empresa.

## Qué revisar en el ticket

- Nombre comercial o razón social del proveedor
- Fecha y hora
- Monto total
- Folio o referencia
- Medio de contacto o portal de facturación

## Qué pasa si falta algo

El comprobante puede quedar en seguimiento. Lo importante es detectarlo temprano.
`,
  },
  {
    slug: 'organizar-gastos-mensuales-contador',
    title: 'Cómo organizar gastos mensuales para el contador',
    description: 'Un buen cierre mensual separa facturados, pendientes y no facturables para que el contador revise sin perseguir comprobantes.',
    date: '2026-05-25',
    readTime: '6 min',
    category: 'Contabilidad',
    content: `
## El contador necesita contexto

Mandar una carpeta con fotos sueltas no es un cierre. Un cierre útil separa comprobantes por mes, persona, proveedor y estatus.

## Estructura recomendada

- Facturados
- Pendientes de CFDI
- No facturables
- Dudas para revisión
- Reporte resumen

## Beneficio

El contador usa más tiempo en revisar y menos en reconstruir la operación.
`,
  },
  {
    slug: 'errores-comunes-viaticos',
    title: 'Errores comunes en viáticos de empleados',
    description: 'Los errores más comunes al controlar viáticos: tickets tardíos, gastos sin responsable y facturas solicitadas fuera de tiempo.',
    date: '2026-05-25',
    readTime: '5 min',
    category: 'Viáticos',
    content: `
## Error 1: esperar al regreso

Si el empleado manda todo al final del viaje, varios tickets ya pueden estar perdidos.

## Error 2: no separar por viaje

Mezclar todos los tickets del mes dificulta entender qué gasto corresponde a qué salida.

## Error 3: no marcar pendientes

Un ticket sin CFDI necesita estatus. Si no, se vuelve ruido en el cierre.
`,
  },
  {
    slug: 'whatsapp-captura-recibos',
    title: 'WhatsApp como sistema de captura de recibos',
    description: 'Por qué WhatsApp puede ser el canal más práctico para capturar recibos de equipos en campo y sucursales.',
    date: '2026-05-25',
    readTime: '5 min',
    category: 'WhatsApp',
    content: `
## La mejor herramienta es la que el equipo sí usa

Muchas empresas fallan al imponer software que el equipo no abre. WhatsApp reduce esa barrera.

## Qué debe pasar después del mensaje

La captura por WhatsApp solo funciona si hay seguimiento: clasificar, solicitar CFDI, marcar pendientes y entregar reporte.

## Cuándo funciona mejor

Equipos en campo, sucursales, operadores, vendedores y negocios con compras frecuentes fuera de oficina.
`,
  },
];

export function getLandingPage(slug: string) {
  return landingPages.find((page) => page.slug === slug);
}

export function getBlogArticle(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}

