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

✅ Captura fácil (WhatsApp, correo, app)
✅ Validación automática de CFDI
✅ Reglas de aprobación
✅ Reportes en tiempo real
✅ Integración contable
✅ Soporte en español

---

## Factura Mis Gastos: La Solución Simple

Tu equipo manda recibo → Nosotros gestionamos factura → Tú recibes reportes claros

Sin apps complicadas. Sin capacitaciones largas. Solo WhatsApp.
    `,
  },
};

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];
  if (!article) return { title: 'Artículo no encontrado' };
  return {
    title: `${article.title} | Blog Factura Mis Gastos`,
    description: article.content.substring(0, 160),
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];
  
  if (!article) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <Link href="/blog" className="text-blue-600 hover:underline">← Volver al blog</Link>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded">{article.category}</span>
              <span className="text-sm text-gray-500">{article.readTime} de lectura</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            
            <p className="text-gray-500 mb-8">
              {new Date(article.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>').replace(/## /g, '</p><h2>').replace(/### /g, '</p><h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
            
            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">¿Listo para optimizar tus gastos?</h3>
              <p className="text-gray-700 mb-4">Agenda una llamada de 15 minutos y te mostramos cómo funciona.</p>
              <Link href="/comenzar" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
                Agendar Llamada
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
