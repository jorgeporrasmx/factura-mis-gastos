# FMG Web - Diagnóstico y Fix para Drive Upload

## 🐛 Problemas Encontrados

### 1. Captura de cámara NO sube a Drive
**Archivo:** `src/app/portal/recibos/page.tsx`
**Función:** `handleCapture`

```javascript
const handleCapture = (blob: Blob) => {
  // ❌ PROBLEMA: Solo crea blob local, NUNCA sube a Drive
  const receipt: Receipt = {
    fileUrl: URL.createObjectURL(blob),  // Solo blob local
    ...
  };
  localStorage.setItem('receipts', JSON.stringify(newReceipts)); // Solo localStorage
};
```

**Impacto:** Cuando el usuario toma foto con la cámara, el archivo solo se guarda en memoria local del navegador, nunca se envía al servidor.

### 2. Upload desde galería SÍ debería funcionar
**Archivo:** `src/components/receipts/ReceiptUploader.tsx`

El componente `ReceiptUploader` usa correctamente `useFileUpload` con `type: 'receipts'`, que llama a `/api/upload/receipt`.

Pero si no está funcionando, posibles causas:
- El header `x-user-uid` llega vacío si `user?.uid` es undefined
- Error silencioso en el endpoint que no se reporta bien

### 3. Recibos se guardan en localStorage (mock)
El código carga/guarda recibos desde `localStorage` en lugar de Firestore/Drive:
```javascript
useEffect(() => {
  const stored = localStorage.getItem('receipts');
  // ...
}, []);
```

## ✅ Solución Propuesta

### Fix 1: Conectar captura de cámara al hook de upload

Modificar `handleCapture` para que convierta el blob a File y use el hook:

```javascript
const handleCapture = async (blob: Blob) => {
  // Convertir blob a File
  const file = new File([blob], `recibo-${Date.now()}.jpg`, { type: 'image/jpeg' });
  
  // Crear FormData y llamar al API
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/receipt', {
    method: 'POST',
    headers: { 'x-user-uid': user?.uid || '' },
    body: formData,
  });
  
  const result = await response.json();
  // ...manejar resultado
};
```

### Fix 2: Persistir recibos en Firestore

Crear colección `receipts` en Firestore con estructura:
```typescript
interface Receipt {
  id: string;
  userId: string;
  companyId: string;
  driveFileId: string;
  driveUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Timestamp;
  status: 'pending' | 'processed' | 'error';
}
```

### Fix 3: Cargar recibos desde Firestore/Drive

Reemplazar localStorage por llamadas a Firestore:
```javascript
useEffect(() => {
  async function loadReceipts() {
    const receipts = await getUserReceipts(user.uid);
    setReceipts(receipts);
  }
  loadReceipts();
}, [user?.uid]);
```

## 📋 Archivos a Modificar

1. `src/app/portal/recibos/page.tsx` - Conectar cámara al upload real
2. `src/lib/firebase/firestore.ts` - Agregar funciones CRUD de recibos
3. `src/hooks/useFileUpload.ts` - Verificar que userId no sea vacío

## ⏱️ Estimación: 2-3 horas
