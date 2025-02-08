import * as Yup from 'yup';

export const brandValidationSchema = Yup.object().shape({
    name: Yup.string().required('Please fill the name').min(1, 'Name must be at least 1 character long'),
    description: Yup.string().optional(),
    metaTitle: Yup.string().optional(),
    metaDescription: Yup.string().optional(),
    metaKeywords: Yup.string().optional(),
    slug: Yup.string().optional(),
});
