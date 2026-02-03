import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Aviso de Privacidad | Factura Mis Gastos',
  description: 'Aviso de privacidad integral de Factura Mis Gastos - Sutilde SAPI de CV',
};

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Aviso de Privacidad Integral</h1>
            <p className="text-sm text-gray-500 mb-8">Última actualización: 31 de enero de 2026</p>
            
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold mt-6 mb-3">1. Identidad y Domicilio del Responsable</h2>
              <p>Sutilde SAPI de CV, con domicilio en Chihuahua, Chihuahua, México, es responsable del tratamiento de sus datos personales.</p>
              <p>Contacto: <a href="mailto:privacidad@facturamisgastos.com" className="text-blue-600">privacidad@facturamisgastos.com</a></p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">2. Datos Personales que Recabamos</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Datos de identificación:</strong> Nombre, correo electrónico, teléfono, empresa, puesto, RFC</li>
                <li><strong>Datos laborales:</strong> Empleados autorizados, departamento, límites de gasto</li>
                <li><strong>Datos financieros:</strong> Recibos, montos, categorías de gasto, CFDIs</li>
                <li><strong>Datos de uso:</strong> Historial de actividad, reportes generados, dirección IP</li>
              </ul>
              <p className="mt-4">No recabamos datos personales sensibles.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">3. Finalidades del Tratamiento</h2>
              <h3 className="text-lg font-medium mt-4 mb-2">Finalidades Primarias (necesarias):</h3>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Crear y administrar su cuenta de usuario</li>
                <li>Procesar los recibos y comprobantes que nos envíe</li>
                <li>Solicitar y gestionar facturas CFDI ante proveedores</li>
                <li>Generar reportes de gastos para su empresa</li>
                <li>Aplicar reglas de aprobación configuradas</li>
                <li>Enviar notificaciones sobre el estado de sus gastos</li>
                <li>Facturar nuestros servicios</li>
                <li>Brindar soporte técnico</li>
              </ol>
              
              <h3 className="text-lg font-medium mt-4 mb-2">Finalidades Secundarias (opcionales):</h3>
              <ol className="list-decimal pl-6 space-y-1" start={9}>
                <li>Enviar comunicaciones promocionales sobre nuestros servicios</li>
                <li>Realizar encuestas de satisfacción</li>
                <li>Elaborar estadísticas internas</li>
                <li>Publicar casos de éxito (con su consentimiento previo)</li>
              </ol>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">4. Transferencias de Datos</h2>
              <p>Sus datos podrán ser transferidos a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Proveedores de servicios en la nube:</strong> Para almacenamiento seguro de información</li>
                <li><strong>Proveedores para gestión de facturas:</strong> Para solicitar CFDIs en su nombre</li>
                <li><strong>Autoridades competentes:</strong> Cuando exista obligación legal</li>
                <li><strong>Contador o área contable del cliente:</strong> Con su consentimiento expreso</li>
              </ul>
              <p className="mt-4 font-medium">No vendemos ni comercializamos sus datos personales a terceros.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">5. Medidas de Seguridad</h2>
              <p>Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cifrado SSL/TLS en todas las comunicaciones</li>
                <li>Cifrado AES-256 para datos almacenados</li>
                <li>Acceso restringido basado en roles</li>
                <li>Monitoreo continuo de actividad</li>
                <li>Respaldos periódicos</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">6. Derechos ARCO</h2>
              <p>Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Acceso:</strong> Conocer qué datos tenemos de usted</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos</li>
                <li><strong>Oposición:</strong> Oponerse al uso de sus datos para ciertas finalidades</li>
              </ul>
              <p className="mt-4">Para ejercer estos derechos, contacte a: <a href="mailto:privacidad@facturamisgastos.com" className="text-blue-600">privacidad@facturamisgastos.com</a></p>
              <p>Plazo de respuesta: 20 días hábiles.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">7. Uso de Cookies</h2>
              <p>Utilizamos cookies propias y de terceros para mejorar su experiencia de navegación, analizar el tráfico y personalizar el contenido.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">8. Cambios al Aviso de Privacidad</h2>
              <p>Nos reservamos el derecho de modificar este aviso. Cualquier cambio será publicado en esta página y, de ser significativo, se lo notificaremos por correo electrónico.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">9. Autoridad</h2>
              <p>Si considera que sus derechos han sido vulnerados, puede acudir al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI): <a href="https://home.inai.org.mx" className="text-blue-600" target="_blank" rel="noopener">www.inai.org.mx</a></p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
