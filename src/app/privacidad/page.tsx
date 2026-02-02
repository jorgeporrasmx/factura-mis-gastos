import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad',
  description: 'Aviso de privacidad de Factura Mis Gastos. Conoce cómo protegemos y utilizamos tu información personal.',
};

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
            Aviso de Privacidad
          </h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Identidad del Responsable</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Factura Mis Gastos</strong>, con domicilio en Ciudad de México, México, es responsable del tratamiento de sus datos personales.
              </p>
              <p className="text-muted-foreground">
                Correo electrónico de contacto: <a href="mailto:privacidad@facturamisgastos.com" className="text-primary hover:underline">privacidad@facturamisgastos.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Datos Personales que Recopilamos</h2>
              <p className="text-muted-foreground mb-4">Para brindar nuestros servicios, recopilamos los siguientes datos personales:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Datos de identificación:</strong> Nombre completo, RFC, razón social</li>
                <li><strong>Datos de contacto:</strong> Correo electrónico, número telefónico, dirección fiscal</li>
                <li><strong>Datos fiscales:</strong> Régimen fiscal, Constancia de Situación Fiscal (CSF), uso de CFDI</li>
                <li><strong>Datos de transacciones:</strong> Recibos, tickets y comprobantes de gastos que nos envíe</li>
                <li><strong>Datos de pago:</strong> Información necesaria para procesar sus pagos (procesada por terceros autorizados)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Finalidades del Tratamiento</h2>
              <p className="text-muted-foreground mb-4">Sus datos personales serán utilizados para:</p>
              
              <h3 className="text-lg font-medium text-foreground mb-2">Finalidades primarias (necesarias para el servicio):</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Gestionar la solicitud de facturas CFDI en su nombre</li>
                <li>Procesar y organizar sus recibos y comprobantes de gastos</li>
                <li>Generar reportes de gastos empresariales</li>
                <li>Procesar pagos y facturación de nuestros servicios</li>
                <li>Brindar soporte y atención al cliente</li>
                <li>Cumplir con obligaciones legales y fiscales</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mb-2">Finalidades secundarias (opcionales):</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Enviar comunicaciones promocionales y de marketing</li>
                <li>Realizar encuestas de satisfacción</li>
                <li>Mejorar nuestros productos y servicios</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Si no desea que sus datos sean tratados para finalidades secundarias, puede manifestarlo enviando un correo a <a href="mailto:privacidad@facturamisgastos.com" className="text-primary hover:underline">privacidad@facturamisgastos.com</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Transferencia de Datos</h2>
              <p className="text-muted-foreground mb-4">Sus datos personales podrán ser transferidos a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Proveedores de servicios tecnológicos:</strong> Para almacenamiento seguro en la nube y procesamiento de datos</li>
                <li><strong>Procesadores de pago:</strong> Para gestionar transacciones de forma segura</li>
                <li><strong>Establecimientos comerciales:</strong> Únicamente para solicitar la factura CFDI correspondiente a sus gastos</li>
                <li><strong>Autoridades competentes:</strong> Cuando sea requerido por ley</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Derechos ARCO</h2>
              <p className="text-muted-foreground mb-4">
                Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (Derechos ARCO). Para ejercer estos derechos, envíe su solicitud a:
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Correo:</strong> <a href="mailto:privacidad@facturamisgastos.com" className="text-primary hover:underline">privacidad@facturamisgastos.com</a>
              </p>
              <p className="text-muted-foreground">
                Su solicitud deberá incluir: nombre completo, correo electrónico registrado, descripción clara de los datos sobre los que desea ejercer sus derechos, y cualquier documento que acredite su identidad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Medidas de Seguridad</h2>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger sus datos personales:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Cifrado de datos en tránsito y en reposo</li>
                <li>Autenticación segura con múltiples factores</li>
                <li>Acceso restringido solo a personal autorizado</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Respaldos periódicos de información</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Uso de Cookies y Tecnologías de Rastreo</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Estas tecnologías nos permiten:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso del sitio para mejorarlo</li>
                <li>Personalizar contenido</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Puede configurar su navegador para rechazar cookies, aunque esto podría afectar la funcionalidad del sitio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Cambios al Aviso de Privacidad</h2>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar este Aviso de Privacidad. Cualquier cambio será notificado a través de nuestro sitio web o por correo electrónico. Le recomendamos revisar periódicamente esta página.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Consentimiento</h2>
              <p className="text-muted-foreground">
                Al utilizar nuestros servicios y proporcionar sus datos personales, usted otorga su consentimiento para el tratamiento de los mismos conforme a lo establecido en este Aviso de Privacidad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">10. Contacto</h2>
              <p className="text-muted-foreground">
                Para cualquier duda o aclaración sobre este Aviso de Privacidad, puede contactarnos en:
              </p>
              <ul className="list-none text-muted-foreground mt-4 space-y-2">
                <li><strong>Correo:</strong> <a href="mailto:privacidad@facturamisgastos.com" className="text-primary hover:underline">privacidad@facturamisgastos.com</a></li>
                <li><strong>WhatsApp:</strong> <a href="https://wa.me/5215512345678" className="text-primary hover:underline">+52 55 1234 5678</a></li>
              </ul>
            </section>

            <div className="mt-12 p-6 bg-slate-50 rounded-xl">
              <p className="text-sm text-muted-foreground text-center">
                Este aviso de privacidad cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
