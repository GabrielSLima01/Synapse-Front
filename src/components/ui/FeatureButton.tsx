import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface FeatureButtonProps {
  to: string;
  icon: ReactNode;
  label: string;
  caption?: string;
  delay?: number;
}

export function FeatureButton({ to, icon, label, caption, delay = 0 }: FeatureButtonProps) {
  return (
    <Link
      to={to}
      className="btn-fenearte opacity-0 animate-slide-up min-h-[140px]"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-16 h-16 flex items-center justify-center text-primary">
        {icon}
      </div>
      <span className="text-accessible-lg font-bold text-foreground text-center leading-tight">
        {label}
      </span>
      {caption && (
        <span className="text-accessible-sm text-muted-foreground text-center leading-tight mt-1">
          {caption}
        </span>
      )}
    </Link>
  );
}
