/**
 * PhoneInput — campo de telefone com seletor de país
 *
 * Usa usePhoneInput (hook) para controle total do layout.
 * O input ocupa 100% da largura do form, alinhado com os outros campos.
 */

import { useRef } from 'react';
import { usePhoneInput, FlagImage, defaultCountries, parseCountry } from 'react-international-phone';
import 'react-international-phone/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function PhoneInput({ value, onChange, id = 'whatsapp', disabled = false, required = false }: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { inputValue, handlePhoneValueChange, country, setCountry } = usePhoneInput({
    defaultCountry: 'br',
    value,
    countries: defaultCountries,
    onChange: (data) => onChange(data.phone),
    inputRef,
  });

  const countryEntry = defaultCountries.find((c) => parseCountry(c).iso2 === country.iso2);
  const dialCode = countryEntry ? parseCountry(countryEntry).dialCode : country.dialCode;

  return (
    <div className="flex w-full">
      {/* Botão do país com bandeira e DDI */}
      <div className="flex items-center gap-1.5 px-3 border-2 border-r-0 border-border rounded-l-xl bg-card flex-shrink-0">
        <select
          value={country.iso2}
          onChange={(e) => setCountry(e.target.value)}
          disabled={disabled}
          className="absolute opacity-0 w-10 h-full cursor-pointer"
          aria-label="Selecionar país"
        />
        <FlagImage iso2={country.iso2} size="24px" />
        <span className="text-xs text-muted-foreground">▼</span>
        <span className="text-base font-medium text-foreground">+{dialCode}</span>
      </div>

      {/* Campo de entrada do número */}
      <input
        ref={inputRef}
        id={id}
        type="tel"
        value={inputValue}
        onChange={handlePhoneValueChange}
        disabled={disabled}
        required={required}
        autoComplete="tel"
        placeholder="(81) 99999-9999"
        className="flex-1 min-w-0 py-4 px-4 border-2 border-border rounded-r-xl
                   text-accessible-base text-foreground bg-background
                   focus:border-primary focus:ring-2 focus:ring-primary/20
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-colors outline-none"
      />
    </div>
  );
}

