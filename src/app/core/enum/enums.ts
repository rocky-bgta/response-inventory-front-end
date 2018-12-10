/**
 *Created By: Md. Nazmus Salahin
 *Created Date: 10/6/2017
 *Modified By:
 *Modified date:
 *(C) CopyRight Nybsys ltd.
 */

export enum Status {
    Active = 1,
    Inactive = 2,
    Deleted = 3
}

export enum UserAccessRight {
    Administrator = 1,
    StandardUser = 2,
    Gust = 3
}

export enum UserStatus {
    InvitedUser = 4
}

export enum AddressType {
    StreetAddress = 1,
    PostalAddress
}

export enum ContactType {
    PrimaryContact=1,
    SecondaryContact
}

export enum AccountingBasis {
    Cash=1, Accruals
}

export enum ReportingFrequency {
    Monthly, Quarterly, Annualy
}

export enum QueryType {
    Select = 1,
    Insert = 2,
    Update = 3,
    Delete = 4,
    Raw = 5,
    SequenceGenerator = 6

}

export enum SubscriptionStatus {
    Active=1,
    Inactive,
    Block
}


//export const Enums = [AddressType,ContactType];
