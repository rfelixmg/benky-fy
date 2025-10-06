export interface ConversionOptions {
  outputType: "hiragana" | "katakana";
  strictMode?: boolean;
}

export interface ConversionResult {
  original: string;
  converted: string;
  isValid: boolean;
  errors?: string[];
}
