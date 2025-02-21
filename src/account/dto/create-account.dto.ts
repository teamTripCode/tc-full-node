export enum AccountType {
  KYC = 'KYC',
  KYB = 'KYB'
}

export enum SideCardId {
    FRONT = 'FRONT',
    BACK = 'BACK'
}

export type IdentityCard = {
    side: SideCardId,
    image: string,

}

export interface KYCData {
  fullName: string;
  identityNumber: string;
  images: IdentityCard[];
  birthDate: string;
  residenceAddress: string;
}

export interface KYBData {
  businessName: string;
  taxId: string;
  legalRepresentative: string;
  commercialRegistration: string;
  businessType: string;
}