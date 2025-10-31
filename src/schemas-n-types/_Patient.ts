import { DateTime } from 'luxon';

import {
   strictObject,
   boolean,
   string,
   literal,
   optional,
   pipe,
   trim,
   regex,
   transform,
   minValue,
   union,
   maxValue,
   maxLength,
   nonEmpty,
   custom,
   check,
   number,
   integer,
   array,
   never,
   isoDate,
   parse,
   InferOutput,
} from 'valibot';

import {
   baseString,
   dateInThePastOrOptionallyToday,
   dateInTheFutureOrOptionallyToday,
   idOrName,
   objectIdFormatCheck,
   positiveInteger,
   dateFromString,
   rangedFloatW2Decimals,
   nameString,
   validateDOB,
   addressVSchema,
   phoneVSchema,
   emailVSchema,
   validateNANPPhoneNumber,
} from '@schemas/__helpers.ts';

import {
   encounterType,
   encounterVisitOption,
   provinceOrTerritory,
   month,
   enrollmentStatus,
   patientStatus,
   preferredLanguage,
   preferredPrefix,
   preferredSuffix,
   sex,
   educationLevel,
   housingSituationVariant,
   smokingStatus,
   alcoholUseLevel,
   substanceUseLevel,
   familyRelationship,
   bloodType,
   medSeverityLevel,
} from '@ssot/constants.ts';

import {
   _prescriptionVSchema,
   _medVSchema,
} from '@/schemas-n-types/_Medication-Prescription';

// --------------------------------------------------------------------------

const _baseEncounterVSchema = strictObject({
   id: baseString,
   date: dateFromString,
   type: encounterType,
   providerId: pipe(
      array(objectIdFormatCheck, 'Must be an array (valibot)'),
      nonEmpty()
   ),
   chiefComplaint: optional(baseString),
   notes: optional(baseString),
   diagnoses: optional(
      array(
         strictObject({
            code: baseString, // futher narrowing needed (ICD-10 or OHIP codes)
            description: baseString,
         })
      )
   ),
   vitals: optional(
      strictObject({
         systolicBP: optional(positiveInteger),
         diastolicBP: optional(positiveInteger),
         heartRate: optional(positiveInteger),
         respiratoryRate: optional(positiveInteger),
         temperatureC: optional(
            rangedFloatW2Decimals({ min: 30, max: 50, field: 'Temperature' })
         ),
         oxygenSaturation: optional(
            rangedFloatW2Decimals({
               min: 0,
               max: 100,
               field: 'Oxygen saturation',
            })
         ),
         heightCm: optional(
            rangedFloatW2Decimals({
               min: 0,
               max: 300,
               field: 'Height',
            })
         ),
         weightKg: optional(
            rangedFloatW2Decimals({
               min: 0,
               max: 200,
               field: 'Weight',
            })
         ),
      })
   ),
   prescriptions: optional(array(_prescriptionVSchema)),
});

const _initialEncounterVSchema = strictObject({
   ..._baseEncounterVSchema.entries,
   visit: encounterVisitOption,
   isFollowUpOf: never(),
});

const _followUpEncounterVSchema = strictObject({
   ..._baseEncounterVSchema.entries,
   visit: literal('follow-up'),
   isFollowUpOf: objectIdFormatCheck,
});

// --------------------------------------------------------------------------

const _CreatePatientVSchema = strictObject({
   _verified: boolean('boolean is required (valibot)'),

   // Core identifiers
   healthCardNumber: pipe(
      baseString,
      transform(input => input.replace(/\D/g, '')),
      regex(/^[0-9]{10}$/, 'Must be exactly 10 digits (valibot)')
   ),
   healthCardVersion: pipe(
      baseString,
      transform(input => input.toUpperCase()),
      regex(/^[A-Z]{2}$/, 'Must be two letters (valibot)')
   ),
   healthCardProvince: provinceOrTerritory,
   healthCardExpiryDate: strictObject({
      year: pipe(
         baseString
         // logic
      ),
      month: pipe(baseString, month),
   }),
   chartNumber: pipe(
      baseString,
      regex(
         /^[A-Za-z0-9-]{10}$/,
         'Must be 10 letters, numbers, or hyphens (valibot)'
      )
   ),
   primaryCareProvider: union(
      [objectIdFormatCheck, literal('unspecified')],
      'Preferred doctor must be a valid doctor ID or "unspecified" (valibot)'
   ),
   enrolledToProviderId: objectIdFormatCheck,
   enrolledStatus: enrollmentStatus,
   enrollmentDate: dateInThePastOrOptionallyToday,
   enrollmentTerminationDate: optional(pipe(dateInThePastOrOptionallyToday)),
   enrollmentTerminationReason: optional(baseString),

   // Social Insurance
   insurance: optional(
      strictObject({
         provider: baseString,
         policyNumber: baseString,
         groupNumber: optional(baseString),
         expiryDate: optional(dateInTheFutureOrOptionallyToday),
      })
   ),

   // Patient's Status
   status: patientStatus,

   // Preferences
   preferredLanguage: preferredLanguage,
   interpreterNeeded: optional(boolean()),

   // Demographics
   firstName: nameString,
   prefix: optional(preferredPrefix),
   middleName: optional(nameString),
   lastName: nameString,
   suffix: optional(preferredSuffix),
   dateOfBirth: validateDOB,
   sexAtBirth: sex,
   currentSex: sex,

   socialHistory: optional(
      strictObject({
         occupation: baseString,
         education: educationLevel,
         housingSituation: housingSituationVariant,
         smokingStatus: smokingStatus,
         alcoholUse: alcoholUseLevel,
         substanceUse: substanceUseLevel,
      })
   ),
   familyHistory: optional(
      array(
         strictObject({
            relationship: familyRelationship,
            condition: baseString,
            ageAtDiagnosis: optional(positiveInteger),
            deceased: optional(boolean()),
            notes: optional(baseString),
         })
      )
   ),
   accessibilityNeeds: optional(
      strictObject({
         mobilityAssistance: optional(boolean()),
         wheelchairAccess: optional(boolean()),
         hearingImpairment: optional(boolean()),
         visualImpairment: optional(boolean()),
         notes: optional(baseString),
      })
   ),

   // Contact Information
   addresses: addressVSchema,
   phones: phoneVSchema,
   email: optional(emailVSchema),

   // Clinical Information
   doctor: union([objectIdFormatCheck, literal('unspecified')]),
   bloodType: bloodType,
   medications: array(
      strictObject({
         id: baseString,
         name: baseString,
         code: optional(baseString),
         strength: optional(baseString),
         form: optional(baseString),
         dose: optional(baseString),
         route: optional(baseString),
         frequency: optional(baseString),
         startDate: dateInThePastOrOptionallyToday,
         endDate: optional(dateInThePastOrOptionallyToday),
         status: _medVSchema,
         instructions: optional(baseString),
         prescribedById: union([objectIdFormatCheck, literal('unknown')]),
         notes: optional(baseString),
      })
   ),
   allergies: array(
      strictObject({
         substance: baseString,
         reaction: baseString,
         severity: medSeverityLevel,
         dateDiscovered: optional(dateFromString),
      })
   ),
   immunizations: array(
      strictObject({
         name: baseString,
         code: optional(baseString),
         type: optional(baseString),
         manufacturer: baseString,
         lotNumber: baseString,
         route: baseString,
         site: baseString,
         dose: optional(baseString),
         dateAdministered: dateInThePastOrOptionallyToday,
         refusedDate: optional(dateInThePastOrOptionallyToday),
         refused: optional(boolean()),
         notes: optional(baseString),
      })
   ),
   surgicalHistory: array(
      strictObject({
         procedure: baseString,
         date: dateInThePastOrOptionallyToday,
         performedBy: optional(pipe(array(objectIdFormatCheck), nonEmpty())),
         hospital: optional(baseString),
      })
   ),
   pastMedicalHistory: array(
      strictObject({
         diagnosis: baseString,
         code: baseString,
         condition: baseString,
         severity: medSeverityLevel,
         startDate: dateInThePastOrOptionallyToday,
         endDate: optional(dateInThePastOrOptionallyToday),
         diagnosedBy: baseString,
         treatment: optional(baseString),
         relatedConditions: optional(array(baseString)),
         notes: optional(baseString),
      })
   ),
   consents: array(
      strictObject({
         type: union([
            literal('registration'),
            literal('treatment'),
            literal('communication'),
         ]),
         granted: optional(boolean()),
         date: dateInThePastOrOptionallyToday,
         method: union([
            literal('online'),
            literal('verbal'),
            literal('paper'),
         ]),
         recordedBy: optional(objectIdFormatCheck),
      })
   ),

   // Emergency Contacts
   emergencyContacts: array(
      strictObject({
         name: nameString,
         relationship: familyRelationship,
         phone: validateNANPPhoneNumber,
      })
   ),
   nextOfKin: optional(
      strictObject({
         name: nameString,
         relationship: familyRelationship,
         phone: validateNANPPhoneNumber,
      })
   ),

   // Encounters
   encounters: array(
      union([_initialEncounterVSchema, _followUpEncounterVSchema]),
      'Encounters must be an array of initial or follow-up types (valibot)'
   ),
});

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
