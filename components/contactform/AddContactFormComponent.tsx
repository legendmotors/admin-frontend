'use client';

import React, { useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SectionHeader from '@/components/utils/SectionHeader';
import ContactUsService from '@/services/ContactUsService';

const MySwal = withReactContent(Swal);

interface ContactFormValues {
    name: string;
    phoneNumber?: string;
    emailAddress: string;
    subject: string;
    message: string;
}

const AddContactFormComponent: React.FC = () => {
    const formikRef = useRef<any>(null);

    const initialValues: ContactFormValues = {
        name: '',
        phoneNumber: '',
        emailAddress: '',
        subject: '',
        message: '',
    };

    const ContactSchema = Yup.object().shape({
        name: Yup.string().required('Name is required.'),
        emailAddress: Yup.string()
            .email('Please enter a valid email address.')
            .required('Email is required.'),
        subject: Yup.string().required('Subject is required.'),
        message: Yup.string().required('Your message is required.'),
        phoneNumber: Yup.string(), // Optional
    });

    const handleSubmit = async (
        values: ContactFormValues,
        { setSubmitting }: FormikHelpers<ContactFormValues>
    ) => {
        try {
            Swal.fire({
                title: 'Submitting Your Enquiry...',
                text: 'Please wait.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await ContactUsService.subscribeContact(values);
            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Enquiry Submitted!',
                    text: 'Thank you for contacting us. We will get back to you soon.',
                }).then(() => {
                    window.location.href = '/contact-enquiry/list';
                });
            } else {
                throw new Error(response?.msg || 'Failed to submit enquiry.');
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
            <SectionHeader title="Contact Us" />
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={ContactSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block font-medium">Name</label>
                            <Field name="name" type="text" placeholder="Enter your name" className="form-input" />
                            <ErrorMessage name="name" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="emailAddress" className="block font-medium">Email Address</label>
                            <Field name="emailAddress" type="email" placeholder="Enter your email" className="form-input" />
                            <ErrorMessage name="emailAddress" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block font-medium">Phone Number (optional)</label>
                            <Field name="phoneNumber" type="text" placeholder="Enter your phone number" className="form-input" />
                            <ErrorMessage name="phoneNumber" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block font-medium">Subject</label>
                            <Field name="subject" type="text" placeholder="Enter subject" className="form-input" />
                            <ErrorMessage name="subject" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block font-medium">Your Message</label>
                            <Field as="textarea" name="message" placeholder="Enter your message" className="form-textarea" />
                            <ErrorMessage name="message" component="div" className="text-red-500" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            Submit Enquiry
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddContactFormComponent;
