/**
 * PhoneInput — campo de telefone com seletor de país (DDD + código do país)
 *
 * Usa react-international-phone com bandeiras e busca de países.
 * Acessível para idosos: fonte grande, placeholder claro.
 * Borda laranja (primary) ao clicar/focar no campo.
 */

import { PhoneInput as IntlPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function PhoneInput({ value, onChange, id = 'whatsapp', disabled = false, required = false }: PhoneInputProps) {
  return (
    <div className="phone-input-wrapper" style={{ width: '100%' }}>
      <IntlPhoneInput
        defaultCountry="br"
        value={value}
        onChange={(phone) => onChange(phone)}
        disabled={disabled}
        inputProps={{
          id,
          autoComplete: 'tel',
          required,
        }}
        style={{ width: '100%' }}
        inputStyle={{
          width: '100%',
          flex: '1 1 0%',
          minWidth: 0,
          height: 'auto',
          minHeight: '56px',
          padding: '0 16px',
          border: '2px solid hsl(var(--border))',
          borderRadius: '0 12px 12px 0',
          fontSize: '1.125rem',
          lineHeight: '1.5',
          color: 'hsl(var(--foreground))',
          background: 'hsl(var(--background))',
          boxSizing: 'border-box',
          outline: 'none',
        }}
        countrySelectorStyleProps={{
          buttonStyle: {
            height: 'auto',
            minHeight: '56px',
            padding: '0 12px',
            border: '2px solid hsl(var(--border))',
            borderRight: 'none',
            borderRadius: '12px 0 0 12px',
            background: 'hsl(var(--card))',
            fontSize: '1.125rem',
          },
        }}
      />

      {/* Estilos de focus e dropdown (não podem ser inline) */}
      <style>{`
        .phone-input-wrapper .react-international-phone-input-container {
          width: 100% !important;
        }
        .phone-input-wrapper .react-international-phone-input:focus {
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2) !important;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button:hover {
          border-color: hsl(var(--primary) / 0.5) !important;
        }
        .phone-input-wrapper .react-international-phone-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown {
          z-index: 50;
          max-height: 240px;
          border-radius: 12px;
          border: 2px solid hsl(var(--border));
          background: hsl(var(--card));
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item {
          padding: 8px 12px;
          font-size: 0.95rem;
          color: hsl(var(--foreground));
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item:hover {
          background: hsl(var(--secondary));
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item--selected {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
        }
      `}</style>
    </div>
  );
}

