'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import IconSave from '@/components/icon/icon-save';
import IconCircleCheck from '@/components/icon/icon-circle-check';
import SectionHeader from '@/components/utils/SectionHeader';
import FeatureService from '@/services/FeatureService';
import { getTranslation } from '@/i18n';

const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

interface FeatureFormValues {
    name: string;
    slug: string;
    status: 'draft' | 'published';
    mandatory: boolean;
}

interface Feature {
    id: number;
    name: string;
    slug: string;
    status: 'draft' | 'published';
    mandatory: boolean;
}

const UpdateFeatureComponent = ({ featureId }: { featureId: number }) => {
    const { t, i18n } = getTranslation();
    const formikRef = useRef<any>(null);
    const [progress, setProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [initialValues, setInitialValues] = useState<FeatureFormValues | null>(null);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    useEffect(() => {
        const fetchFeature = async () => {
            const response = await FeatureService.getFeatureById(featureId, i18n.language);
            if (response) {
                setInitialValues({
                    name: response.name,
                    slug: response.slug,
                    status: response.status,
                    mandatory: response.mandatory, // ✅ Include mandatory field in initial values
                });
            }
        };
        fetchFeature();
    }, [featureId]);

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

    const handleSubmit = async (values: FeatureFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        Swal.fire({ title: 'Updating Feature...', html: renderProgressHtml(0, 'Initializing...'), showConfirmButton: false });

        const response = await FeatureService.updateFeature({ ...values, id: featureId, lang: i18n.language });

        if (response) {
            Swal.fire({ icon: 'success', title: 'Feature Updated Successfully!' }).then(() => {
                window.location.href = '/feature/list';
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update feature.' });
        }
        setSubmitting(false);
    };

    if (!initialValues) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                <SectionHeader title="Edit Feature" />
                <div className="px-4 w-100">
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ values, setFieldValue }) => (
                            <Form className="space-y-5">
                                <div>
                                    <label htmlFor="name">Name</label>
                                    <Field name="name" type="text" className="form-input" />
                                    <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
                                </div>

                                {/* ✅ Toggle Button for Mandatory Field */}
                                <div>
                                    <label htmlFor="mandatory">Mandatory</label>
                                    <label className="w-12 h-6 relative">
                                        <input
                                            type="checkbox"
                                            className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                            checked={values.mandatory}
                                            onChange={() => setFieldValue('mandatory', !values.mandatory)} // ✅ Toggle inside Formik
                                        />
                                        <span className="outline_checkbox bg-icon border-2 border-gray-300 dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-gray-300 dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url('/assets/images/close.svg')] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url('/assets/images/checked.svg')] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-success w-full gap-2">
                                    <IconSave className="shrink-0" /> Save
                                </button>
                            </Form>
                        )}
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

export default UpdateFeatureComponent;
