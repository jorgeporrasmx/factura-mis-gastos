'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Algo salió mal
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Ocurrió un error inesperado. Por favor intenta de nuevo.
            </p>
            <button
              onClick={reset}
              style={{ padding: '0.625rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
