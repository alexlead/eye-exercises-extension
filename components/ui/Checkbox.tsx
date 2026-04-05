import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "peer h-5 w-5 shrink-0 appearance-none rounded-md border-2 border-slate-300 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 checked:border-primary-500 checked:bg-primary-500 transition-all cursor-pointer",
            className
          )}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <Check 
          className="absolute h-3.5 w-3.5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none stroke-[3px]" 
        />
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
