import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const articles: Record<string, { title: string; content: string; date: string; readTime: string; category: string }> = {
  'caso-exito-logistica': {
    title: 'Caso de Éxito: Empresa de Logística Recupera $180,000 en Deducciones',
    date: '2026-01-28',
    readTime: '5 min',
    category: 'Casos de Éxito',
    content: `
## El Desafío

TransMex Logística, empresa con 25 empleados y operaciones en 5 estados, enfrentaba un problema común: **perdían entre 10-15% de deducciones potenciales** cada mes por mala gestión de comprobantes.

### Los síntomas:
- Operadores perdían tickets de casetas y gasolina
- Facturas solicitadas fuera de tiempo (después del cierre fiscal)
- Horas del equipo administrativo persiguiendo comprobantes
- Estrés cada fin de mes

## La Solución

Implementamos Factura Mis Gastos con un proceso simple:

1. **Capacitación de 15 minutos** a operadores
2. **Grupo de WhatsApp** donde envían fotos de tickets
3. **Nosotros gestionamos** solicitud de facturas
4. **Reportes semanales** automáticos

## Los Resultados (6 meses)

| Métrica | Antes | Después |
|---------|-------|---------|
| Tickets perdidos/mes | 45 | 3 |
| Deducciones perdidas | $30,000/mes | $2,500/mes |
| Horas admin/mes | 40 hrs | 5 hrs |
| **Ahorro anual** | - | **$180,000+** |

## Testimonio

> "Antes era un caos. Ahora los muchachos mandan la foto y se olvidan. Nosotros recibimos todo organizado."
>
> — María González, Directora Administrativa

## ¿Quieres resultados similares?

Agenda una llamada de 15 minutos para analizar tu situación.
    `,
  },
  'guia-viaticos-empleados': {
    title: 'Cómo Gestionar Viáticos de Empleados sin Perder Deducciones',
    date: '2026-01-25',
    readTime: '7 min',
    category: 'Guías Prácticas',
    content: `
## El Problema

Las empresas mexicanas pierden entre **5-15% de deducciones potenciales** por mala gestión de viáticos. ¿Te suena familiar?

- "Se me olvidó pedir factura"
- "Se me perdió el ticket"
- "Ya pasó el mes, no me la pueden dar"

## Gastos que Incluyen los Viáticos

- **Transporte:** Avión, autobús, gasolina, casetas, taxis, renta de auto
- **Hospedaje:** Hoteles, Airbnb (con factura)
- **Alimentación:** Restaurantes, cafeterías
- **Otros:** Estacionamiento, internet, materiales

## 5 Errores Comunes (y cómo evitarlos)

### 1. No pedir factura en el momento
**Solución:** Capacitar a empleados para solicitar SIEMPRE al pagar

### 2. Tickets que se pierden o borran
**Solución:** Fotografiar inmediatamente y enviar a sistema

### 3. Comprobantes inválidos
**Solución:** Verificar que sea CFDI 4.0 válido en el SAT

### 4. Sin políticas claras
**Solución:** Establecer montos máximos, proveedores autorizados, proceso de aprobación

### 5. Procesar todo al final del mes
**Solución:** Procesar gastos dentro de 48 hrs post-viaje

## El Proceso Ideal

### Antes del viaje:
- Aprobar viaje y presupuesto estimado
- Entregar anticipo si aplica
- Recordar políticas de gastos

### Durante el viaje:
- Registrar cada gasto en tiempo real
- Solicitar factura con RFC correcto

### Después del viaje:
- Conciliar gastos vs anticipo (48 hrs máximo)
- Verificar CFDIs en portal del SAT
- Generar reporte y procesar reembolso

## Tiempo que se Pierde (ejemplo: 10 empleados que viajan)

| Actividad | Tiempo |
|-----------|--------|
| Recopilar tickets | 30 min |
| Verificar CFDIs | 20 min |
| Capturar en sistema | 25 min |
| Solicitar facturas faltantes | 45 min |
| Generar reporte | 15 min |
| Conciliar | 20 min |
| **TOTAL por viaje** | **2.5 hrs** |

Con 2 viajes/mes por empleado = **50 horas mensuales**

## La Solución: Automatizar

Con Factura Mis Gastos, el proceso es:
1. Empleado envía foto del ticket por WhatsApp
2. Nosotros solicitamos la factura
3. Te entregamos reportes organizados

**Tiempo de tu equipo: 5 minutos por viaje**
    `,
  },
  '5-senales-control-gastos': {
    title: '5 Señales de que tu Empresa Necesita un Sistema de Control de Gastos',
    date: '2026-01-20',
    readTime: '4 min',
    category: 'Diagnóstico',
    content: `
## ¿Tu empresa tiene estos síntomas?

### Señal #1: Empleados pierden recibos constantemente

**Síntoma:** "Se me olvidó pedirla", "se me perdió el ticket"

**Costo:** 5 tickets de $500/mes × 10 empleados × 12 meses = **$300,000/año no deducibles**

### Señal #2: No sabes cuánto gasta cada empleado o departamento

**Síntoma:** Solo tienes el número total, no detalle por área

**Costo:** Sin visibilidad, no puedes detectar anomalías ni optimizar

### Señal #3: Dependes 100% de contabilidad para procesar gastos

**Síntoma:** Todo pasa por el contador; si no está, todo se detiene

**Costo:** Cuellos de botella, retrasos, errores por prisa al cierre

### Señal #4: Sorpresas con gastos no autorizados

**Síntoma:** "¿Quién autorizó este gasto de $15,000?" Nadie sabe.

**Costo:** Pérdida de control, políticas inútiles

### Señal #5: El cierre de mes es un caos

**Síntoma:** Carrera contra reloj buscando tickets, solicitando facturas tarde

**Costo:** Estrés, errores, información incompleta

---

## El Costo de No Tener Sistema

**Ejemplo: 15 empleados, 20 gastos c/u, 10% sin factura**

- 300 gastos mensuales
- 30 sin factura × $400 promedio
- **Pérdida mensual: $12,000**
- **Pérdida anual: $144,000**

---

## Tu Diagnóstico

- **1-2 señales:** Áreas de mejora, no urgente
- **3-4 señales:** Es momento de buscar solución
- **5 señales:** Estás perdiendo dinero cada día

---

## Qué Buscar en un Sistema

- Captura fácil (WhatsApp, correo, app)
- Validación automática de CFDI
- Reglas de aprobación
- Reportes en tiempo real
- Integración contable
- Soporte en español

---

## Factura Mis Gastos: La Solución Simple

Tu equipo manda recibo → Nosotros gestionamos factura → Tú recibes reportes claros

Sin apps complicadas. Sin capacitaciones largas. Solo WhatsApp.
    `,
  },
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s.,;:)!?]|$)/g, '$1<em>$2</em>');
}

function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  let paragraph: string[] = [];
  let inList = false;
  let listTag: 'ul' | 'ol' | null = null;
  let inBlockquote = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (inList && listTag) {
      out.push(`</${listTag}>`);
      inList = false;
      listTag = null;
    }
  };
  const closeBlockquote = () => {
    if (inBlockquote) {
      out.push('</blockquote>');
      inBlockquote = false;
    }
  };
  const closeAll = () => {
    flushParagraph();
    closeList();
    closeBlockquote();
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (line === '') {
      closeAll();
      i++;
      continue;
    }

    if (line === '---') {
      closeAll();
      out.push('<hr />');
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      closeAll();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      closeAll();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      closeList();
      if (!inBlockquote) {
        out.push('<blockquote>');
        inBlockquote = true;
      }
      const content = line.slice(2).trim();
      if (content !== '') {
        out.push(`<p>${inline(content)}</p>`);
      }
      i++;
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|') && lines[i + 1]) {
      const sep = lines[i + 1].trim();
      if (/^\|[\s:|-]+\|$/.test(sep) && sep.includes('-')) {
        closeAll();
        const headers = line.slice(1, -1).split('|').map((c) => c.trim());
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length) {
          const rowLine = lines[i].trim();
          if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break;
          rows.push(rowLine.slice(1, -1).split('|').map((c) => c.trim()));
          i++;
        }
        const thead = `<thead><tr>${headers.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody>`;
        out.push(`<div class="article-table-wrap"><table>${thead}${tbody}</table></div>`);
        continue;
      }
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      closeBlockquote();
      if (!inList || listTag !== 'ul') {
        closeList();
        out.push('<ul>');
        inList = true;
        listTag = 'ul';
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
      i++;
      continue;
    }

    const ol = line.match(/^(\d+)\.\s+(.+)/);
    if (ol) {
      flushParagraph();
      closeBlockquote();
      if (!inList || listTag !== 'ol') {
        closeList();
        out.push('<ol>');
        inList = true;
        listTag = 'ol';
      }
      out.push(`<li>${inline(ol[2])}</li>`);
      i++;
      continue;
    }

    closeList();
    closeBlockquote();
    paragraph.push(line);
    i++;
  }

  closeAll();
  return out.join('\n');
}

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];
  if (!article) return { title: 'Artículo no encontrado' };
  const plain = article.content.replace(/[#*>|`-]/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    title: `${article.title} | Blog Factura Mis Gastos`,
    description: plain.substring(0, 160),
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];

  if (!article) {
    notFound();
  }

  const html = renderMarkdown(article.content);

  return (
    <>
      <Header />

      <div aria-hidden="true" className="blog-fixed-bg">
        <div className="blog-fixed-bg__gradient" />
        <div className="blog-fixed-bg__blob blog-fixed-bg__blob--1" />
        <div className="blog-fixed-bg__blob blog-fixed-bg__blob--2" />
        <div className="blog-fixed-bg__blob blog-fixed-bg__blob--3" />
      </div>

      <main className="relative min-h-screen pt-24 pb-20 sm:pt-28">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
            >
              <span aria-hidden="true">←</span> Volver al blog
            </Link>
          </div>

          <div className="article-card">
            <header className="mb-8 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-5 flex-wrap text-sm">
                <span className="font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  {article.category}
                </span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <time className="text-slate-600" dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span className="text-slate-600">{article.readTime} de lectura</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                {article.title}
              </h1>
            </header>

            <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                ¿Listo para optimizar tus gastos?
              </h2>
              <p className="text-slate-700 mb-5">
                Agenda una llamada de 15 minutos y te mostramos cómo funciona.
              </p>
              <Link
                href="/comenzar"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Agendar Llamada
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
