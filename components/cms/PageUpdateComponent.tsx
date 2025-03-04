'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import IconSave from '@/components/icon/icon-save';
import IconCircleCheck from '@/components/icon/icon-circle-check';
import SectionHeader from '@/components/utils/SectionHeader';
import PagesService from '@/services/PagesService';
import { getTranslation } from '@/i18n';

const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

interface PageFormValues {
    title: string;
}

interface Page {
    id: number;
    name: string
}

const PageUpdateComponent = ({ pageId }: { pageId: number }) => {
    const { t, i18n } = getTranslation();
    const formikRef = useRef<any>(null);
    const [progress, setProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [initialValues, setInitialValues] = useState<PageFormValues | null>(null);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    useEffect(() => {
        const fetchPage = async () => {
            const response = await PagesService.getPageById(pageId, i18n.language);

            console.log(response, "response");

            if (response) {
                setInitialValues({
                    title: response?.data?.title
                });
            }
        };
        fetchPage();
    }, [pageId]);

    const renderProgressHtml = (progress: number, message: string) => `
        <div class="mb-5 space-y-5">
            <div class="w-full h-4 bg-gray-200 rounded-full">
                <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">${progress}%</div>
            </div>
            <p class="text-center">${message}</p>
        </div>
    `;

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Please fill the name'),
    });

    const handleSubmit = async (values: PageFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        Swal.fire({ title: 'Updating Page...', html: renderProgressHtml(0, 'Initializing...'), showConfirmButton: false });

        const response = await PagesService.updatePage({ ...values, id: pageId, lang: i18n.language });

        if (response) {
            Swal.fire({ icon: 'success', title: 'Page Updated Successfully!' }).then(() => {
                window.location.href = '/page/list';
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update Page.' });
        }
        setSubmitting(false);
    };

    if (!initialValues) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                <SectionHeader title="Edit Page" />
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
                                    <Field name="title" type="text" className="form-input" />
                                    <ErrorMessage name="title" component="div" className="mt-1 text-danger" />
                                </div>


                                <button type="submit" className="btn btn-success w-full gap-2">
                                    <IconSave className="shrink-0" /> Save
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

        </div>
    );
};

export default PageUpdateComponent;
