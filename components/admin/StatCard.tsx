import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
}

const StatCard = ({ label, value, description, icon: Icon }: StatCardProps) => {
  return (
    <div className="bg-background border border-foreground/20 p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground font-sans">{label}</p>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground shrink-0" />}
      </div>
      <p className="font-serif text-4xl font-bold text-foreground mt-2">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
};

export default StatCard;
