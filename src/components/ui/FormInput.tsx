import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  className?: string;
}

export function FormInput({ label, error, icon, className = '', ...props }: FormInputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
        <input
          {...props}
          className={`w-full bg-gray-900 border ${error ? 'border-red-500/60' : 'border-gray-700'} text-white placeholder-gray-500 px-3 py-2.5 ${icon ? 'pl-10' : ''} rounded-lg text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all ${className}`}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, error, options, ...props }: FormSelectProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <select
        {...props}
        className={`w-full bg-gray-900 border ${error ? 'border-red-500/60' : 'border-gray-700'} text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all appearance-none`}
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function FormTextarea({ label, error, ...props }: FormTextareaProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <textarea
        {...props}
        className={`w-full bg-gray-900 border ${error ? 'border-red-500/60' : 'border-gray-700'} text-white placeholder-gray-500 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono`}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export function FormButton({ variant = 'primary', loading, className = '', ...props }: FormButtonProps) {
  const variantClass = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30',
  }[variant];

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`font-medium py-2.5 px-4 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${className}`}
    >
      {loading ? 'Loading...' : props.children}
    </button>
  );
}
