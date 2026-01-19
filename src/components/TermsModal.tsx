'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-center">
            Términos y Condiciones del Servicio
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Última actualización: 19 de enero de 2026
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4 -mr-4">
          <div className="prose prose-sm max-w-none text-foreground space-y-6 pb-4">
            <p className="text-sm text-muted-foreground">
              Los presentes Términos y Condiciones regulan el uso de los servicios ofrecidos por
              Factura Mis Gastos, operado por Sutilde Comunicación S.A.S. de C.V. (en adelante
              &quot;el Prestador&quot;), con domicilio en Querétaro, México. Al utilizar nuestros servicios,
              el Usuario acepta íntegramente estos términos.
            </p>

            {/* Sección 1 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">1. Definiciones</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Usuario:</strong> Persona física o moral que contrata los servicios de Factura Mis Gastos.</li>
                <li><strong className="text-foreground">Recibo:</strong> Comprobante de pago emitido por un comercio o proveedor de servicios en territorio mexicano, que sirve como base para solicitar un CFDI.</li>
                <li><strong className="text-foreground">CFDI:</strong> Comprobante Fiscal Digital por Internet, documento fiscal válido ante el SAT para efectos de deducción de impuestos.</li>
                <li><strong className="text-foreground">Proveedor:</strong> Comercio, establecimiento o prestador de servicios que emitió el recibo original y está obligado a emitir CFDI.</li>
                <li><strong className="text-foreground">Plataforma:</strong> Sistema web y canales de comunicación (WhatsApp, correo electrónico) mediante los cuales el Usuario interactúa con el servicio.</li>
              </ul>
            </section>

            {/* Sección 2 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">2. Requisitos del Recibo para ser Procesado</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Para que un recibo sea aceptado y procesado por nuestro equipo, debe cumplir con TODOS los siguientes requisitos.
                El incumplimiento de cualquiera de ellos resultará en el rechazo del recibo.
              </p>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">2.1 Formato de imagen</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Formatos aceptados:</strong> Únicamente imágenes en formato JPG, JPEG o PNG.</li>
                <li><strong className="text-foreground">Formatos NO aceptados:</strong> NO se aceptan archivos PDF bajo ninguna circunstancia.</li>
                <li>Pueden ser fotografías tomadas directamente con el dispositivo móvil o imágenes escaneadas.</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">2.2 Calidad y legibilidad de la imagen</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Nitidez:</strong> El texto debe ser completamente legible, sin desenfoques ni movimiento.</li>
                <li><strong className="text-foreground">Iluminación:</strong> Evitar sombras, reflejos o zonas sobreexpuestas.</li>
                <li><strong className="text-foreground">Encuadre:</strong> El recibo completo debe estar visible, sin cortes.</li>
                <li><strong className="text-foreground">Orientación:</strong> La imagen debe estar correctamente orientada.</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">2.3 Contenido mínimo visible</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Nombre o razón social del comercio</li>
                <li>Fecha de la transacción (día, mes y año)</li>
                <li>Importe total de la compra (incluyendo IVA cuando aplique)</li>
                <li>Concepto o descripción de los productos o servicios</li>
                <li>Dirección del establecimiento (cuando esté disponible)</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">2.4 Información de contacto para facturación</h4>
              <p className="text-sm text-muted-foreground">
                El recibo DEBE incluir al menos uno de los siguientes medios de contacto del proveedor:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Página web con portal de facturación</li>
                <li>Correo electrónico oficial de facturación</li>
                <li>Número telefónico de atención al cliente</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">2.5 Códigos QR de facturación externa</h4>
              <p className="text-sm text-muted-foreground">
                Cuando el recibo incluya un código QR que dirija a un portal externo de facturación,
                el Usuario DEBE tomar UNA SOLA fotografía que incluya tanto el recibo completo como el código QR visible en la misma imagen.
              </p>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">2.6 Requisitos específicos por tipo de gasto</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Gasolina:</strong> El ticket debe incluir los últimos 4 dígitos de la tarjeta utilizada O la placa del vehículo.</li>
                <li><strong className="text-foreground">Estacionamientos:</strong> Se aceptan tickets que cuenten con sistema de facturación.</li>
                <li><strong className="text-foreground">Casetas de peaje:</strong> Se requiere el ticket con número de plaza, carril y hora de cruce.</li>
              </ul>
            </section>

            {/* Sección 3 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">3. Tiempos y Canales de Envío</h3>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">3.1 Plazo máximo de envío</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Mismo día:</strong> Los recibos deben enviarse el MISMO DÍA de la compra.</li>
                <li><strong className="text-foreground">Dentro del mes:</strong> Adicionalmente, dentro del mismo mes calendario.</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Ejemplo: Un recibo del 15 de enero debe enviarse el 15 de enero y no después del 31 de enero.
              </p>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">3.2 Canales de envío</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Plataforma web (RECOMENDADO):</strong> Múltiples recibos simultáneamente.</li>
                <li><strong className="text-foreground">WhatsApp:</strong> UN recibo por mensaje.</li>
                <li><strong className="text-foreground">Correo electrónico:</strong> Múltiples recibos como archivos adjuntos independientes.</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">3.3 Horario de recepción</h4>
              <p className="text-sm text-muted-foreground">
                Los recibos pueden enviarse 24/7. El procesamiento se realizará en días hábiles dentro de las 24-48 horas siguientes.
              </p>
            </section>

            {/* Sección 4 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">4. Proceso de Facturación</h3>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">4.1 Validación inicial</h4>
              <p className="text-sm text-muted-foreground">
                Se verificará que el recibo cumpla con todos los requisitos de la Sección 2.
                Si no cumple, se notificará el motivo del rechazo.
              </p>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">4.2 Gestión con el proveedor</h4>
              <p className="text-sm text-muted-foreground">
                Se realizarán hasta 2 intentos de contacto en 48 horas hábiles.
              </p>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">4.3 Entrega del CFDI</h4>
              <p className="text-sm text-muted-foreground">
                El CFDI será validado ante el SAT y entregado al Usuario a través de los canales acordados.
              </p>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">4.4 Tiempo estimado</h4>
              <p className="text-sm text-muted-foreground">
                24 a 48 horas hábiles desde la recepción del recibo válido.
              </p>
            </section>

            {/* Sección 5 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">5. Casos de Rechazo y Recibos No Facturables</h3>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">5.1 Rechazo por incumplimiento del Usuario (cuenta como 1 recibo)</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Formato de imagen incorrecto (PDF u otro)</li>
                <li>Imagen ilegible, borrosa o incompleta</li>
                <li>Falta de información de contacto del proveedor</li>
                <li>Recibo enviado fuera del plazo</li>
                <li>QR externo no incluido en la misma imagen</li>
                <li>Tickets de gasolina sin datos requeridos</li>
                <li>Múltiples recibos en un solo mensaje de WhatsApp</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">5.2 Rechazo ajeno al Usuario (cuenta como 0.5 recibos)</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Proveedor no responde después de 2 intentos</li>
                <li>Proveedor informa que no emite CFDI</li>
                <li>Plazo de facturación expirado en sistema del proveedor</li>
                <li>Error técnico del portal de facturación del proveedor</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">5.3 Gastos no facturables</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Gastos realizados en el extranjero</li>
                <li>Comercio informal (tianguis, vendedores ambulantes)</li>
                <li>Tickets sin datos fiscales ni medios de contacto</li>
              </ul>
            </section>

            {/* Sección 6 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">6. Garantía de Servicio</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Garantía de obtención:</strong> Si el recibo cumple con TODOS los requisitos y el proveedor emite facturas, garantizamos la obtención del CFDI.</li>
                <li><strong className="text-foreground">Sin cargo por falla del servicio:</strong> Si no logramos obtener la factura por causas imputables a nuestra gestión, el recibo NO contará en el límite mensual.</li>
              </ul>
            </section>

            {/* Sección 7 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">7. Responsabilidades de las Partes</h3>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">7.1 Responsabilidades del Usuario</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Proporcionar datos de facturación correctos y completos</li>
                <li>Enviar recibos que cumplan con todos los requisitos</li>
                <li>Verificar que los datos fiscales correspondan a su situación actual ante el SAT</li>
                <li>Notificar cambios en datos fiscales oportunamente</li>
                <li>Usar el servicio conforme a la legislación fiscal mexicana</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">7.2 Responsabilidades del Prestador</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Gestionar la obtención de CFDI de manera diligente</li>
                <li>Verificar la validez de cada CFDI ante el SAT</li>
                <li>Notificar al Usuario sobre el estatus de cada solicitud</li>
                <li>Mantener la confidencialidad de la información</li>
                <li>Generar reportes según el plan contratado</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">7.3 Limitaciones de responsabilidad</h4>
              <p className="text-sm text-muted-foreground">El Prestador NO será responsable por:</p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Errores en datos fiscales proporcionados por el Usuario</li>
                <li>Imposibilidad de facturación por políticas del proveedor</li>
                <li>Retrasos causados por terceros</li>
                <li>Consecuencias fiscales del uso inadecuado de los CFDI</li>
                <li>Pérdidas de deducciones por envío tardío de recibos</li>
              </ul>
            </section>

            {/* Sección 8 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">8. Planes, Pagos y Facturación del Servicio</h3>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">8.1 Planes disponibles</h4>
              <p className="text-sm text-muted-foreground">
                Consulte los planes vigentes en facturamisgastos.com.
              </p>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">8.2 Conteo de recibos</h4>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Recibo procesado exitosamente: 1 unidad</li>
                <li>Rechazado por incumplimiento del Usuario: 1 unidad</li>
                <li>No facturado por causas ajenas al Usuario: 0.5 unidades</li>
                <li>No facturado por falla del Prestador: 0 unidades</li>
              </ul>

              <h4 className="text-sm font-medium text-foreground mt-4 mb-2">8.3 Forma de pago</h4>
              <p className="text-sm text-muted-foreground">
                Pago anticipado según la periodicidad del plan contratado.
              </p>
            </section>

            {/* Sección 9 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">9. Conservación y Respaldo de Documentos</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Se conservarán copias durante la vigencia de la relación comercial</li>
                <li>El Usuario puede solicitar su expediente en cualquier momento</li>
                <li>Después de terminada la relación, los archivos se mantienen 30 días naturales</li>
                <li>Se recomienda al Usuario mantener sus propios respaldos</li>
              </ul>
            </section>

            {/* Sección 10 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">10. Protección de Datos Personales</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Tratamiento conforme a la Ley Federal de Protección de Datos Personales</li>
                <li>Datos utilizados exclusivamente para la prestación del servicio</li>
                <li>Derechos ARCO disponibles contactando al Prestador</li>
              </ul>
            </section>

            {/* Sección 11 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">11. Modificaciones a los Términos</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>El Prestador puede modificar estos términos en cualquier momento</li>
                <li>Notificación con al menos 15 días de anticipación</li>
                <li>El uso continuado constituye aceptación de los nuevos términos</li>
              </ul>
            </section>

            {/* Sección 12 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">12. Contacto y Soporte</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li><strong className="text-foreground">Sitio web:</strong> facturamisgastos.com</li>
                <li><strong className="text-foreground">Correo:</strong> soporte@facturamisgastos.com</li>
                <li><strong className="text-foreground">Horario:</strong> Lunes a viernes de 9:00 a 18:00 hrs (Centro de México)</li>
              </ul>
            </section>

            {/* Sección 13 */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">13. Jurisdicción y Ley Aplicable</h3>
              <p className="text-sm text-muted-foreground">
                Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos.
                Para cualquier controversia, las partes se someten a los tribunales de Querétaro, Querétaro, México.
              </p>
            </section>

            {/* Declaración final */}
            <section className="border-t pt-4 mt-6">
              <p className="text-sm text-muted-foreground italic">
                Al utilizar los servicios de Factura Mis Gastos, el Usuario declara haber leído,
                entendido y aceptado estos Términos y Condiciones en su totalidad.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Documento vigente a partir del 19 de enero de 2026
              </p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
