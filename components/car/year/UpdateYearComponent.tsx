'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import IconSave from '@/components/icon/icon-save';
import IconCircleCheck from '@/components/icon/icon-circle-check';
import SectionHeader from '@/components/utils/SectionHeader';
import YearService from '@/services/YearService';

const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

interface YearFormValues {
  year: number;
  status: 'draft' | 'published';
}

const UpdateYearComponent = ({ yearId }: { yearId: number }) => {
  const formikRef = useRef<any>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [initialValues, setInitialValues] = useState<YearFormValues | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Fetch the existing Year data using the provided `yearId`
  useEffect(() => {
    const fetchYear = async () => {
      const response = await YearService.getYearById(yearId);
      if (response) {
        setInitialValues({
          year: response.year,
          status: response.status,
        });
        setStatus(response.status);
      }
    };
    fetchYear();
  }, [yearId]);

  // Socket progress updates (optional)
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
          title: 'Year Updated Successfully!',
          text: 'The Year has been updated successfully.',
        }).then(() => {
          window.location.href = '/year/list';
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

  // Validation schema for the Year field
  const validationSchema = Yup.object().shape({
    year: Yup.number()
      .typeError('Year must be a number')
      .moreThan(0, 'Year must be greater than 0')
      .required('Please fill the year'),
  });

  const handleSubmit = async (
    values: YearFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    Swal.fire({
      title: 'Updating Year...',
      html: renderProgressHtml(0, 'Initializing...'),
      showConfirmButton: false,
    });
    
    const response = await YearService.updateYear({ ...values, id: yearId });
    console.log(response, "response");
    
    // Check if the response indicates failure
    if (response && response.success === false) {
      Swal.fire({ icon: 'error', title: 'Error', text: response.message || 'Failed to update Year.' });
    } else if (response) {
      Swal.fire({ icon: 'success', title: 'Year Updated Successfully!' }).then(() => {
        window.location.href = '/year/list';
      });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update Year.' });
    }
    setSubmitting(false);
  };

  if (!initialValues) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
        <SectionHeader title="Edit Year" />
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
                <label htmlFor="year">Year</label>
                <Field name="year" type="number" className="form-input" placeholder="Enter Year" />
                <ErrorMessage name="year" component="div" className="mt-1 text-danger" />
              </div>
              <button type="submit" className="btn btn-success w-full gap-2">
                <IconSave className="shrink-0" /> Save
              </button>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default UpdateYearComponent;
