import React, { useState } from 'react';
import { Image, StyleSheet, ViewStyle, ImageStyle, Text, View } from 'react-native';
import { Language } from './languages';

// Mapping between our language strings and ISO country codes for flags
export const LANGUAGE_TO_FLAG_MAP: Record<Language, string> = {
  "Afrikaans (ZA)": "za",
  "Albanian (AL)": "al",
  "Amharic (ET)": "et",
  "Arabic (SA)": "sa",
  "Armenian (AM)": "am",
  "Assamese (IN)": "in",
  "Azerbaijani (AZ)": "az",
  "Bangla (BD)": "bd",
  "Basque (ES)": "es",
  "Belarusian (BY)": "by",
  "Bosnian (BA)": "ba",
  "Bulgarian (BG)": "bg",
  "Catalan (ES)": "es-ct", // Catalan
  "Cebuano (PH)": "ph",
  "Chinese (CN)": "cn",
  "Croatian (HR)": "hr",
  "Czech (CZ)": "cz",
  "Danish (DK)": "dk",
  "Dutch (NL)": "nl",
  "English (US)": "us",
  "Esperanto (EO)": "xx", // No specific flag for Esperanto, using placeholder
  "Estonian (EE)": "ee",
  "Finnish (FI)": "fi",
  "French (FR)": "fr",
  "Galician (ES)": "es-ga", // Galician
  "Georgian (GE)": "ge",
  "German (DE)": "de",
  "Greek (GR)": "gr",
  "Gujarati (IN)": "in",
  "Haitian Creole (HT)": "ht",
  "Hausa (NG)": "ng",
  "Hebrew (IL)": "il",
  "Hindi (IN)": "in",
  "Hmong (US)": "us",
  "Hungarian (HU)": "hu",
  "Icelandic (IS)": "is",
  "Igbo (NG)": "ng",
  "Indonesian (ID)": "id",
  "Irish (IE)": "ie",
  "Italian (IT)": "it",
  "Japanese (JP)": "jp",
  "Javanese (ID)": "id",
  "Kannada (IN)": "in",
  "Kazakh (KZ)": "kz",
  "Khmer (KH)": "kh",
  "Korean (KR)": "kr",
  "Kurdish (IQ)": "iq",
  "Kyrgyz (KG)": "kg",
  "Lao (LA)": "la",
  "Latin (LA)": "va", // Using Vatican for Latin
  "Latvian (LV)": "lv",
  "Lithuanian (LT)": "lt",
  "Luxembourgish (LU)": "lu",
  "Macedonian (MK)": "mk",
  "Malagasy (MG)": "mg",
  "Malay (MY)": "my",
  "Malayalam (IN)": "in",
  "Maltese (MT)": "mt",
  "Maori (NZ)": "nz",
  "Marathi (IN)": "in",
  "Mongolian (MN)": "mn",
  "Myanmar (Burmese) (MM)": "mm",
  "Nepali (NP)": "np",
  "Norwegian (NO)": "no",
  "Odia (Oriya) (IN)": "in",
  "Pashto (AF)": "af",
  "Persian (IR)": "ir",
  "Polish (PL)": "pl",
  "Portuguese (PT)": "pt",
  "Punjabi (IN)": "in",
  "Romanian (RO)": "ro",
  "Russian (RU)": "ru",
  "Samoan (WS)": "ws",
  "Scots Gaelic (GB)": "gb-sct", // Scottish flag
  "Serbian (RS)": "rs",
  "Sesotho (LS)": "ls",
  "Shona (ZW)": "zw",
  "Sindhi (IN)": "in",
  "Sinhala (LK)": "lk",
  "Slovak (SK)": "sk",
  "Slovenian (SI)": "si",
  "Somali (SO)": "so",
  "Spanish (ES)": "es",
  "Sundanese (ID)": "id",
  "Swahili (TZ)": "tz",
  "Swedish (SE)": "se",
  "Tagalog (PH)": "ph",
  "Tajik (TJ)": "tj",
  "Tamil (IN)": "in",
  "Telugu (IN)": "in",
  "Thai (TH)": "th",
  "Turkish (TR)": "tr",
  "Ukrainian (UA)": "ua",
  "Urdu (IN)": "in",
  "Uyghur (CN)": "cn",
  "Uzbek (UZ)": "uz",
  "Vietnamese (VN)": "vn",
  "Welsh (GB)": "gb-wls", // Welsh flag
  "Xhosa (ZA)": "za",
  "Yiddish (IL)": "il",
  "Yoruba (NG)": "ng",
  "Zulu (ZA)": "za"
};

// Regional flag mappings for special cases
const REGIONAL_FLAG_FALLBACKS: Record<string, string> = {
  'es-ct': 'es', // Fallback to Spain for Catalan
  'es-ga': 'es', // Fallback to Spain for Galician
  'gb-sct': 'gb', // Fallback to UK for Scottish Gaelic
  'gb-wls': 'gb', // Fallback to UK for Welsh
  'xx': 'eu' // Fallback to EU flag for Esperanto and other missing flags
};

interface CountryFlagProps {
  language: Language;
  size?: number;
  style?: ImageStyle;
}

const CountryFlag: React.FC<CountryFlagProps> = ({ language, size = 24, style }) => {
  const [imageError, setImageError] = useState(false);
  const countryCode = LANGUAGE_TO_FLAG_MAP[language] || 'xx';
  
  // Determine the correct code to use
  let code = countryCode.toLowerCase();
  
  // Check if we need to use a fallback for regional flags
  if (REGIONAL_FLAG_FALLBACKS[code]) {
    code = REGIONAL_FLAG_FALLBACKS[code];
  } else if (code.includes('-')) {
    // If it's a regional code not in our fallbacks, use the main country code
    code = code.split('-')[0];
  }
  
  // Use flagcdn.com which provides reliable PNG images for standard country codes
  const flagUrl = `https://flagcdn.com/w80/${code}.png`;

  // If the image fails to load, show a text fallback
  if (imageError) {
    // Convert ImageStyle to ViewStyle for the fallback view by creating a new object
    const viewStyle: ViewStyle = {
      width: size,
      height: size * 0.6,
      borderRadius: 2,
      borderWidth: 0.5,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    };
    
    return (
      <View style={viewStyle}>
        <Text style={{ fontSize: size * 0.4, color: '#666' }}>
          {code.toUpperCase()}
        </Text>
      </View>
    );
  }
  
  return (
    <Image
      source={{ uri: flagUrl }}
      style={[
        {
          width: size,
          height: size * 0.6, // Maintain aspect ratio
          borderRadius: 2,
          borderWidth: 0.5,
          borderColor: 'rgba(0, 0, 0, 0.1)',
        },
        style
      ]}
      resizeMode="cover"
      onError={() => setImageError(true)}
    />
  );
};

export default CountryFlag; 