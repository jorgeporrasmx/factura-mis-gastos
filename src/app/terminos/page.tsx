import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos de uso de Factura Mis Gastos para clientes y usuarios del servicio.',
  alternates: {
    canonical: 'https://facturamisgastos.com/terminos',
  },
};

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-28 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Términos y condiciones</h1>
          <p className="text-sm text-muted-foreground mb-8">Última actualización: 25 de mayo de 2026</p>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Factura Mis Gastos es un servicio de apoyo operativo para recibir, organizar y dar seguimiento a
              comprobantes de gastos empresariales. El servicio no sustituye la revisión profesional de un contador
              ni constituye asesoría fiscal definitiva.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Uso del servicio</h2>
              <p>
                El cliente es responsable de enviar información veraz, comprobantes legibles y datos fiscales correctos.
                FMG podrá clasificar comprobantes como facturados, pendientes o no facturables según la información disponible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Alcance</h2>
              <p>
                FMG puede apoyar en la solicitud, seguimiento y organización de CFDI de gastos cuando aplique. La decisión
                fiscal final, deducibilidad y tratamiento contable corresponden al contador o asesor fiscal del cliente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">Privacidad</h2>
              <p>
                El tratamiento de datos personales y fiscales se rige por nuestro{' '}
                <Link href="/privacidad" className="text-primary hover:underline">
                  Aviso de Privacidad
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

