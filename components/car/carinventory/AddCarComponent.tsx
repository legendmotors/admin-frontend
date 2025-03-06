'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AsyncPaginate } from 'react-select-async-paginate';
import Select, { SingleValue } from 'react-select';
import Swal from 'sweetalert2';
import io from 'socket.io-client';

// Lightbox Imports
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';

import { IRootState, AppDispatch } from '@/store/index';
import { setStep, setFormData, setImages, setBrochure, resetForm } from '@/store/formSlice';

import IconThumbUp from '@/components/icon/icon-thumb-up';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconGallery from '@/components/icon/icon-gallery';
import SectionHeader from '@/components/utils/SectionHeader';
import RichTextEditor from '@/components/editor/RichTextEditor';

import CarService from '@/services/CarService';
import CarTagService from '@/services/CarTagService';
import { GeBrandDetails, TrimService } from '@/services';
import CarModelService from '@/services/CarModelService';
import YearService from '@/services/YearService';
import SpecificationService from '@/services/SpecificationService';
import FeatureService from '@/services/FeatureService';

import ComponentsDragndropGrid from './ComponentsDragndropGrid';
import BrochureUpload from './BrochureUpload';
import { formatCurrency } from '@/utils/formatCurrency';

// -------------------------
// Interfaces
// -------------------------
interface SpecificationValue {
  value: string | number;
  label: string;
}

interface Specification {
  id: number;
  name: string;
  key: string;
  mandatory: boolean;
  values: SpecificationValue[];
}

interface FeatureValue {
  id: number;
  name: string;
  slug?: string;
}

interface Feature {
  id: number;
  name: string;
  mandatory: boolean;
  values: FeatureValue[];
}

export interface CarImage {
  fileId: string;
  thumbnailPath?: string;
  type?: string; // optional
  order?: number;
}

export interface UploadedFile {
  id: string;
  originalPath?: string;
  filename?: string;
  // other fields as needed
}

interface Tag {
  id: number;
  name: string;
}

interface FormDataType {
  stockId: string;
  brandId: string;
  modelId: string;
  trimId: string;
  year: string;
  price: string | number;
  usdPrice: string | number;
  description: string;
  engineSize: string;
  horsepower: string;
  featured: boolean;
  premium: boolean;
  tags: number[];
  specifications: Record<string, string | number>;
  features: Record<number, string[]>;
  images?: CarImage[];
  brochureId?: string | null;
  additionalInfo: string;
}

// Initialize socket using the correct URL from your env variable
const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

const AddCarComponent: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(resetForm());
  }, [dispatch]);

  // -------------------------
  // Redux states
  // -------------------------
  const currentStep = useSelector((state: IRootState) => state.form.currentStep);
  const formData = useSelector((state: IRootState) => state.form.formData) as FormDataType;
  const images = useSelector((state: IRootState) => state.form.images) as CarImage[];
  const brochureFile = useSelector((state: IRootState) => state.form.brochureFile) as UploadedFile | null;

  // -------------------------
  // Local states
  // -------------------------
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<{ value: number; label: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ value: number; label: string } | null>(null);
  const [selectedTrim, setSelectedTrim] = useState<{ value: number; label: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState<{ value: number; label: string } | null>(null);

  const [tags, setTags] = useState<Tag[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Lightbox state
  const [openLightbox, setOpenLightbox] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [step1Valid, setStep1Valid] = useState<boolean>(false);
  const [step2Valid, setStep2Valid] = useState<boolean>(false);

  // -------------------------
  // Socket cleanup
  // -------------------------
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  // -------------------------
  // Fetch Tags
  // -------------------------
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await CarTagService.listTags({ limit: 100 });
        if (response && response.data) {
          setTags(response.data);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  // -------------------------
  // Reusable fetcher for AsyncPaginate
  // -------------------------
  const fetchData = async (
    serviceFunction: (params: Record<string, any>) => Promise<any>,
    searchQuery = '',
    loadedOptions = [],
    additional = { page: 1 },
    additionalParams: Record<string, any> = {}
  ) => {
    try {
      const params: Record<string, any> = {
        page: additional.page,
        limit: 10,
        status: 'published',
        sortBy: 'name',
        order: 'asc',
        ...additionalParams,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery;
      }

      const response = await serviceFunction(params);
      const newOptions = response.data.map((item: any) => ({
        value: item.id || item.year,
        label: item.name || item.year,
      }));

      const hasMore = response.pagination.currentPage < response.pagination.totalPages;
      return {
        options: newOptions,
        hasMore,
        additional: { page: additional.page + 1 },
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      return { options: [], hasMore: false };
    }
  };

  // AsyncPaginate loaders
  const fetchBrands = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
    return fetchData(GeBrandDetails.listBrand, searchQuery, loadedOptions, additional, {
      hasModels: true,
    });
  };
  const fetchModels = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
    return fetchData(CarModelService.listCarModel, searchQuery, loadedOptions, additional, {
      brandId: selectedBrand?.value || undefined,
    });
  };
  const fetchTrims = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
    return fetchData(TrimService.listTrim, searchQuery, loadedOptions, additional, {
      modelId: selectedModel?.value,
    });
  };
  const fetchYears = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
    return fetchData(YearService.listYear, searchQuery, loadedOptions, additional);
  };

  // -------------------------
  // Fetch Exchange Rate
  // -------------------------
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/AED');
        const data = await response.json();
        setExchangeRate(data.rates.USD);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };
    fetchExchangeRate();
  }, []);

  // -------------------------
  // Fetch Specifications
  // -------------------------
  useEffect(() => {
    const fetchSpecificationsWithValues = async () => {
      try {
        setLoading(true);
        const specsRes = await SpecificationService.listSpecifications({ limit: 0 });
        const specsData = specsRes.data;

        const specsWithValues = await Promise.all(
          specsData.map(async (spec: any) => {
            const valuesRes = await SpecificationService.listSpecificationValues({
              specificationId: spec.id,
              limit: 0,
            });
            const values = valuesRes.data.map((v: any) => ({
              value: v.id,
              label: v.name,
            }));
            return { ...spec, values };
          })
        );

        setSpecifications(specsWithValues);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching specifications:', error);
        setLoading(false);
      }
    };
    fetchSpecificationsWithValues();
  }, []);

  // -------------------------
  // Fetch Features
  // -------------------------
  useEffect(() => {
    const fetchFeaturesWithValues = async () => {
      try {
        const featuresRes = await FeatureService.listFeatures({ limit: 0 });
        const featuresData = featuresRes.data;

        const featuresWithValues = await Promise.all(
          featuresData.map(async (feature: any) => {
            const valuesRes = await FeatureService.listFeatureValues({
              featureId: feature.id,
              limit: 0,
            });
            const values = valuesRes.data.map((v: any) => ({
              id: v.id,
              name: v.name,
              slug: v.slug,
            }));
            return { ...feature, values };
          })
        );

        setFeatures(featuresWithValues);
      } catch (error) {
        console.error('Error fetching features:', error);
      }
    };
    fetchFeaturesWithValues();
  }, []);

  // -------------------------
  // Handle Images + Brochure in Redux
  // -------------------------
  const handleImagesUpdate = (updatedImages: CarImage[]) => {
    if (JSON.stringify(images) !== JSON.stringify(updatedImages)) {
      dispatch(setImages(updatedImages));
    }
  };

  // -------------------------
  // Build Default Form Data
  // -------------------------
  const defaultValues: FormDataType = useMemo(() => {
    return {
      stockId: '',
      brandId: '',
      modelId: '',
      trimId: '',
      year: '',
      price: '',
      usdPrice: '',
      description: '',
      engineSize: '',
      horsepower: '',
      featured: false,
      premium: false,
      tags: [],
      specifications: specifications.reduce((acc, spec) => {
        acc[spec.key] = '';
        return acc;
      }, {} as Record<string, string | number>),
      features: features.reduce((acc, feature) => {
        acc[feature.id] = [];
        return acc;
      }, {} as Record<number, string[]>),
      additionalInfo: '',
    };
  }, [specifications, features]);

  // -------------------------
  // Build Validation Schema
  // -------------------------
  const validationSchema = useMemo(() => {
    return Yup.object({
      stockId: Yup.string().required('The Stock ID is required'),
      brandId: Yup.string().required('The Brand is required'),
      modelId: Yup.string().required('The Model is required'),
      year: Yup.string().required('The Year is required'),
      price: Yup.number()
        .min(1000, 'Price cannot be less than 1000')
        .required('The AED Price is required'),
      usdPrice: Yup.number()
        .min(1000, 'Price cannot be less than 1000')
        .required('The USD Price is required'),
      additionalInfo: Yup.string().required('Additional info is required'),
      specifications: Yup.object().shape(
        specifications.reduce((acc, spec) => {
          if (spec.mandatory) {
            acc[spec.key] = Yup.string().required(`${spec.name} is required`);
          }
          return acc;
        }, {} as Record<string, Yup.StringSchema>)
      ),
      features: Yup.object().shape(
        features.reduce((acc, feature) => {
          if (feature.mandatory) {
            acc[feature.id] = Yup.array()
              .of(Yup.string().required())
              .min(1, `${feature.name} is required`);
          }
          return acc;
        }, {} as Record<number, Yup.ArraySchema<Yup.StringSchema>>)
      ),
    });
  }, [specifications, features]);

  // -------------------------
  // Handle Form Submission (Step 1)
  // -------------------------
  const handleNext = (values: FormDataType) => {
    dispatch(setFormData(values));
    dispatch(setStep(currentStep + 1));
    console.log('Moved to Step:', currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      dispatch(setStep(currentStep - 1));
      console.log('Moved Back to Step:', currentStep - 1);
    }
  };

  // -------------------------
  // Construct Final Payload
  // -------------------------
  const constructFinalPayload = (rawValues: FormDataType) => {
    return {
      stockId: rawValues.stockId || null,
      description: rawValues.description || '',
      status: 'published',
      featured: rawValues.featured || false,
      premium: rawValues.premium || false,
      brandId: selectedBrand?.value || null,
      modelId: selectedModel?.value || null,
      trimId: selectedTrim?.value || null,
      yearId: selectedYear?.value || null,
      engineSize: rawValues.engineSize ? parseFloat(rawValues.engineSize) : null,
      horsepower: rawValues.horsepower ? parseInt(rawValues.horsepower) : null,
      prices: [
        {
          currency: 'AED',
          amount: rawValues.price ? parseFloat(String(rawValues.price)) : 0,
        },
        {
          currency: 'USD',
          amount: rawValues.usdPrice ? parseFloat(String(rawValues.usdPrice)) : 0,
        },
      ],
      specifications: Object.entries(rawValues.specifications)
        .filter(([_, val]) => val !== '')
        .map(([_, specValueId]) => ({
          specificationValueId: specValueId,
        })),
      features: Object.entries(rawValues.features).flatMap(([featureId, arr]) => {
        return (arr as string[]).map((valueId) => ({
          featureValueId: Number(valueId),
        }));
      }),
      images: images.map((img) => ({
        fileId: img.fileId,
        type: img.type,
        order: img.order,
      })),
      tags: rawValues.tags,
      brochureId: brochureFile?.id,
      additionalInfo: rawValues.additionalInfo
    };
  };

  // -------------------------
  // SweetAlert2 Progress
  // -------------------------
  const renderProgressHtml = (progress: number, message: string) => `
    <div class="mb-5 space-y-5">
      <div class="w-full h-4 bg-gray-200 rounded-full">
        <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">${progress}%</div>
      </div>
      <p class="text-center">${message}</p>
    </div>
  `;

  // -------------------------
  // Handle Publish
  // -------------------------
  const handlePublish = async () => {
    try {
      console.log('handlePublish called!');
      // Show initial progress popup
      Swal.fire({
        title: 'Publishing Car...',
        html: renderProgressHtml(0, 'Waiting for progress updates...'),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Listen to socket progress events and update Swal accordingly
      socket.on('progress', (data: any) => {
        const { progress, message } = data;
        Swal.update({
          html: renderProgressHtml(progress, message),
        });
      });

      // Optional small delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Perform the API call
      const payload = constructFinalPayload(formData);
      console.log('Publishing Payload:', payload);
      const response = await CarService.addCar(payload);

      // Unsubscribe from socket progress events once done
      socket.off('progress');

      // Ensure progress shows 100%
      Swal.update({
        html: renderProgressHtml(100, 'Finalizing...'),
      });

      if (response) {
        Swal.fire({
          icon: 'success',
          title: 'Car Published Successfully!',
          text: 'Your car has been added successfully.',
        }).then(() => {
          // Reset Redux state
          dispatch(resetForm());
          // Redirect to inventory list or wherever you want
          window.location.href = '/inventory/list';
        });
      }
    } catch (error) {
      console.error('Error publishing car:', error);
    }
  };

  // -------------------------
  // Preview Helpers (Step 3)
  // -------------------------
  const renderSpecificationsPreview = (): JSX.Element[] => {
    return Object.entries(formData.specifications).map(([specKey, specValueId]) => {
      const spec = specifications.find((s) => s.key === specKey);
      if (!spec) return null as unknown as JSX.Element;

      const valueObj = spec.values.find((v) => String(v.value) === String(specValueId));
      return (
        <li key={specKey} className='mt-3'>
          <strong>{spec.name}:</strong> <span className="badge bg-primary rounded-full">{valueObj ? valueObj.label : specValueId}</span>
        </li>
      );
    }).filter(Boolean) as JSX.Element[];
  };

  const renderFeaturesPreview = (): JSX.Element[] => {
    return Object.entries(formData.features).map(([featureId, valueIds]) => {
      const feature = features.find((f) => String(f.id) === featureId);
      if (!feature) return null as unknown as JSX.Element;

      const labels = (valueIds as string[]).map((vId) => {
        const valObj = feature.values.find((fv) => String(fv.id) === vId);
        return valObj ? valObj.name : vId;
      });

      return (
        <li key={featureId} className='mt-3'>
          <strong>{feature.name}:</strong> <span className="badge bg-primary rounded-full">{labels.join(', ')}</span>
        </li>
      );
    }).filter(Boolean) as JSX.Element[];
  };

  const renderTagsPreview = (): string | JSX.Element => {
    if (!formData.tags || formData.tags.length === 0) return '-';

    const tagNames = formData.tags
      .map((tagId) => {
        const tagObj = tags.find((t) => t.id === tagId);
        return tagObj ? tagObj.name : String(tagId);
      })
      .join(', ');

    return <span className="badge bg-primary rounded-full">{tagNames || '-'}</span>
  };
  // -------------------------
  // Lightbox for Images
  // -------------------------
  const slides = images.map((img) => ({
    src: `${process.env.NEXT_PUBLIC_FILE_PREVIEW_URL}/${img.thumbnailPath}`,
    title: `Image: ${img.fileId}`,
  }));

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setOpenLightbox(true);
  };

  const renderImagesPreview = (): JSX.Element => {
    if (!images || images.length === 0) {
      return <p>No images uploaded.</p>;
    }

    return (
      <div className="flex flex-wrap gap-4 mt-2">
        {images.map((img, index) => (
          <div
            key={index}
            className="w-24 h-24 bg-gray-100 rounded overflow-hidden cursor-pointer"
            onClick={() => handleThumbnailClick(index)}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_FILE_PREVIEW_URL}/${img.thumbnailPath}`}
              alt={`Car Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  const renderBrochurePreview = (): JSX.Element => {
    if (!brochureFile) {
      return <p>No brochure uploaded.</p>;
    }

    const pdfUrl = `${process.env.NEXT_PUBLIC_FILE_PREVIEW_URL}${brochureFile.originalPath}`;

    return (
      <div className="mt-2">
        <p className="mb-2">
          <strong>Filename:</strong> {brochureFile.filename || 'Car Brochure'}
        </p>
        <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    );
  };

  // -------------------------
  // Render
  // -------------------------
  if (loading) {
    return <p>Loading specifications...</p>;
  }

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
        <SectionHeader title="Add Car Details" />
        <div className="mb-5">
          <div className="inline-block w-full">
            {/* Stepper / Tabs */}
            <div className="relative z-[1]">
              <div
                className={`${currentStep === 1
                  ? 'w-[15%]'
                  : currentStep === 2
                    ? 'w-[48%]'
                    : currentStep === 3
                      ? 'w-[81%]'
                      : ''
                  } absolute top-[30px] -z-[1] m-auto h-1 bg-primary transition-[width] ltr:left-0 rtl:right-0`}
              ></div>
              <ul className="mb-5 grid grid-cols-3">
                {/* Step 1 */}
                <li className="mx-auto">
                  <button
                    type="button"
                    onClick={() => dispatch(setStep(1))}
                    className={`${currentStep === 1 ? '!border-primary !bg-primary text-white' : ''
                      } flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                  >
                    <IconMenuForms className="h-7 w-7" />
                  </button>
                  <span className={`${currentStep === 1 ? 'text-primary ' : ''}text-center mt-2 block`}>
                    Car Details
                  </span>
                </li>

                {/* Step 2 */}
                <li className="mx-auto">
                  <button
                    type="button"
                    onClick={() => step1Valid && dispatch(setStep(2))} // <--- only allow if step1Valid
                    disabled={!step1Valid}                            // <--- disable if step1Valid is false
                    className={`${currentStep === 2 ? '!border-primary !bg-primary text-white' : ''
                      } flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]
        ${!step1Valid ? 'cursor-not-allowed ' : ''}`}
                  >
                    <IconGallery className="h-7 w-7" />
                  </button>
                  <span className={`${currentStep === 2 ? 'text-primary ' : ''}text-center mt-2 block`}>
                    Photos &amp; Assets
                  </span>
                </li>

                {/* Step 3 */}
                <li className="mx-auto">
                  <button
                    type="button"
                    onClick={() => step1Valid && step2Valid && dispatch(setStep(3))} // only if prior steps are valid
                    disabled={!step1Valid || !step2Valid}
                    className={`${currentStep === 3 ? '!border-primary !bg-primary text-white' : ''
                      } flex h-16 w-16 items-center justify-center rounded-full border-[3px] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]
        ${(!step1Valid || !step2Valid) ? 'cursor-not-allowed ' : ''}`}
                  >
                    <IconThumbUp className="h-7 w-7" />
                  </button>
                  <span className={`${currentStep === 3 ? 'text-primary ' : ''}text-center mt-2 block`}>
                    Publish
                  </span>
                </li>
              </ul>
            </div>


            {/* Form Steps */}
            <div className="px-4 w-100">
              {/* STEP 1: CAR DETAILS */}
              {currentStep === 1 && (
                <Formik
                  initialValues={{ ...defaultValues, ...formData }}
                  validationSchema={validationSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    console.log('No validation errors; proceed to next step');
                    setStep1Valid(true);
                    handleNext(values);
                    setSubmitting(false);
                  }}
                  enableReinitialize={true}
                >
                  {({ values, setFieldValue, errors, submitCount }) => (
                    <Form className="space-y-8 mt-2">
                      {/* TAGS */}
                      <div className="border rounded-[15px] px-5 pt-5 pb-3 relative">
                        <h2 className="text-lg font-bold absolute top-[-14px] bg-white px-1">
                          SELECT TAGS
                        </h2>
                        <Field name="tags">
                          {({ field, form }: any) => (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                              {tags.map((tag) => (
                                <div key={tag.id} className="flex items-center">
                                  <label className="inline-flex">
                                    <input
                                      type="checkbox"
                                      className="form-checkbox"
                                      checked={field.value.includes(tag.id)}
                                      onChange={() => {
                                        if (field.value.includes(tag.id)) {
                                          const newValue = field.value.filter(
                                            (tId: number) => tId !== tag.id
                                          );
                                          form.setFieldValue('tags', newValue);
                                        } else {
                                          form.setFieldValue('tags', [...field.value, tag.id]);
                                        }
                                      }}
                                    />
                                    <span className="ml-1">{tag.name}</span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </Field>
                      </div>

                      {/* GENERAL CAR DETAILS */}
                      <div className="border rounded-[15px] p-5 relative space-y-6">
                        <h2 className="text-lg font-bold absolute top-[-14px] bg-white px-1">
                          GENERAL CAR DETAILS
                        </h2>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div>
                            <label className="block font-medium">Stock ID</label>
                            <Field
                              type="text"
                              name="stockId"
                              placeholder="Add your own ID"
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            />
                            <ErrorMessage
                              name="stockId"
                              component="div"
                              className="absolute text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label htmlFor="brandId">Select Brand</label>
                            <AsyncPaginate
                              isClearable
                              loadOptions={fetchBrands}
                              debounceTimeout={300}
                              additional={{ page: 1 }}
                              value={selectedBrand}
                              onChange={(option: SingleValue<{ value: number; label: string }>) => {
                                setSelectedBrand(option);
                                setFieldValue('brandId', option?.value || '');
                                // Reset dependent selects
                                setSelectedModel(null);
                                setSelectedTrim(null);
                                setSelectedYear(null);
                              }}
                              placeholder="Search and select a brand"
                            />
                            <ErrorMessage name="brandId" component="div" className="mt-1 text-danger" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div>
                            <label htmlFor="modelId">Select Model</label>
                            <AsyncPaginate
                              isClearable
                              key={`model-${selectedBrand?.value || 'default'}`}
                              loadOptions={fetchModels}
                              debounceTimeout={300}
                              additional={{ page: 1 }}
                              cacheUniq={selectedBrand?.value}
                              value={selectedModel}
                              onChange={(option: SingleValue<{ value: number; label: string }>) => {
                                setSelectedModel(option);
                                setFieldValue('modelId', option?.value || '');
                                // Reset dependent selects
                                setSelectedTrim(null);
                                setSelectedYear(null);
                              }}
                              placeholder="Search and select a model"
                              isDisabled={!selectedBrand}
                            />
                            <ErrorMessage name="modelId" component="div" className="mt-1 text-danger" />
                          </div>
                          <div>
                            <label htmlFor="trimId">Select Trim</label>
                            <AsyncPaginate
                              isClearable
                              key={`trim-${selectedModel?.value || 'default'}`}
                              loadOptions={fetchTrims}
                              debounceTimeout={300}
                              additional={{ page: 1 }}
                              cacheUniq={selectedModel?.value}
                              value={selectedTrim}
                              onChange={(option: SingleValue<{ value: number; label: string }>) => {
                                setSelectedTrim(option);
                                setFieldValue('trimId', option?.value || '');
                                setSelectedYear(null);
                              }}
                              placeholder="Search and select a trim"
                              isDisabled={!selectedModel}
                            />
                            <ErrorMessage name="trimId" component="div" className="mt-1 text-danger" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div>
                            <label htmlFor="year">Select Year</label>
                            <AsyncPaginate
                              isClearable
                              loadOptions={fetchYears}
                              debounceTimeout={300}
                              additional={{ page: 1 }}
                              value={selectedYear}
                              onChange={(option: SingleValue<{ value: number; label: string }>) => {
                                setSelectedYear(option);
                                setFieldValue('year', option?.value || '');
                              }}
                              placeholder="Search and select a year"
                            />
                            <ErrorMessage name="year" component="div" className="mt-1 text-danger" />
                          </div>
                        </div>
                        <div >
                          <label className="block font-medium mb-1">Additional Info</label>
                          <Field
                            type="text"
                            name="additionalInfo"
                            placeholder="Enter additional info"
                            className="border border-gray-300 rounded px-3 py-2 w-full"
                          />
                          <ErrorMessage
                            name="additionalInfo"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="border rounded-[15px] p-5 relative">
                        <h2 className="text-lg font-bold absolute top-[-14px] bg-white px-1">
                          CAR PRICE
                        </h2>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div>
                            <label className="block font-medium">Price in AED</label>
                            <Field
                              type="text"
                              name="price"
                              placeholder="Enter price in AED"
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                              value={values.price ? formatCurrency(values.price) : ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (!isNaN(Number(rawValue))) {
                                  setFieldValue('price', rawValue);
                                  if (exchangeRate) {
                                    setFieldValue('usdPrice', Math.round(Number(rawValue) * exchangeRate));
                                  }
                                }
                              }}
                            />
                            <ErrorMessage
                              name="price"
                              component="div"
                              className="absolute text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label className="block font-medium">Price in USD</label>
                            <Field
                              type="text"
                              name="usdPrice"
                              placeholder="Enter price in USD"
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                              value={values.usdPrice ? formatCurrency(values.usdPrice) : ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (!isNaN(Number(rawValue))) {
                                  setFieldValue('usdPrice', rawValue);
                                }
                              }}
                            />
                            <ErrorMessage
                              name="usdPrice"
                              component="div"
                              className="absolute text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SPECIFICATIONS */}
                      <div className="border rounded-[15px] p-5 relative">
                        <h2 className="text-lg font-bold absolute top-[-14px] bg-white px-1">
                          SPECIFICATIONS
                        </h2>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                          {specifications.map((spec) => (
                            <div key={spec.id}>
                              <label className="block font-medium mb-1">
                                {spec.name}{' '}
                                {spec.mandatory && <span className="text-red-500">*</span>}
                              </label>
                              <Field name={`specifications.${spec.key}`}>
                                {({ field, form }: any) => (
                                  <Select
                                    options={spec.values}
                                    placeholder={`Select ${spec.name}`}
                                    value={
                                      spec.values.find(
                                        (option) => String(option.value) === String(field.value)
                                      ) || null
                                    }
                                    onChange={(selectedOption: any) => {
                                      form.setFieldValue(
                                        `specifications.${spec.key}`,
                                        selectedOption?.value || ''
                                      );
                                    }}
                                    isClearable
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name={`specifications.${spec.key}`}
                                component="div"
                                className="text-red-500 text-sm"
                              />
                            </div>
                          ))}
                          <div>
                            <label className="block font-medium mb-1">Engine Size (Liters)</label>
                            <Field
                              type="text"
                              name="engineSize"
                              placeholder="Enter engine size"
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            />
                            <ErrorMessage
                              name="engineSize"
                              component="div"
                              className="absolute text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label className="block font-medium mb-1">Horsepower</label>
                            <Field
                              type="text"
                              name="horsepower"
                              placeholder="Enter horsepower"
                              className="border border-gray-300 rounded px-3 py-2 w-full"
                            />
                            <ErrorMessage
                              name="horsepower"
                              component="div"
                              className="absolute text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DESCRIPTION */}
                      <div className="border rounded-[15px] p-5 relative">
                        <h2 className="text-lg font-bold absolute top-[-14px] bg-white px-1">
                          DESCRIPTION
                        </h2>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                          <Field name="description">
                            {({ field, form }: any) => (
                              <RichTextEditor
                                initialValue={field.value}
                                onChange={(newContent) =>
                                  form.setFieldValue('description', newContent)
                                }
                              />
                            )}
                          </Field>
                          {submitCount &&
                            (typeof errors.description === 'string' ? (
                              <div className="mt-1 text-danger">{errors.description}</div>
                            ) : (
                              <div className="mt-1 text-success">Looks Good!</div>
                            ))}
                        </div>
                      </div>

                      {/* FEATURES */}
                      {features.map((feature) => (
                        <div key={feature.id} className="mb-5">
                          <div className="border rounded-[15px] p-5 relative">
                            <h2 className="text-lg font-bold absolute top-[-14px] bg-white px-1">
                              {feature.name}{' '}
                              {feature.mandatory && <span className="text-red-500">*</span>}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {feature.values.map((value) => (
                                <div key={value.id} className="flex items-center">
                                  <Field
                                    type="checkbox"
                                    name={`features.${feature.id}`}
                                    value={String(value.id)}
                                    as="input"
                                    className="form-checkbox"
                                    id={`feature-${feature.id}-value-${value.id}`}
                                  />
                                  <label
                                    htmlFor={`feature-${feature.id}-value-${value.id}`}
                                    className="ml-2"
                                  >
                                    {value.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <ErrorMessage
                              name={`features.${feature.id}`}
                              component="div"
                              className="text-red-500 text-sm"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between">
                        {currentStep > 1 && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleBack}
                          >
                            Back
                          </button>
                        )}
                        <button type="submit" className="btn btn-primary ltr:ml-auto rtl:mr-auto">
                          {currentStep === 1 ? 'Next' : 'Finish'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}

              {/* STEP 2: IMAGES & BROCHURE */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Upload Car Assets</h2>
                  <ComponentsDragndropGrid
                    onImagesUpdate={handleImagesUpdate}
                    initialImages={images}
                  />
                  <BrochureUpload
                    onFileUpload={(file) => dispatch(setBrochure(file))}
                    initialFile={brochureFile}
                  />
                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const transformedImages = images.map((img) => ({
                          fileId: img.fileId,
                          type: img.type,
                          order: img.order,
                        }));
                        dispatch(
                          setFormData({
                            ...formData,
                            images: transformedImages,
                            brochureId: brochureFile?.id || null,
                          })
                        );
                        dispatch(setStep(currentStep + 1));
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PREVIEW & PUBLISH */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Review &amp; Publish</h2>
                  <div className="border rounded p-5 mb-5">
                    <h3 className="text-xl font-bold mb-2">General Car Details</h3>
                    <p>
                      <strong>Stock ID:</strong> {formData.stockId || '-'}
                    </p>
                    <p>
                      <strong>Brand:</strong> {selectedBrand?.label || '-'}{' '}
                      <br />
                      <strong>Model:</strong> {selectedModel?.label || '-'}{' '}
                      <br />
                      <strong>Trim:</strong> {selectedTrim?.label || '-'}
                    </p>
                    <p>
                      <strong>Year:</strong> {selectedYear?.label || '-'}
                    </p>
                    <p>
                      <strong>Price:</strong> AED {formData.price} / USD {formData.usdPrice}
                    </p>
                    <p className='border rounded-lg p-2 mt-4'>
                      <strong className=' font-bold mb-6'>Description:</strong>{' '}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: formData.description || '-',
                        }}
                      />
                    </p>

                    <h3 className="text-xl font-bold mt-4 mb-2">Specifications</h3>
                    <ul>{renderSpecificationsPreview()}</ul>

                    <h3 className="text-xl font-bold mt-4 mb-2">Features</h3>
                    <ul>{renderFeaturesPreview()}</ul>

                    <h3 className="text-xl font-bold mt-4 mb-2">Tags</h3>
                    <p>{renderTagsPreview()}</p>

                    <h3 className="text-xl font-bold mt-4 mb-2">Assets</h3>
                    <div>
                      <strong>Images:</strong>
                      {renderImagesPreview()}
                    </div>
                    <div className="mt-4">
                      <strong>Brochure:</strong> {renderBrochurePreview()}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handlePublish}
                    >
                      Publish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Component */}
      <Lightbox
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        slides={slides}
        index={currentIndex}
        plugins={[Captions, Zoom]}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
        captions={{ showToggle: false }}
        zoom={{ maxZoomPixelRatio: 3 }}
      />
    </div>
  );
};

export default AddCarComponent;
