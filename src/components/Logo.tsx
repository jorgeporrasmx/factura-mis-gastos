interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg' },
    md: { icon: 'w-9 h-9', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo Icon - Monograma FMG estilizado */}
      <div className={`${sizes[size].icon} gradient-bg rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg shadow-blue-500/25`}>
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

        {/* Monograma F estilizado como factura/documento */}
        <svg
          className="w-5 h-5 text-white relative z-10"
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Documento base */}
          <path
            d="M6 2h9l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
            fill="currentColor"
            fillOpacity="0.3"
          />
          {/* Esquina doblada */}
          <path
            d="M15 2v5h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Letra F estilizada */}
          <path
            d="M8 10h6M8 10v8M8 14h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Check mark pequeño */}
          <path
            d="M14 16l1.5 1.5L18 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-bold text-foreground leading-tight tracking-tight`}>
            Factura<span className="gradient-text">MisGastos</span>
          </span>
        </div>
      )}
    </div>
  );
}
