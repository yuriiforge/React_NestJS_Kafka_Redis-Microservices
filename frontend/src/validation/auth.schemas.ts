import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Required'),
});

export const registerSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  username: Yup.string().min(3, 'Min 3 characters').required('Required'),
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Required'),
});
