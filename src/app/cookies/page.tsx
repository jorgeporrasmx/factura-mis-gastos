import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Política de Cookies | Factura Mis Gastos',
  description: 'Política de cookies de Factura Mis Gastos - Información sobre el uso de cookies en nuestro sitio web.',
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Cookies</h1>
            <p className="text-sm text-gray-500 mb-8">Última actualización: 19 de enero de 2026</p>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold mt-6 mb-3">1. ¿Qué son las cookies?</h2>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web.
                Nos permiten recordar sus preferencias y mejorar su experiencia de navegación.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-3">2. Tipos de cookies que utilizamos</h2>

              <h3 className="text-lg font-medium mt-4 mb-2">2.1 Cookies esenciales</h3>
              <p>
                Son necesarias para el funcionamiento básico del sitio web. Incluyen cookies de sesión y autenticación
                que permiten iniciar sesión en su cuenta y navegar por el portal de manera segura.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">2.2 Cookies de rendimiento</h3>
              <p>
                Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, recopilando información
                de forma anónima. Utilizamos esta información para mejorar el funcionamiento del sitio.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">2.3 Cookies de funcionalidad</h3>
              <p>
                Permiten recordar las elecciones que usted realiza (como su idioma preferido o la región en la que se encuentra)
                y proporcionan características mejoradas y personalizadas.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-3">3. Cookies de terceros</h2>
              <p>Nuestro sitio puede utilizar cookies de los siguientes servicios de terceros:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Analytics:</strong> Para analizar el tráfico del sitio web y el comportamiento de los usuarios.</li>
                <li><strong>Firebase:</strong> Para autenticación y servicios en la nube.</li>
                <li><strong>Calendly:</strong> Para la programación de citas.</li>
              </ul>

              <h2 className="text-xl font-semibold mt-6 mb-3">4. ¿Cómo controlar las cookies?</h2>
              <p>
                Usted puede controlar y/o eliminar las cookies según desee. Puede eliminar todas las cookies que ya están
                en su dispositivo y configurar la mayoría de los navegadores para impedir que se instalen. Sin embargo,
                si lo hace, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite el sitio,
                y algunos servicios y funcionalidades podrían no funcionar.
              </p>
              <p>
                Para gestionar las cookies en los navegadores más comunes:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios</li>
                <li><strong>Firefox:</strong> Opciones &gt; Privacidad y seguridad &gt; Cookies y datos del sitio</li>
                <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Gestionar datos del sitio web</li>
                <li><strong>Edge:</strong> Configuración &gt; Cookies y permisos del sitio</li>
              </ul>

              <h2 className="text-xl font-semibold mt-6 mb-3">5. Cambios en esta política</h2>
              <p>
                Podemos actualizar esta Política de Cookies periódicamente. Le recomendamos revisar esta página
                regularmente para estar informado sobre cualquier cambio.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-3">6. Contacto</h2>
              <p>
                Si tiene preguntas sobre nuestra política de cookies, puede contactarnos en:{' '}
                <a href="mailto:privacidad@facturamisgastos.com" className="text-blue-600">
                  privacidad@facturamisgastos.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
