import Link from 'next/link';
import { type LucideIcon, ChevronRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  value?: string | number;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  children?: React.ReactNode;
}

const statusStyles = {
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  error: 'bg-red-50 border-red-200',
  neutral: 'bg-gray-50 border-gray-200',
};

const iconStyles = {
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
  neutral: 'bg-blue-100 text-blue-600',
};

export function DashboardCard({
  title,
  description,
  icon: Icon,
  href,
  value,
  status = 'neutral',
  children,
}: DashboardCardProps) {
  const content = (
    <div
      className={`rounded-xl border p-6 transition-all ${statusStyles[status]} ${
        href ? 'hover:shadow-md cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${iconStyles[status]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
            {value !== undefined && (
              <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            )}
          </div>
        </div>
        {href && <ChevronRight className="w-5 h-5 text-gray-400" />}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
