# Factura Mis Gastos — MVP piloto comercial

## Objetivo vendible hoy

Vender Factura Mis Gastos como piloto asistido para empresas mexicanas que pierden deducciones por comprobantes desordenados.

Promesa comercial:

> Centralizamos los comprobantes de tus empleados, los ordenamos por persona, empresa y mes, y te entregamos un reporte mensual listo para revisar con tu contador.

## Qué sí incluye el MVP

- Onboarding asistido de la empresa.
- Captura/subida de comprobantes por usuario.
- Orden documental por persona/empresa/mes.
- Seguimiento básico de comprobantes recibidos.
- Reporte mensual operativo para revisión con contador.
- Soporte manual durante el piloto.
- Registro de leads desde la landing, con fallback en Firestore si Monday falla.

## Qué no incluye todavía

- Presentación automática de impuestos.
- Sustitución total del contador.
- Marketplace de contadores.
- Integración SAT.
- Pagos recurrentes automáticos.
- Conciliación contable avanzada.
- App móvil nativa.
- Automatización fiscal completa.

## Ofertas comerciales

### 1. Diagnóstico de deducciones perdidas — $999 MXN una vez

Para empresas que quieren saber dónde se les están perdiendo comprobantes.

Incluye:
- Mapeo del flujo actual de recibos/facturas.
- Identificación de fugas documentales.
- Checklist de mejora para equipo y contador.
- Recomendación de implementación.

### 2. Piloto FMG — $1,499 MXN/mes

Para validar el sistema con una operación pequeña.

Incluye:
- Hasta 3 usuarios.
- Hasta 100 comprobantes mensuales.
- Onboarding asistido.
- Orden por persona, empresa y mes.
- Reporte mensual listo para contador.
- Soporte operativo durante el piloto.

### 3. FMG Empresa — $2,499 MXN/mes

Para equipos con gastos recurrentes.

Incluye:
- Hasta 8 usuarios.
- Hasta 300 comprobantes mensuales.
- Reportes por persona.
- Carpeta documental ordenada.
- Seguimiento mensual de comprobantes faltantes.
- Paquete mensual para contador.

## Proceso de onboarding manual

1. Confirmar empresa, RFC, responsable y volumen mensual aproximado.
2. Crear o validar cuenta admin.
3. Crear empresa en el portal.
4. Verificar carpeta documental.
5. Invitar usuarios piloto.
6. Enviar instrucciones de uso:
   - subir recibo/factura,
   - identificar gasto,
   - revisar estado mensual.
7. Definir fecha de corte mensual.
8. Hacer primer corte manual asistido.
9. Entregar reporte mensual y aprendizajes.
10. Decidir si pasa a plan mensual, ajuste de flujo o baja.

## Checklist por cliente piloto

- [ ] Lead recibido en Monday o fallback Firestore.
- [ ] Responsable contactado.
- [ ] Dolor principal identificado.
- [ ] Plan propuesto.
- [ ] Pago manual/transferencia acordado.
- [ ] Empresa creada.
- [ ] Usuarios piloto definidos.
- [ ] Carpeta documental validada.
- [ ] Prueba de subida realizada.
- [ ] Primer comprobante visible en portal.
- [ ] Fecha de corte definida.
- [ ] Reporte mensual entregado.
- [ ] Feedback documentado.

## Riesgos técnicos actuales

- Google Drive puede depender de que el folder raíz exista y esté compartido con la service account. Si `/api/drive/status` falla por permisos o folder ID, el piloto debe operar con carpeta manual validada antes de onboarding.
- Pagos automáticos están fuera del MVP. Cobrar por transferencia/SPEI mientras se valida demanda.
- Monday debe ser canal principal de seguimiento de leads, pero el endpoint ya debe guardar fallback interno si Monday falla.
- No prometer cumplimiento fiscal autónomo hasta validar el flujo documental y definir alcance fiscal/legal.

## Entrega mensual al cliente

Formato mínimo:

- Total de comprobantes recibidos.
- Comprobantes por usuario.
- Comprobantes por mes.
- Observaciones de faltantes/incompletos.
- Liga a carpeta documental.
- Recomendaciones para el siguiente corte.

## Kit comercial

### WhatsApp corto

Hola, soy Jorge de Factura Mis Gastos. Estamos abriendo pilotos para empresas que pierden deducciones porque los recibos de empleados llegan tarde, incompletos o desordenados. FMG centraliza esos comprobantes y entrega un reporte mensual listo para revisar con tu contador. ¿Quieres que hagamos un diagnóstico rápido de tu flujo actual?

### Email corto

Asunto: Piloto para ordenar comprobantes y recuperar deducciones

Hola, {{nombre}}.

Estamos lanzando un piloto de Factura Mis Gastos para empresas que manejan gastos de empleados y quieren dejar de perder comprobantes deducibles.

El piloto centraliza recibos/facturas, los ordena por persona y mes, y entrega un reporte mensual listo para revisar con el contador.

Tenemos dos opciones iniciales:
- Diagnóstico de deducciones perdidas: $999 MXN.
- Piloto FMG: $1,499 MXN/mes.

¿Te interesa revisar si esto aplica para tu operación?

### Guion de llamada de 5 minutos

1. ¿Cómo reciben hoy los comprobantes de empleados?
2. ¿Quién los revisa y cuánto tarda?
3. ¿Qué pasa cuando un recibo llega tarde o incompleto?
4. ¿El contador recibe todo ordenado al cierre de mes?
5. ¿Cuántos empleados generan gastos?
6. ¿Cuántos comprobantes calculas al mes?
7. Propuesta: iniciar piloto de 30 días con hasta 3 usuarios y 100 comprobantes.

### Objeciones

**Ya tengo contador.**
Perfecto. FMG no lo reemplaza en el piloto; le entrega mejor información para que no persiga documentos al cierre.

**Mis empleados mandan todo por WhatsApp.**
Ese es justo el problema: WhatsApp sirve para mandar, pero no para ordenar, medir ni cerrar mes.

**No quiero otro sistema complicado.**
El piloto es asistido. Empezamos con pocos usuarios, medimos el flujo real y solo automatizamos lo que demuestre valor.

**¿Ya presenta impuestos?**
Todavía no prometemos presentación automática. Este MVP resuelve la base: comprobantes completos, ordenados y reportables.

## Prospecto ideal

- Empresa mexicana de 3 a 50 empleados.
- Tiene empleados con gastos de campo, ventas, traslados, viáticos, compras o gasolina.
- Usa WhatsApp/correo para recibir comprobantes.
- El contador pide documentos al cierre.
- Sospecha que pierde deducciones por desorden.

## Próximo paso comercial

Contactar 20 prospectos cercanos y ofrecer diagnóstico o piloto. Meta del primer ciclo: 5 conversaciones, 2 pilotos pagados, 1 aprendizaje claro sobre qué dolor compra mejor.
