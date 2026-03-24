import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía del Empleado - Factura Mis Gastos',
  description: 'Guía rápida para empleados sobre cómo usar Factura Mis Gastos',
};

export default function GuiaEmpleadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
