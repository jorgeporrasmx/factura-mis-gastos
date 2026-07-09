import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mismo número de contacto que usa el resto del sitio (WhatsAppWidget).
const WHATSAPP_NUMBER = '5216144273301';
const reconciliationWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hola, me interesa el servicio de conciliación automática de facturas contra movimientos bancarios. ¿Podemos agendar una llamada para cotizar un proyecto a la medida?'
)}`;

// Las cuatro llaves de coincidencia, de la más fuerte a la más flexible.
const matchKeys = [
  {
    number: '01',
    strength: 'Match perfecto',
    title: 'Referencia exacta',
    description:
      'El folio bancario capturado en la factura amarra ambos mundos. Coincidencia uno a uno, sin margen de error.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    number: '02',
    strength: 'Fiscalmente correcto',
    title: 'Complemento de pago (REP)',
    description:
      'Lee el complemento fiscal del SAT y suma abonos hasta cubrir el total de la factura. Conciliación que resiste una auditoría.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    number: '03',
    strength: 'Tolerante',
    title: 'Monto + fecha',
    description:
      'Cuando no hay referencia ni complemento, cuadra por importe dentro de una ventana de días configurable.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    number: '04',
    strength: 'Más flexible',
    title: 'Clasificación inteligente',
    description:
      'Separa los pagos con tarjeta y en efectivo para que no ensucien tus pendientes reales.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
];

// Etiquetas de resultado, coherentes con la paleta del sitio.
const resultLabels = [
  { label: 'Conciliado', className: 'bg-green-100 text-green-700' },
  { label: 'Conciliado por complemento', className: 'bg-blue-100 text-primary' },
  { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  { label: 'Tarjeta', className: 'bg-violet-100 text-violet-700' },
  { label: 'Efectivo', className: 'bg-slate-100 text-slate-600' },
];

const benefits = [
  {
    title: 'De días a instantáneo',
    description: 'Lo que tomaba jornadas de trabajo manual queda resuelto en tiempo real.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Se actualiza solo',
    description: 'Cada nueva factura y cada movimiento se preguntan solos con quién coinciden.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    title: 'Apoyado en el documento oficial',
    description: 'La conciliación se sostiene en el complemento de pago del SAT, no en una hoja aparte.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: 'Escala sin esfuerzo',
    description: 'Funciona igual con 100 movimientos que con 10,000. El volumen deja de ser un problema.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'De hoja pasiva a tablero',
    description: 'Convierte un Excel muerto en un tablero de control de flujo que muestra lo que falta.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
];

/**
 * Diagrama de las cuatro llaves en cascada: factura y banco a los lados,
 * las llaves como filtros en secuencia en medio, resultado etiquetado a la salida.
 */
function CascadeDiagram() {
  return (
    <svg
      viewBox="0 0 820 420"
      className="w-full h-auto"
      role="img"
      aria-labelledby="cascade-title cascade-desc"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="cascade-title">Diagrama de conciliación en cascada</title>
      <desc id="cascade-desc">
        La factura y el movimiento bancario entran por los lados y pasan en secuencia por cuatro
        llaves de coincidencia (referencia exacta, complemento de pago, monto más fecha y
        clasificación inteligente) hasta salir etiquetados como conciliados o pendientes.
      </desc>

      {/* Fuente: Factura (izquierda) */}
      <g>
        <rect x="20" y="40" width="150" height="72" rx="12" fill="#dbeafe" />
        <text x="95" y="72" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1e40af">
          Factura
        </text>
        <text x="95" y="93" textAnchor="middle" fontSize="12" fill="#1e40af">
          CFDI · mundo fiscal
        </text>
      </g>

      {/* Fuente: Banco (derecha) */}
      <g>
        <rect x="650" y="40" width="150" height="72" rx="12" fill="#e0e7ff" />
        <text x="725" y="72" textAnchor="middle" fontSize="16" fontWeight="700" fill="#3730a3">
          Banco
        </text>
        <text x="725" y="93" textAnchor="middle" fontSize="12" fill="#3730a3">
          movimientos reales
        </text>
      </g>

      {/* Conectores de las fuentes hacia el embudo */}
      <path d="M95 112 V150 Q95 170 200 170 H360" fill="none" stroke="#93c5fd" strokeWidth="2.5" />
      <path d="M725 112 V150 Q725 170 620 170 H460" fill="none" stroke="#a5b4fc" strokeWidth="2.5" />

      {/* Cuatro llaves como filtros en secuencia */}
      {[
        { y: 158, n: '01', label: 'Referencia exacta', fill: '#1e40af' },
        { y: 210, n: '02', label: 'Complemento de pago (REP)', fill: '#2563eb' },
        { y: 262, n: '03', label: 'Monto + fecha', fill: '#3b82f6' },
        { y: 314, n: '04', label: 'Clasificación inteligente', fill: '#60a5fa' },
      ].map((k) => (
        <g key={k.n}>
          <rect x="290" y={k.y} width="240" height="40" rx="20" fill={k.fill} />
          <circle cx="314" cy={k.y + 20} r="13" fill="#ffffff" />
          <text x="314" y={k.y + 24} textAnchor="middle" fontSize="12" fontWeight="700" fill={k.fill}>
            {k.n}
          </text>
          <text x="345" y={k.y + 25} fontSize="13" fontWeight="600" fill="#ffffff">
            {k.label}
          </text>
        </g>
      ))}

      {/* Flechas de cascada entre llaves */}
      {[198, 250, 302].map((y) => (
        <path
          key={y}
          d={`M410 ${y} l6 8 l6 -8`}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Salida etiquetada */}
      <path d="M410 354 V378 H410" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
      <g>
        <rect x="250" y="376" width="150" height="34" rx="17" fill="#dcfce7" />
        <text x="325" y="398" textAnchor="middle" fontSize="13" fontWeight="700" fill="#15803d">
          Conciliado
        </text>
      </g>
      <g>
        <rect x="418" y="376" width="150" height="34" rx="17" fill="#fef3c7" />
        <text x="493" y="398" textAnchor="middle" fontSize="13" fontWeight="700" fill="#b45309">
          Pendiente real
        </text>
      </g>
    </svg>
  );
}

/**
 * Antes / después: a la izquierda una maraña de líneas cruzando factura↔banco
 * a mano; a la derecha el mismo flujo resuelto y limpio con etiquetas de color.
 */
function BeforeAfterDiagram() {
  const rows = [64, 104, 144, 184, 224];
  return (
    <svg
      viewBox="0 0 820 320"
      className="w-full h-auto"
      role="img"
      aria-labelledby="ba-title ba-desc"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="ba-title">Comparación antes y después de la conciliación</title>
      <desc id="ba-desc">
        A la izquierda, la conciliación manual: facturas y movimientos bancarios unidos por líneas
        cruzadas y enredadas. A la derecha, el mismo flujo resuelto de forma ordenada, con cada
        pareja alineada y etiquetada por color.
      </desc>

      {/* ---- ANTES ---- */}
      <text x="180" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill="#64748b">
        Antes · a mano
      </text>
      {/* columnas de tarjetas */}
      {rows.map((y, i) => (
        <rect key={`bl-${i}`} x="24" y={y} width="120" height="26" rx="6" fill="#e2e8f0" />
      ))}
      {rows.map((y, i) => (
        <rect key={`br-${i}`} x="216" y={y} width="120" height="26" rx="6" fill="#e2e8f0" />
      ))}
      {/* maraña de líneas cruzadas */}
      <g stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.75" strokeLinecap="round">
        <path d="M144 77 C 190 90, 175 210, 216 237" />
        <path d="M144 117 C 195 130, 185 70, 216 77" />
        <path d="M144 157 C 190 150, 190 200, 216 197" />
        <path d="M144 197 C 185 190, 200 100, 216 117" />
        <path d="M144 237 C 190 230, 180 150, 216 157" />
      </g>

      {/* separador */}
      <line x1="410" y1="40" x2="410" y2="280" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 6" />

      {/* ---- DESPUÉS ---- */}
      <text x="620" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e40af">
        Después · automático
      </text>
      {(() => {
        const after = [
          { fill: '#dcfce7', stroke: '#22c55e' },
          { fill: '#dbeafe', stroke: '#3b82f6' },
          { fill: '#dcfce7', stroke: '#22c55e' },
          { fill: '#fef3c7', stroke: '#f59e0b' },
          { fill: '#ede9fe', stroke: '#8b5cf6' },
        ];
        return rows.map((y, i) => (
          <g key={`af-${i}`}>
            <rect x="474" y={y} width="120" height="26" rx="6" fill={after[i].fill} stroke={after[i].stroke} strokeWidth="1.5" />
            <line x1="594" y1={y + 13} x2="666" y2={y + 13} stroke={after[i].stroke} strokeWidth="2.5" />
            <rect x="666" y={y} width="120" height="26" rx="6" fill={after[i].fill} stroke={after[i].stroke} strokeWidth="1.5" />
            <circle cx="630" cy={y + 13} r="9" fill={after[i].stroke} />
            <path
              d={`M625.5 ${y + 13} l3 3 l6 -6`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ));
      })()}
    </svg>
  );
}

export function ReconciliationSection() {
  return (
    <section
      id="conciliacion"
      aria-label="Conciliación automática de facturas contra movimientos bancarios"
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-primary bg-blue-100 px-3 py-1 rounded-full mb-4">
            Proyecto a la medida
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Conciliación automática{' '}
            <span className="gradient-text">de facturas y banco.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un desarrollo a la medida que cuadra tu mundo fiscal con tus movimientos bancarios
            reales. No es una función del producto estándar: lo construimos para tu operación.
          </p>
        </div>

        {/* Problema / Solución */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="bg-slate-50 border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-500 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">El problema</h3>
              <p className="text-muted-foreground">
                Toda empresa debe cuadrar lo que facturó (CFDI, mundo fiscal) contra lo que
                realmente cobró o pagó (movimientos bancarios). Hacerlo a mano cuesta días de
                trabajo y acumula errores.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">La solución</h3>
              <p className="text-muted-foreground">
                Cada factura se pregunta sola <span className="font-medium text-foreground">«¿qué
                movimiento del banco me paga?»</span> y cada movimiento{' '}
                <span className="font-medium text-foreground">«¿qué factura estoy pagando?»</span>,
                en tiempo real.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Diagrama de cascada */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 shadow-sm">
            <CascadeDiagram />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Cada pareja pasa por las llaves en secuencia, de la más fuerte a la más flexible, hasta
            quedar etiquetada.
          </p>
        </div>

        {/* Las cuatro llaves de coincidencia */}
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Cuatro llaves de coincidencia
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            De la más fuerte a la más flexible. Si una no cierra, la siguiente lo intenta.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {matchKeys.map((key) => (
            <Card key={key.number} className="bg-white border border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white">
                    {key.icon}
                  </div>
                  <span className="text-xs font-bold text-primary bg-blue-100 px-2.5 py-1 rounded-full">
                    {key.number}
                  </span>
                </div>
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  {key.strength}
                </span>
                <h4 className="text-lg font-semibold text-foreground mb-2">{key.title}</h4>
                <p className="text-sm text-muted-foreground">{key.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resultado + antes/después */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                El resultado
              </h3>
              <p className="text-muted-foreground mb-5">
                Cada factura y cada movimiento quedan etiquetados. Lo{' '}
                <span className="font-medium text-foreground">«Pendiente»</span> deja de ser ruido y
                se vuelve una lista real de lo que falta.
              </p>
              <div className="flex flex-wrap gap-2">
                {resultLabels.map((r) => (
                  <span
                    key={r.label}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${r.className}`}
                  >
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 shadow-sm">
              <BeforeAfterDiagram />
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center text-primary">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center bg-blue-50 rounded-2xl p-8 sm:p-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            ¿Lo quieres para tu empresa?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Lo diseñamos alrededor de tus facturas, tus bancos y tus reglas. Agenda una llamada y te
            armamos una cotización.
          </p>
          <Button
            asChild
            size="lg"
            className="gradient-bg hover:opacity-90 transition-all text-base px-8 py-6 h-auto shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            <a href={reconciliationWhatsAppUrl} target="_blank" rel="noopener noreferrer">
              Agenda una llamada
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Disponible como proyecto a la medida.
          </p>
        </div>
      </div>
    </section>
  );
}
