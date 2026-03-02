/**
 * PhoneInput — campo de telefone com seletor de país (DDD + código do país)
 *
 * Usa react-international-phone com bandeiras e busca de países.
 * Acessível para idosos: fonte grande, placeholder claro.
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
    <div className="phone-input-wrapper">
      <IntlPhoneInput
        defaultCountry="br"
        value={value}
        onChange={(phone) => onChange(phone)}
        disabled={disabled}
        inputProps={{
          id,
          className: 'phone-intl-input',
          autoComplete: 'tel',
          required,
        }}
        countrySelectorStyleProps={{
          buttonClassName: 'phone-intl-country-btn',
        }}
        inputClassName="phone-intl-input"
      />

      {/* Inline styles to match the project design system */}
      <style>{`
        .phone-input-wrapper .react-international-phone-input-container {
          display: flex;
          gap: 0;
          width: 100%;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button {
          height: auto;
          min-height: 56px;
          padding: 0 12px;
          border: 2px solid hsl(var(--border));
          border-right: none;
          border-radius: 12px 0 0 12px;
          background: hsl(var(--card));
          font-size: 1.125rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button:hover {
          border-color: hsl(var(--primary) / 0.5);
        }
        .phone-input-wrapper .react-international-phone-country-selector-button__flag-emoji {
          font-size: 1.4rem;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button__dropdown-arrow {
          border-top-color: hsl(var(--muted-foreground));
          margin-left: 4px;
        }
        .phone-input-wrapper .react-international-phone-input {
          flex: 1;
          height: auto;
          min-height: 56px;
          padding: 0 16px;
          border: 2px solid hsl(var(--border));
          border-radius: 0 12px 12px 0;
          font-size: 1.125rem;
          line-height: 1.5;
          color: hsl(var(--foreground));
          background: hsl(var(--background));
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .phone-input-wrapper .react-international-phone-input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
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

