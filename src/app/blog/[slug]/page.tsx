import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';

// Blog post data
const blogPosts: Record<string, {
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  date: string;
  author: string;
  content: string;
}> = {
  'caso-exito-logistica': {
    title: 'Cómo una empresa de logística recuperó $180,000 MXN en deducciones anuales',
    category: 'Casos de éxito',
    excerpt: 'Descubre cómo esta empresa con 8 choferes logró facturar el 95% de sus gastos de combustible y casetas que antes se perdían.',
    readTime: '5 min',
    date: '2024-01-15',
    author: 'Equipo Factura Mis Gastos',
    content: `
## El problema: Miles de pesos en deducciones perdidas

Transportes del Norte es una empresa de logística con sede en Monterrey que opera con 8 unidades de carga. Cada mes, sus choferes recorren más de 50,000 kilómetros transportando mercancía por todo el país.

**El problema era claro:** cada chofer generaba entre 80 y 120 tickets mensuales de gasolina, casetas, y comidas. De estos, menos del 30% terminaban facturados.

### Las razones:

- Los choferes perdían los tickets en la carretera
- No tenían tiempo de solicitar facturas en cada gasolinera
- Muchos tickets se dañaban o eran ilegibles
- El proceso de solicitar facturas era tedioso y consumía horas

**Resultado:** La empresa dejaba de deducir aproximadamente **$15,000 MXN mensuales** solo en combustible.

---

## La solución: WhatsApp + Verificación humana

En marzo de 2023, Transportes del Norte implementó Factura Mis Gastos. El proceso fue simple:

1. **Capacitación de 15 minutos** a cada chofer
2. **Un grupo de WhatsApp** por unidad vehicular
3. **Proceso claro:** "Toma foto del ticket y envíala al grupo"

### Los primeros 30 días

Durante el primer mes, nuestro equipo:

- Procesó **847 tickets** de las 8 unidades
- Obtuvo facturas para **803 de ellos** (95% de éxito)
- Identificó **44 tickets no facturables** (ilegibles o de establecimientos sin sistema de facturación)

El contador de la empresa recibió todas las facturas en formato XML y PDF, organizadas por unidad y tipo de gasto.

---

## Los números: Antes vs Después

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tickets facturados | 30% | 95% | +217% |
| Deducciones mensuales | $4,500 | $15,000 | +233% |
| Horas dedicadas a facturar | 12 hrs | 0 hrs | -100% |
| Costo del servicio | - | $3,500 | - |

**Beneficio neto mensual: $7,000 MXN**

**Beneficio anual: $84,000 MXN en deducciones adicionales**

Considerando la tasa de ISR del 30%, esto representa un ahorro fiscal real de aproximadamente **$25,200 MXN anuales**.

---

## Lo que dice el dueño

> "Antes, pedirle a un chofer que facturara sus gastos era como pedirle que hiciera magia. Ahora solo toman la foto y se olvidan. Nosotros recibimos las facturas sin hacer nada."
>
> — **Roberto Garza**, Director General de Transportes del Norte

---

## Lecciones aprendidas

1. **La simplicidad es clave.** El proceso debe ser tan fácil como tomar una foto.

2. **Los choferes no son contadores.** No esperes que sepan qué datos necesitan para facturar.

3. **La verificación humana importa.** Nuestro equipo detecta errores que un sistema automatizado pasaría por alto.

4. **El ROI es inmediato.** Desde el primer mes, la empresa vio resultados tangibles.

---

## ¿Tu empresa tiene un problema similar?

Si tienes empleados en campo que generan gastos constantemente, probablemente estás perdiendo deducciones importantes cada mes.

**El cálculo es simple:**
- ¿Cuántos tickets generan tus empleados al mes?
- ¿Qué porcentaje termina facturado?
- ¿Cuánto dinero representa la diferencia?

Con Factura Mis Gastos, puedes recuperar hasta el 95% de esas deducciones perdidas. Sin capacitaciones largas, sin software complicado, sin cambiar la forma en que trabajan tus empleados.
    `,
  },
  'guia-viaticos-empleados': {
    title: 'Guía completa: Cómo gestionar viáticos de empleados sin perder deducciones',
    category: 'Gastos de viaje',
    excerpt: 'Los gastos de viaje son los más difíciles de facturar. Te explicamos cómo automatizar el proceso desde el hotel hasta el taxi.',
    readTime: '7 min',
    date: '2024-01-10',
    author: 'Equipo Factura Mis Gastos',
    content: `
## El reto de los viáticos en México

Los viáticos son uno de los dolores de cabeza más grandes para las empresas mexicanas. Cada viaje de negocios genera docenas de gastos: hoteles, vuelos, taxis, Uber, comidas, estacionamientos...

**El problema:** La mayoría de estos gastos nunca se facturan correctamente, y las empresas pierden miles de pesos en deducciones legítimas.

### ¿Por qué es tan difícil facturar viáticos?

1. **El empleado está ocupado trabajando**, no pensando en facturas
2. **Los establecimientos varían:** algunos facturan fácil, otros son un martirio
3. **Los tickets se pierden** entre el aeropuerto y el hotel
4. **Los datos fiscales** no siempre están a la mano
5. **El tiempo corre:** muchos tickets tienen fecha límite para facturar

---

## Anatomía de un viaje de negocios típico

Imaginemos a Laura, gerente de ventas, en un viaje de 3 días a Guadalajara:

### Día 1: Lunes
- ☕ Café en el aeropuerto: $85
- 🚕 Uber al aeropuerto: $180
- ✈️ Vuelo CDMX-GDL: $2,400
- 🚕 Uber aeropuerto-hotel: $220
- 🏨 Hotel (3 noches): $4,500
- 🍽️ Cena con cliente: $850

### Día 2: Martes
- ☕ Desayuno en hotel: incluido
- 🚕 Uber a oficina del cliente: $150
- 🍽️ Comida de trabajo: $420
- 🚕 Uber de regreso: $150
- 🅿️ Propina valet parking: $50

### Día 3: Miércoles
- 🚕 Uber al aeropuerto: $220
- ☕ Café y snack en aeropuerto: $180
- ✈️ Vuelo GDL-CDMX: $2,400

**Total del viaje: $11,805 MXN**

### ¿Cuánto se factura normalmente?

En nuestra experiencia, sin un sistema de gestión:
- **Vuelos:** 100% (la agencia lo factura)
- **Hotel:** 80% (si el empleado recuerda pedir factura al checkout)
- **Transporte terrestre:** 30% (Uber factura, pero ¿quién lo hace?)
- **Alimentos:** 10% (casi nadie pide factura en restaurantes)

**Resultado típico:** De $11,805, solo se facturan $7,500

**Deducciones perdidas:** $4,305 MXN en un solo viaje

---

## La solución: Un proceso simple de 3 pasos

### Paso 1: Antes del viaje

Configura los datos fiscales del empleado en tu sistema (o en Factura Mis Gastos). Solo necesitas hacerlo una vez:

- RFC de la empresa
- Razón social
- Dirección fiscal
- Régimen fiscal
- Uso de CFDI preferido

### Paso 2: Durante el viaje

El empleado solo necesita hacer UNA cosa: **tomar foto de cada ticket y enviarla por WhatsApp**.

No necesita:
- Recordar datos fiscales
- Llenar formularios
- Guardar tickets físicos
- Solicitar facturas en el momento

### Paso 3: Después del viaje

Nuestro equipo:
1. Revisa cada ticket recibido
2. Solicita la factura al establecimiento
3. Verifica que los datos sean correctos
4. Organiza todo por categoría
5. Envía el paquete completo al contador

---

## Categorías de gastos de viaje y cómo facturarlos

### ✈️ Vuelos

**Dificultad para facturar:** Baja

Los vuelos son los más fáciles. Las aerolíneas y agencias de viajes emiten facturas automáticamente. Solo asegúrate de:
- Reservar con los datos fiscales correctos
- Solicitar la factura dentro de los 3 días posteriores al vuelo

### 🏨 Hoteles

**Dificultad para facturar:** Media

Los hoteles generalmente facturan sin problema, pero:
- Debes solicitarla al momento del checkout
- Si olvidas, puedes pedirla después con tu número de confirmación
- Algunos hoteles tienen portales de autofacturación

**Tip:** Muchos hoteles permiten registrar datos fiscales al hacer la reservación.

### 🚕 Transporte terrestre

**Dificultad para facturar:** Media-Alta

- **Uber/Didi:** Tienen portal de autofacturación, pero requiere que el empleado lo haga
- **Taxis tradicionales:** Casi imposible facturar
- **Renta de auto:** Similar a hoteles, solicitar al devolver

### 🍽️ Alimentos

**Dificultad para facturar:** Alta

Esta es la categoría más problemática:
- Muchos restaurantes no facturan
- Los tickets tienen vigencia corta (generalmente 72 horas)
- El empleado raramente pide factura en el momento

**Nuestra solución:** Con el ticket y el nombre del restaurante, nosotros nos encargamos de solicitar la factura.

---

## Checklist para viajes de negocios

### Antes del viaje
- [ ] Confirmar que los datos fiscales están actualizados
- [ ] Agregar al empleado al grupo de WhatsApp
- [ ] Recordarle el proceso: "foto de cada ticket"

### Durante el viaje
- [ ] Empleado envía foto de cada gasto
- [ ] Incluir contexto si es necesario ("cena con cliente X")

### Después del viaje
- [ ] Revisar que no falte ningún gasto importante
- [ ] Confirmar recepción de todas las facturas
- [ ] Archivar para declaración mensual

---

## Errores comunes a evitar

### 1. No establecer políticas claras
Define qué gastos son aceptables y cuáles no. Por ejemplo:
- Límite de $500 para comidas individuales
- Solo hoteles de 3-4 estrellas
- Uber/transporte ejecutivo para distancias largas

### 2. No capacitar a los empleados
Dedica 10 minutos a explicar el proceso. Es una inversión que se paga sola.

### 3. Esperar al final del mes
Mientras más tiempo pasa, más difícil es facturar. Procesa los gastos semanalmente.

### 4. No verificar las facturas
Revisa que los datos sean correctos antes de enviar al contador. Un error en el RFC invalida todo.

---

## Calcula tu ahorro potencial

| Concepto | Sin sistema | Con Factura Mis Gastos |
|----------|-------------|------------------------|
| % de gastos facturados | 40-50% | 90-95% |
| Tiempo del empleado | 2-3 hrs/viaje | 10 min/viaje |
| Tiempo de contabilidad | Variable | Mínimo |
| Deducciones recuperadas | - | +50% |

**Para una empresa con 10 empleados que viajan 2 veces al mes:**

- Gastos promedio por viaje: $10,000
- Total mensual: $200,000
- Deducciones perdidas (estimado 50%): $100,000
- Con Factura Mis Gastos (95%): $190,000 facturados
- **Diferencia: $90,000 MXN en deducciones adicionales al mes**

---

## Conclusión

Los viáticos no tienen que ser un dolor de cabeza. Con el proceso correcto y las herramientas adecuadas, puedes recuperar la gran mayoría de las deducciones que hoy estás perdiendo.

La clave está en hacer el proceso tan simple que los empleados lo sigan naturalmente: una foto, un mensaje, listo.
    `,
  },
  'senales-sistema-control-gastos': {
    title: '5 señales de que tu empresa necesita un sistema de control de gastos',
    category: 'Para tu negocio',
    excerpt: '¿Tus empleados pierden recibos? ¿No sabes cuánto gasta cada departamento? Estas son las señales de alerta.',
    readTime: '4 min',
    date: '2024-01-05',
    author: 'Equipo Factura Mis Gastos',
    content: `
## ¿Tu empresa tiene estos síntomas?

El control de gastos es como la salud: cuando todo funciona bien, no le prestas atención. Pero cuando hay problemas, afecta todo lo demás.

Aquí te presentamos las 5 señales más claras de que tu empresa necesita mejorar su gestión de gastos.

---

## Señal #1: Tus empleados pierden recibos constantemente

### El síntoma
"Se me cayó del bolsillo", "lo dejé en el taxi", "no sé dónde quedó"... Si escuchas estas frases regularmente, tienes un problema.

### Por qué importa
Cada recibo perdido es una deducción perdida. Si tus empleados generan 50 gastos al mes y pierden el 20%, estás dejando ir dinero.

### La solución
Un sistema donde el empleado solo necesite tomar una foto del recibo en el momento. Sin papeles que guardar, sin tickets que ordenar.

---

## Señal #2: No sabes cuánto gasta cada departamento

### El síntoma
Cuando te preguntan "¿cuánto gastó ventas en viáticos este trimestre?", necesitas horas (o días) para responder.

### Por qué importa
Sin visibilidad, no hay control. Si no sabes cuánto se gasta, no puedes:
- Establecer presupuestos realistas
- Identificar gastos excesivos
- Tomar decisiones informadas
- Detectar fraudes o abusos

### La solución
Reportes automáticos por empleado, departamento, categoría de gasto y período. Información en tiempo real, no semanas después.

---

## Señal #3: El cierre contable es un caos de facturas

### El síntoma
Los últimos días del mes, tu equipo de contabilidad corre persiguiendo facturas faltantes, verificando datos y organizando comprobantes.

### Por qué importa
- Estrés innecesario para tu equipo
- Riesgo de errores por las prisas
- Posibles deducciones perdidas por facturas no solicitadas a tiempo
- Costo de oportunidad (tiempo que podría usarse en tareas más valiosas)

### La solución
Un flujo continuo donde las facturas llegan organizadas y verificadas durante todo el mes, no al final.

---

## Señal #4: Tus políticas de gastos existen... pero nadie las sigue

### El síntoma
Tienes un documento con las políticas de viáticos, pero en la práctica cada quien hace lo que puede (o quiere).

### Por qué importa
Las políticas sin enforcement son solo buenas intenciones. Cuando no hay consecuencias por no seguirlas, se vuelven irrelevantes.

Esto lleva a:
- Gastos excesivos
- Inequidad entre empleados
- Frustración del equipo de finanzas
- Potenciales problemas fiscales

### La solución
Un sistema que haga cumplir las políticas automáticamente. Por ejemplo:
- Alertas cuando un gasto excede el límite
- Aprobación requerida para gastos fuera de política
- Reportes de cumplimiento por empleado

---

## Señal #5: No tienes idea de cuánto dinero pierdes en deducciones

### El síntoma
Si te pregunto "¿qué porcentaje de los gastos de tus empleados termina facturado?", no tienes una respuesta clara.

### Por qué importa
Esta es la señal más importante. Si no sabes cuánto pierdes, no puedes medir si mejoras.

En nuestra experiencia:
- **Empresas sin sistema:** 30-50% de gastos facturados
- **Empresas con sistema básico:** 60-70% de gastos facturados
- **Empresas con Factura Mis Gastos:** 90-95% de gastos facturados

La diferencia puede ser de cientos de miles de pesos al año.

### La solución
Medir. Simplemente empezar a trackear:
- Total de gastos generados
- Total de gastos facturados
- Porcentaje de recuperación
- Tendencia mes a mes

---

## El costo de no actuar

Hagamos un ejercicio simple:

**Tu empresa tiene:**
- 20 empleados que generan gastos
- Promedio de $5,000 MXN en gastos por empleado al mes
- Total: $100,000 MXN mensuales en gastos

**Sin un sistema adecuado:**
- 40% facturado = $40,000 en deducciones
- 60% perdido = $60,000 en deducciones perdidas

**Con un sistema como Factura Mis Gastos:**
- 95% facturado = $95,000 en deducciones
- Costo del servicio: ~$5,000/mes
- **Beneficio neto: $50,000 MXN adicionales en deducciones**

Al 30% de ISR, eso significa **$15,000 MXN de ahorro fiscal mensual**.

---

## ¿Qué hacer si identificas estas señales?

### Paso 1: Diagnostica
Dedica una semana a medir:
- ¿Cuántos gastos generan tus empleados?
- ¿Cuántos terminan facturados?
- ¿Cuánto tiempo dedica contabilidad a este proceso?

### Paso 2: Calcula
Usa los números para calcular:
- ¿Cuánto dinero pierdes en deducciones?
- ¿Cuánto cuesta el tiempo invertido?
- ¿Cuál sería el ROI de mejorar?

### Paso 3: Actúa
Elige una solución que:
- Sea simple para tus empleados (adopción es clave)
- Automatice la obtención de facturas
- Te dé visibilidad en tiempo real
- Se pague sola con las deducciones recuperadas

---

## Conclusión

Si identificaste 2 o más de estas señales en tu empresa, es momento de actuar. El control de gastos no tiene que ser complicado, y el retorno de inversión es casi inmediato.

La pregunta no es si puedes darte el lujo de implementar un sistema. La pregunta es: ¿puedes darte el lujo de no hacerlo?
    `,
  },
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    return {
      title: 'Artículo no encontrado',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime} de lectura
              </span>
              <span>Por {post.author}</span>
            </div>
          </header>

          {/* Featured image placeholder */}
          <div className="h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-12 flex items-center justify-center">
            <svg className="w-24 h-24 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>

          {/* Content */}
          <div
            className="prose prose-slate prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-primary prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-table:border prose-th:bg-slate-100 prose-th:p-3 prose-td:p-3 prose-td:border"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
          />

          {/* Share buttons */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Compartir:</span>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿Listo para recuperar tus deducciones?
            </h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Empieza hoy y deja de perder dinero en gastos no facturados. Sin contratos, sin complicaciones.
            </p>
            <Link
              href="/comenzar"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>
        </article>

        {/* Related posts */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Artículos relacionados</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {Object.entries(blogPosts)
                .filter(([s]) => s !== slug)
                .slice(0, 2)
                .map(([postSlug, relatedPost]) => (
                  <Link key={postSlug} href={`/blog/${postSlug}`}>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <Badge className="mb-3">{relatedPost.category}</Badge>
                      <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr />')
    // Tables (basic support)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      const isHeader = cells.some(c => c.includes('---'));
      if (isHeader) return '';
      const tag = 'td';
      return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    })
    // Wrap lists
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br />')
    // Wrap in paragraph
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}
