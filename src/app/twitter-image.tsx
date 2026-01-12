import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Factura Mis Gastos - Gestión de Gastos Empresariales en México';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(30, 64, 175, 0.15) 0%, transparent 50%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 24,
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
              }}
            >
              {/* F Icon as SVG */}
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
              >
                {/* Document base */}
                <path
                  d="M6 2h9l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
                  fill="white"
                  fillOpacity="0.3"
                />
                {/* Corner fold */}
                <path
                  d="M15 2v5h5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Letter F */}
                <path
                  d="M8 10h6M8 10v8M8 14h4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Checkmark */}
                <path
                  d="M14 16l1.5 1.5L18 15"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Brand name */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                Factura
                <span
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  MisGastos
                </span>
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 32,
                color: '#94a3b8',
                textAlign: 'center',
                maxWidth: 900,
                lineHeight: 1.4,
              }}
            >
              Gestión de Gastos Empresariales en México
            </span>
            <span
              style={{
                fontSize: 24,
                color: '#64748b',
                textAlign: 'center',
                maxWidth: 800,
              }}
            >
              Tus empleados envían el recibo por WhatsApp, nosotros gestionamos la factura CFDI
            </span>
          </div>

          {/* Bottom badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: 50,
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: '#3b82f6',
                fontWeight: 600,
              }}
            >
              Desde $10 MXN por factura
            </span>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
