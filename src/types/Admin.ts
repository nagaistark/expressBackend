import { Gender } from '@lib/constants';
import { IAddress } from '@lib/address';
import { CreateAdminOutput } from '@schemas/Admin';

/* export interface IAdmin {
   firstName: string;
   lastName: string;
   dateOfBirth: string;
   gender: Gender;
   phone: string;
   address: IAddress;
   role: string;
} */

export type IAdmin = CreateAdminOutput;
