'use client';

import React, { useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

import SectionHeader from '@/components/utils/SectionHeader';
import NewsletterService from '@/services/NewsletterService';



interface NewsletterFormValues {
    email: string;
}

const AddNewsletterComponent: React.FC = () => {
    const formikRef = useRef<any>(null);

    const initialValues: NewsletterFormValues = {
        email: '',
    };

    const NewsletterSchema = Yup.object().shape({
        email: Yup.string().email('Please enter a valid email address.').required('Email is required.'),
    });

    const handleSubmit = async (
        values: NewsletterFormValues,
        { setSubmitting }: FormikHelpers<NewsletterFormValues>
    ) => {
        try {
            Swal.fire({
                title: 'Subscribing...',
                text: 'Please wait.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await NewsletterService.subscribeNewsletter(values);
            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Subscribed!',
                    text: 'You have been subscribed to our newsletter.',
                }).then(() => {
                    window.location.href = '/newsletter/list';
                });
            } else {
                throw new Error(response?.msg || 'Failed to subscribe.');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4">
            <SectionHeader title="Subscribe to our Newsletter" />
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={NewsletterSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block font-medium">Email</label>
                            <Field
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                className="form-input"
                            />
                            <ErrorMessage name="email" component="div" className="text-red-500" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            Subscribe
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddNewsletterComponent;
