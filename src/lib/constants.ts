export const SEVERITIES = {
   LOW: 'low',
   MEDIUM: 'medium',
   HIGH: 'high',
} as const;

export const GENDERS = {
   MALE: 'male',
   FEMALE: 'female',
   OTHER: 'other',
} as const;

export const BLOOD_TYPES = {
   O_POS: 'O+',
   O_NEG: 'O-',
   A_POS: 'A+',
   A_NEG: 'A-',
   B_POS: 'B+',
   B_NEG: 'B-',
   AB_POS: 'AB+',
   AB_NEG: 'AB-',
   UNKNOWN: 'unknown',
} as const;

export type Severity = (typeof SEVERITIES)[keyof typeof SEVERITIES];
export type Gender = (typeof GENDERS)[keyof typeof GENDERS];
export type BloodTypes = (typeof BLOOD_TYPES)[keyof typeof BLOOD_TYPES];

export const LEGAL_AGE_MIN = 18;
export const LEGAL_AGE_MAX = 120;

export const NANP_NUMBER_REGEX = /^1?[2-9]\d{2}[2-9]\d{6}$/;
export const VALID_EMAIL_REGEX =
   /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const CANADIAN_POSTAL_CODE_REGEX =
   /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/i;

export const EMBEDDED_ARRAY_FIELDS = [
   'emergencyContacts', // capped at 3 elements
   'relatedConditions', // capped at 10 elements
] as const;
