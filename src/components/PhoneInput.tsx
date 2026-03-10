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
    <div className="phone-input-wrapper w-full max-w-full overflow-hidden">
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

      <style>{`
        .phone-input-wrapper .react-international-phone-input-container {
          display: flex !important;
          gap: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .phone-input-wrapper .react-international-phone-country-selector {
          flex-shrink: 0 !important;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button {
          height: auto !important;
          min-height: 56px !important;
          padding: 0 12px !important;
          border: 2px solid hsl(var(--border)) !important;
          border-right: none !important;
          border-radius: 12px 0 0 12px !important;
          background: hsl(var(--card)) !important;
          font-size: 1.125rem !important;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button:hover {
          border-color: hsl(var(--primary) / 0.5) !important;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button__flag-emoji {
          font-size: 1.4rem;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button__dropdown-arrow {
          border-top-color: hsl(var(--muted-foreground));
          margin-left: 4px;
        }
        .phone-input-wrapper .react-international-phone-input {
          flex: 1 1 0% !important;
          width: 100% !important;
          min-width: 0 !important;
          height: auto !important;
          min-height: 56px !important;
          padding: 0 16px !important;
          border: 2px solid hsl(var(--border)) !important;
          border-radius: 0 12px 12px 0 !important;
          font-size: 1.125rem !important;
          line-height: 1.5 !important;
          color: hsl(var(--foreground)) !important;
          background: hsl(var(--background)) !important;
          box-sizing: border-box !important;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        /* Borda laranja ao focar */
        .phone-input-wrapper .react-international-phone-input:focus {
          border-color: hsl(var(--primary)) !important;
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2) !important;
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

