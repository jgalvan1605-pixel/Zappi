export interface PhoneNormalizationResult {
  isValid: boolean;
  rawInput: string;
  normalizedPhone: string; // Formato E.164 ej: +34612345678
  countryPrefix: string;   // ej: 34
  formattedDisplay: string;// ej: +34 612 34 56 78
  error?: string;
}

const COMMON_COUNTRY_PREFIXES: Record<string, { prefix: string; name: string; length: number[] }> = {
  ES: { prefix: '34', name: 'España', length: [9] },
  MX: { prefix: '52', name: 'México', length: [10] },
  CO: { prefix: '57', name: 'Colombia', length: [10] },
  AR: { prefix: '54', name: 'Argentina', length: [10, 11] },
  CL: { prefix: '56', name: 'Chile', length: [9] },
  PE: { prefix: '51', name: 'Perú', length: [9] },
  US: { prefix: '1', name: 'EE.UU. / Canadá', length: [10] },
  PT: { prefix: '351', name: 'Portugal', length: [9] },
  FR: { prefix: '33', name: 'Francia', length: [9] },
  IT: { prefix: '39', name: 'Italia', length: [9, 10] },
  UK: { prefix: '44', name: 'Reino Unido', length: [10] },
  DE: { prefix: '49', name: 'Alemania', length: [10, 11] },
};

/**
 * Normaliza cualquier formato de teléfono al estándar internacional E.164 (+[código_país][número])
 * Ejemplos:
 *  "612345678" -> "+34612345678"
 *  "0034 612 34 56 78" -> "+34612345678"
 *  "+34 (612) 34-56-78" -> "+34612345678"
 *  "+52 1 55 1234 5678" -> "+525512345678"
 */
export function normalizeToE164(rawPhone: string, defaultCountryCode: string = '34'): PhoneNormalizationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      rawInput: rawPhone || '',
      normalizedPhone: '',
      countryPrefix: '',
      formattedDisplay: '',
      error: 'Teléfono vacío o inválido.'
    };
  }

  const raw = rawPhone.trim();
  // Eliminar todos los caracteres no numéricos excepto el '+' inicial si existe
  let digitsOnly = raw.replace(/[^\d+]/g, '');

  // Si empieza por 00 (formato de marcación internacional europea), convertir a +
  if (digitsOnly.startsWith('00')) {
    digitsOnly = `+${digitsOnly.substring(2)}`;
  }

  // Quitar el '+' para trabajar con dígitos puros
  const hasPlus = digitsOnly.startsWith('+');
  let cleanDigits = digitsOnly.replace(/^\+/, '');

  let detectedPrefix = defaultCountryCode.replace(/^\+/, '');
  let nationalNumber = cleanDigits;

  // 1. Si el usuario introdujo prefijo explícito (con + o 00)
  if (hasPlus) {
    let matched = false;
    for (const country of Object.values(COMMON_COUNTRY_PREFIXES)) {
      if (cleanDigits.startsWith(country.prefix)) {
        detectedPrefix = country.prefix;
        nationalNumber = cleanDigits.substring(country.prefix.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Tomar los primeros 2 o 3 dígitos como prefijo genérico
      detectedPrefix = cleanDigits.slice(0, 2);
      nationalNumber = cleanDigits.slice(2);
    }
  } else {
    // 2. Sin prefijo explícito: comprobar si ya empieza por el prefijo por defecto
    if (cleanDigits.startsWith(detectedPrefix) && cleanDigits.length > 9) {
      nationalNumber = cleanDigits.substring(detectedPrefix.length);
    } else {
      nationalNumber = cleanDigits;
    }
  }

  // Limpieza especial para números de México (quitar el '1' móvil si viene tras el 52)
  if (detectedPrefix === '52' && nationalNumber.startsWith('1') && nationalNumber.length === 11) {
    nationalNumber = nationalNumber.substring(1);
  }

  // Validación de longitud mínima y máxima E.164 (entre 7 y 15 dígitos totales)
  const fullDigits = `${detectedPrefix}${nationalNumber}`;
  const isValidLength = fullDigits.length >= 8 && fullDigits.length <= 15 && nationalNumber.length >= 6;

  if (!isValidLength) {
    return {
      isValid: false,
      rawInput: raw,
      normalizedPhone: '',
      countryPrefix: detectedPrefix,
      formattedDisplay: raw,
      error: `Longitud no válida (${fullDigits.length} dígitos).`
    };
  }

  const normalizedPhone = `+${fullDigits}`;

  // Formato visual legible
  let formattedDisplay = normalizedPhone;
  if (detectedPrefix === '34' && nationalNumber.length === 9) {
    formattedDisplay = `+34 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 5)} ${nationalNumber.slice(5, 7)} ${nationalNumber.slice(7, 9)}`;
  }

  return {
    isValid: true,
    rawInput: raw,
    normalizedPhone,
    countryPrefix: detectedPrefix,
    formattedDisplay
  };
}