import { DoctorModel } from '@models/Doctor';
import { PatientModel } from '@models/Patient';
import { AdminModel } from '@models/Admin';

export async function isPhoneNumberTaken(phone: string): Promise<boolean> {
   try {
      const [p, d, a] = await Promise.all([
         PatientModel.exists({ 'intake.phone': phone }),
         DoctorModel.exists({ phone: phone }),
         AdminModel.exists({ phone: phone }),
      ]);
      return !!(p || d || a);
   } catch (err) {
      console.error('DB error while checking phone number:', err);
      throw new Error('Something went wrong checking phone number uniqueness');
   }
}
