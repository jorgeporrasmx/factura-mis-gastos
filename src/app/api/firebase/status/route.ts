// API para verificar el estado de Firebase Admin SDK
// GET /api/firebase/status - Verificar configuración y conexión a Firestore

import { NextResponse } from 'next/server';
import { getAdminFirestore, isAdminConfigured } from '@/lib/firebase/admin';

interface FirebaseStatusResponse {
  configured: boolean;
  connected: boolean;
  projectId?: string;
  serviceAccountEmail?: string;
  error?: string;
  firestoreTest?: {
    canRead: boolean;
    canWrite: boolean;
    testDocId?: string;
  };
}

export async function GET() {
  const status: FirebaseStatusResponse = {
    configured: false,
    connected: false,
  };

  // Verificar variables de entorno
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;

  status.configured = isAdminConfigured();
  status.projectId = projectId || undefined;
  status.serviceAccountEmail = clientEmail ? `${clientEmail.substring(0, 20)}...` : undefined;

  // Verificar qué variables están configuradas
  const configStatus = {
    hasProjectId: Boolean(projectId),
    hasClientEmail: Boolean(clientEmail),
    hasPrivateKey: Boolean(privateKey),
    usingFirebaseAdminVars: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
    usingGoogleVars: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
  };

  if (!status.configured) {
    return NextResponse.json({
      ...status,
      error: 'Firebase Admin no está configurado. Faltan variables de entorno.',
      configStatus,
      help: {
        required: [
          'FIREBASE_ADMIN_PROJECT_ID o NEXT_PUBLIC_FIREBASE_PROJECT_ID',
          'FIREBASE_ADMIN_CLIENT_EMAIL o GOOGLE_SERVICE_ACCOUNT_EMAIL',
          'FIREBASE_ADMIN_PRIVATE_KEY o GOOGLE_PRIVATE_KEY',
        ],
        instructions: 'Obtener credenciales en Firebase Console → Configuración → Cuentas de servicio → Generar nueva clave privada',
      },
    });
  }

  // Intentar conectarse a Firestore
  try {
    const db = getAdminFirestore();

    if (!db) {
      return NextResponse.json({
        ...status,
        error: 'No se pudo obtener instancia de Firestore Admin',
        configStatus,
      });
    }

    // Test de lectura: intentar leer la colección de usuarios
    status.firestoreTest = {
      canRead: false,
      canWrite: false,
    };

    try {
      // Intentar leer un documento (no importa si existe)
      const testRef = db.collection('_firebase_status_test').doc('test');
      await testRef.get();
      status.firestoreTest.canRead = true;
    } catch (readError) {
      console.error('[Firebase Status] Error de lectura:', readError);
    }

    // Test de escritura: crear y eliminar documento de prueba
    try {
      const testDocRef = db.collection('_firebase_status_test').doc(`test_${Date.now()}`);
      await testDocRef.set({
        timestamp: new Date().toISOString(),
        test: true
      });
      status.firestoreTest.canWrite = true;
      status.firestoreTest.testDocId = testDocRef.id;

      // Limpiar: eliminar documento de prueba
      await testDocRef.delete();
    } catch (writeError) {
      console.error('[Firebase Status] Error de escritura:', writeError);
    }

    status.connected = status.firestoreTest.canRead || status.firestoreTest.canWrite;

    if (status.connected) {
      return NextResponse.json({
        ...status,
        configStatus,
        message: 'Firebase Admin SDK conectado correctamente a Firestore',
      });
    } else {
      return NextResponse.json({
        ...status,
        configStatus,
        error: 'Firebase Admin configurado pero no puede acceder a Firestore. Verificar permisos del Service Account.',
      }, { status: 500 });
    }

  } catch (error) {
    const err = error as Error;
    console.error('[Firebase Status] Error general:', err);

    return NextResponse.json({
      ...status,
      connected: false,
      error: err.message || 'Error desconocido al conectar con Firestore',
      configStatus,
    }, { status: 500 });
  }
}
