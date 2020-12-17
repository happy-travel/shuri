import * as Yup from 'yup';

export const registrationServiceSupplierValidator = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Too short')
        .max(50, 'Too long')
        .required('Required'),
    address: Yup.string()
        .min(2, 'Too short')
        .max(2000, 'Too long')
        .required('Required'),
    postalCode: Yup.string(),
    phone: Yup.string()
        .max(30, 'Too long')
        .required('Required'),
    website: Yup.string()
});
