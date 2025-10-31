import { union, literal } from 'valibot';

export const min_legal_age = 18;
export const max_legal_age = 130;
export const timeZone = 'America/Toronto';

const enumUnion = <T extends readonly string[]>(arr: T) => {
   return union(
      arr.map(item => literal(item)),
      `Must be one of the ${arr.join(', ')} (valibot)`
   );
};

const months = [
   'JAN',
   'FEB',
   'MAR',
   'APR',
   'MAY',
   'JUN',
   'JUL',
   'AUG',
   'SEP',
   'OCT',
   'NOV',
   'DEC',
] as const;
const provincesAndTerritories = [
   'ON',
   'QC',
   'NS',
   'NB',
   'MB',
   'BC',
   'PE',
   'SK',
   'AB',
   'NL',
   'NT',
   'YT',
   'NU',
] as const;
const typeOfPhones = ['home', 'mobile', 'work', 'other'] as const;
const enrollmentStatuses = [
   'enrolled',
   'pending',
   'inactive',
   'declined',
   'unspecified',
] as const;
const patientStatuses = ['active', 'inactive', 'deseased', 'other'] as const;
const availableLanguages = ['English', 'Français'] as const;
const prefixes = [
   'Mr.',
   'Mrs.',
   'Ms.',
   'Miss',
   'Dr.',
   'Prof.',
   'Rev.',
   'Hon.',
] as const;
const suffixes = [
   'Jr.',
   'Sr.',
   'II',
   'III',
   'IV',
   'MD',
   'PhD',
   'QC',
   'Esq.',
   'CPA',
   'MBA',
] as const;
const sexes = ['male', 'female', 'intersex'] as const;
const smokingStatuses = ['never', 'former', 'current'] as const;
const educationLevels = [
   'none',
   'primary',
   'secondary',
   'college',
   'university',
   'postgraduate',
] as const;
const housingSituationVariants = [
   'stable',
   'temporary',
   'homeless',
   'supported',
   'unknown',
] as const;
const alcoholUseLevels = ['none', 'occasional', 'regular', 'heavy'];
const substanceUseLevels = [
   'none',
   'occasional',
   'regular',
   'dependence',
   'unknown',
] as const;
const familyRelationships = [
   'mother',
   'father',
   'brother',
   'sister',
   'daughter',
   'son',
   'grandmother',
   'grandfather',
   'aunt',
   'uncle',
   'niece',
   'nephew',
   'other',
] as const;
const bloodTypes = [
   'unknown',
   'O+',
   'O-',
   'A+',
   'A-',
   'B+',
   'B-',
   'AB+',
   'AB-',
] as const;
const medicationSources = ['clinic', 'patientReported', 'external'] as const;
export const medicationStatuses = [
   'active',
   'completed',
   'discontinued',
] as const;
const prescriptionStatuses = [
   'draft',
   'signed',
   'dispensed',
   'cancelled',
   'expired',
] as const;
const medSeverityLevels = ['low', 'moderate', 'high'] as const;
const encounterTypes = ['office', 'phone', 'telemedecine'] as const;
const encounterStatuses = ['in-progress', 'completed', 'cancelled'] as const;
const encounterVisitOptions = [
   'initial',
   'follow-up',
   'consult',
   'annual',
   'urgent',
] as const;
const medicationForms = [
   'tablet',
   'capsule',
   'oral solution',
   'oral suspension',
   'topical cream',
   'topical ointment',
   'inhaler',
   'injection',
   'eye drops',
   'ear drops',
   'nasal spray',
] as const;
const medicationRoutes = [
   'oral',
   'sublingual',
   'buccal',
   'topical',
   'transdermal',
   'ophthalmic',
   'otic',
   'nasal',
   'inhalation',
   'intravenous',
   'intramuscular',
   'subcutaneous',
   'intradermal',
   'rectal',
   'vaginal',
   'urethral',
   'intraarticular',
   'intrathecal',
   'epidural',
   'intranasal',
   'intraocular',
   'inhaled (oral)',
   'oral rinse',
   'mouth/throat',
   'other',
] as const;
export const appointmentStatuses = [
   'booked',
   'cancelled',
   'no-show',
   'completed',
] as const;

export const month = enumUnion(months);
export const provinceOrTerritory = enumUnion(provincesAndTerritories);
export const enrollmentStatus = enumUnion(enrollmentStatuses);
export const typeOfPhone = enumUnion(typeOfPhones);
export const patientStatus = enumUnion(patientStatuses);
export const preferredLanguage = enumUnion(availableLanguages);
export const preferredPrefix = enumUnion(prefixes);
export const preferredSuffix = enumUnion(suffixes);
export const sex = enumUnion(sexes);
export const smokingStatus = enumUnion(smokingStatuses);
export const educationLevel = enumUnion(educationLevels);
export const housingSituationVariant = enumUnion(housingSituationVariants);
export const alcoholUseLevel = enumUnion(alcoholUseLevels);
export const substanceUseLevel = enumUnion(substanceUseLevels);
export const familyRelationship = enumUnion(familyRelationships);
export const bloodType = enumUnion(bloodTypes);
export const medicationSource = enumUnion(medicationSources);
export const medicationStatus = enumUnion(medicationStatuses);
export const prescriptionStatus = enumUnion(prescriptionStatuses);
export const medSeverityLevel = enumUnion(medSeverityLevels);
export const encounterType = enumUnion(encounterTypes);
export const encounterVisitOption = enumUnion(encounterVisitOptions);
export const medicationForm = enumUnion(medicationForms);
export const medicationRoute = enumUnion(medicationRoutes);
export const appointmentStatus = enumUnion(appointmentStatuses);
export const encounterStatus = enumUnion(encounterStatuses);
