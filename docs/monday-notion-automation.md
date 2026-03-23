# Automatización Monday → Notion (Guiones Aprobados)

**Última actualización:** 1 de marzo, 2026

## 📋 ¿Qué hace esta automatización?

Esta automatización sincroniza los guiones aprobados desde Monday hacia Notion, específicamente hacia la base de datos "JORGE SCRIPTS PARA REELS".

## 🔄 Flujo de la automatización

```
[Monday] Cambio de status a "Aprobado"
    ↓
[Webhook] Monday dispara evento
    ↓
[n8n] Recibe el evento
    ↓
[n8n] Procesa datos del guión
    ↓
[Notion] Crea página en la base de datos
```

## ⚡ ¿Qué activa la automatización?

**Trigger:** Cuando un item en Monday cambia su columna de **Status** al valor **"Aprobado"**.

Específicamente:
- El webhook de Monday envía un evento cuando el status cambia
- El workflow de n8n escucha ese webhook
- Si el nuevo status es "Aprobado", procesa y envía a Notion

## 🔧 Componentes del sistema

### 1. Monday.com
- **Tablero origen:** Depende del tablero configurado en la automatización de Monday
- **Columna monitoreada:** Status
- **Valor trigger:** "Aprobado"

### 2. n8n (Railway)
- **URL:** https://primary-production-ab178.up.railway.app
- **Workflow:** Monday Guiones Aprobados to Notion
- **Estado:** ✅ ACTIVO (desde 1 Mar 2026)

### 3. Notion
- **Base de datos destino:** JORGE SCRIPTS PARA REELS
- **Database ID:** `1f3a822d-8268-8189-8a82-eb84e918ce96`
- **URL:** https://www.notion.so/SISTEMA-DE-GUIONES-Jorge-Porras-1f3a822d826880618078c3af2c84bf15

## 📊 Campos que se sincronizan

| Campo Monday | Campo Notion |
|--------------|--------------|
| Nombre del item | VIDEO (título) |
| Descripción/Guión | Guion completo |
| Status | Status (cambia a "POR GRABAR 🎬") |
| Fecha | Fecha |

## 🛠️ Configuración técnica

### Credenciales n8n
- **Notion:** "Notion account" (configurada desde Nov 2025)
- **Monday:** API key configurada

### Webhook
- El webhook URL está configurado en Monday como automatización nativa
- n8n recibe los eventos y procesa

## 📝 Cómo usar

1. En Monday, crea o edita un item con el guión
2. Cuando el guión esté listo para grabar, cambia el Status a **"Aprobado"**
3. La automatización creará automáticamente la página en Notion
4. El guión aparecerá en la base de datos "JORGE SCRIPTS PARA REELS" con status "POR GRABAR 🎬"

## ⚠️ Notas importantes

- La automatización solo se activa cuando el status CAMBIA a "Aprobado"
- Si el item ya está en "Aprobado" y lo editas, NO se re-sincroniza
- Para re-sincronizar, cambia el status a otro valor y vuelve a "Aprobado"

---

*Documentación creada por Juan — 1 Mar 2026*
