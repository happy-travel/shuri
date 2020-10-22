import * as Yup from 'yup';

export const registrationManagerValidator = Yup.object().shape({
    firstName: Yup.string()
        .max(50, 'Too long')
        .required('Required'),
    lastName: Yup.string()
        .max(50, 'Too long')
        .required('Required'),
    title: Yup.string()
        .required('Required'),
    position: Yup.string()
        .required('Required')
});
