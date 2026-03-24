import { Metadata } from 'next';
import GuiaEmpleadoContent from './GuiaEmpleadoContent';

export const metadata: Metadata = {
  title: 'Guía del Empleado - Factura Mis Gastos',
  description: 'Guía rápida para empleados sobre cómo usar Factura Mis Gastos',
};

export default function GuiaEmpleadoPage() {
  return <GuiaEmpleadoContent />;
}
