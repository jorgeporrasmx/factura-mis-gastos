import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const GuiaEmpleadoContent = dynamic(() => import('./GuiaEmpleadoContent'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Guía del Empleado - Factura Mis Gastos',
  description: 'Guía rápida para empleados sobre cómo usar Factura Mis Gastos',
};

export default function GuiaEmpleadoPage() {
  return <GuiaEmpleadoContent />;
}
