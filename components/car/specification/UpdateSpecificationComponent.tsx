'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import IconSave from '@/components/icon/icon-save';
import IconCircleCheck from '@/components/icon/icon-circle-check';
import SectionHeader from '@/components/utils/SectionHeader';
import SpecificationService from '@/services/SpecificationService';
import { getTranslation } from '@/i18n';

const socket = io('ws://localhost:4000');

interface SpecificationFormValues {
    name: string;
    slug: string;
    status: 'draft' | 'published';
}

interface Specification {
    id: number;
    name: string;
    slug: string;
    status: 'draft' | 'published';
}

const UpdateSpecificationComponent = ({ specificationId }: { specificationId: number }) => {
    const { t, i18n } = getTranslation();
    const formikRef = useRef<any>(null);
    const [progress, setProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [initialValues, setInitialValues] = useState<SpecificationFormValues | null>(null);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    useEffect(() => {
        const fetchSpecification = async () => {
            const response = await SpecificationService.getSpecificationById(specificationId, i18n.language);
            if (response) {
                setInitialValues({
                    name: response.name,
                    slug: response.slug,
                    status: response.status,
                });
                setStatus(response.status);
            }
        };
        fetchSpecification();
    }, [specificationId]);

    useEffect(() => {
        const progressHandler = (data: { progress: number; message: string; status: string }) => {
            if (data.progress) setProgress(data.progress);
            if (data.message) setStatusMessage(data.message);

            Swal.update({
                html: renderProgressHtml(data.progress, data.message),
            });

            if (data.progress === 100 && data.status === 'completed') {
                Swal.fire({
                    icon: 'success',
                    title: 'Specification Updated Successfully!',
                    text: 'The specification has been updated successfully.',
                }).then(() => {
                    window.location.href = '/specification/list';
                });

                socket.off('progress', progressHandler);
                setTimeout(() => {
                    setProgress(0);
                    setStatusMessage('');
                }, 2000);
            }
        };

        socket.on('progress', progressHandler);
        return () => {
            socket.off('progress', progressHandler);
        };
    }, []);

    const renderProgressHtml = (progress: number, message: string) => `
        <div class="mb-5 space-y-5">
            <div class="w-full h-4 bg-gray-200 rounded-full">
                <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">${progress}%</div>
            </div>
            <p class="text-center">${message}</p>
        </div>
    `;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the name'),
    });

    const handleSubmit = async (values: SpecificationFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        Swal.fire({ title: 'Updating Specification...', html: renderProgressHtml(0, 'Initializing...'), showConfirmButton: false });
        const response = await SpecificationService.updateSpecification({ ...values, id: specificationId, lang: i18n.language });
        if (response) {
            Swal.fire({ icon: 'success', title: 'Specification Updated Successfully!' }).then(() => {
                window.location.href = '/specification/list';
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update specification.' });
        }
        setSubmitting(false);
    };

    if (!initialValues) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                <SectionHeader title="Edit Specification" />
                <div className="px-4 w-100">
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        <Form className="space-y-5">
                            <div>
                                <label htmlFor="name">Name</label>
                                <Field name="name" type="text" className="form-input" />
                                <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
                            </div>
                            <button type="submit" className="btn btn-success w-full gap-2">
                                <IconSave className="shrink-0" /> Save
                            </button>
                        </Form>
                    </Formik>
                </div>
            </div>
            <div className="mt-6 w-full xl:mt-0 xl:w-96">
                <div className="panel">
                    <div className="grid grid-cols-1 gap-4">
                        {status === 'draft' && (
                            <button type="button" className="btn btn-secondary w-full" onClick={() => setStatus('published')}>
                                <IconCircleCheck className="shrink-0" /> Publish
                            </button>
                        )}
                        {status === 'published' && (
                            <button type="button" className="btn btn-warning w-full" onClick={() => setStatus('draft')}>
                                <IconCircleCheck className="shrink-0" /> Unpublish
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateSpecificationComponent;
