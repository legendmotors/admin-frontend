'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AsyncPaginate } from 'react-select-async-paginate';
import Select, { SingleValue } from 'react-select';
import Swal from 'sweetalert2';
import io from 'socket.io-client';

import { IRootState, AppDispatch } from '@/store/index';
import { setStep, setFormData, setImages, setBrochure } from '@/store/formSlice';

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

// Interfaces
interface Specification {
  id: number;
  name: string;
  key: string;
  mandatory: boolean;
  values: { value: string; label: string }[];
}

interface Feature {
  id: number;
  name: string;
  mandatory: boolean;
  values: { id: number; name: string }[];
}

interface Image {
  fileId: string;
  type: string;
  order: number;
}

interface Tag {
  id: number;
  name: string;
}

// Initialize socket using the correct URL from your env variable
const socket = io(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`);

const AddCarComponent = () => {
  const dispatch: AppDispatch = useDispatch();

  // Redux states
  const currentStep = useSelector((state: IRootState) => state.form.currentStep);
  const formData = useSelector((state: IRootState) => state.form.formData);
  const images = useSelector((state: IRootState) => state.form.images);
  const brochureFile = useSelector((state: IRootState) => state.form.brochureFile);

  // Local states
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<{ value: number; label: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ value: number; label: string } | null>(null);
  const [selectedTrim, setSelectedTrim] = useState<{ value: number; label: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState<{ value: number; label: string } | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Disconnect the socket when the component unmounts
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  // -------------------------------
  // Fetching: Tags
  // -------------------------------
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

  // -------------------------------
  // Reusable fetcher for AsyncPaginate
  // -------------------------------
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
        sortBy: "name", order: "asc",
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

  // -----------------------
  // Fetching: Exchange Rate
  // -----------------------
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

  // --------------------------------
  // Fetching: Specifications, Values
  // --------------------------------
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

  // -----------------------
  // Fetching: Features, Values
  // -----------------------
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

  // -----------------------------------
  // Handle: Images + Brochure in Redux
  // -----------------------------------
  const handleImagesUpdate = (updatedImages: Image[]) => {
    if (JSON.stringify(images) !== JSON.stringify(updatedImages)) {
      dispatch(setImages(updatedImages));
    }
  };

  // ----------------------
  // Build default form data
  // ----------------------
  const defaultValues = useMemo(() => {
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
      // Add tags as an empty array (similar to features)
      tags: [] as number[],
      // Build dynamic specification fields
      specifications: specifications.reduce((acc, spec) => {
        acc[spec.key] = '';
        return acc;
      }, {} as Record<string, string>),
      // Build dynamic feature fields
      features: features.reduce((acc, feature) => {
        acc[feature.id] = [];
        return acc;
      }, {} as Record<number, string[]>),
    };
  }, [specifications, features]);

  // -------------------------
  // Build validation schema
  // -------------------------
  const validationSchema = useMemo(() => {
    return Yup.object({
      stockId: Yup.string().required('The Stock ID is required'),
      brandId: Yup.string().required('The Brand is required'),
      modelId: Yup.string().required('The Model is required'),
      trimId: Yup.string().required('The Trim is required'),
      year: Yup.string().required('The Year is required'),
      price: Yup.number()
        .min(1000, 'Price cannot be less than 1000')
        .required('The AED Price is required'),
      usdPrice: Yup.number()
        .min(1000, 'Price cannot be less than 1000')
        .required('The USD Price is required'),
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
      // (Optional) add validation for tags if needed, e.g. require at least one tag:
      // tags: Yup.array().min(1, 'At least one tag must be selected'),
    });
  }, [specifications, features]);

  // ----------------------
  // Handle form submission for Step 1
  // ----------------------
  const handleNext = (values: any) => {
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

  // ---------------------------
  // Transform raw values into final payload
  // ---------------------------
  const constructFinalPayload = (rawValues: any) => {
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
          amount: rawValues.price ? parseFloat(rawValues.price) : 0,
        },
        {
          currency: 'USD',
          amount: rawValues.usdPrice ? parseFloat(rawValues.usdPrice) : 0,
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
      // Use tags from the form values
      tags: rawValues.tags,
      brochureId: brochureFile?.id
    };
  };

  // ----------------------
  // Render progress HTML for SweetAlert2
  // ----------------------
  const renderProgressHtml = (progress: number, message: string) => `
    <div class="mb-5 space-y-5">
      <div class="w-full h-4 bg-gray-200 rounded-full">
        <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">${progress}%</div>
      </div>
      <p class="text-center">${message}</p>
    </div>
  `;

  // ----------------------
  // Handle Publish with socket-driven progress updates
  // ----------------------
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
      
      // Force a 2-second delay if needed (optional)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Now perform the API call
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
          dispatch(setFormData({}));
          dispatch(setStep(1));
          // Redirect to inventory list
          window.location.href = '/inventory/list';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add the car. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error publishing car:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while publishing the car.',
      });
    }
  };
  console.log('Current Step:', currentStep);
  console.log('Form Data:', formData);
  
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
                className={`${
                  currentStep === 1
                    ? 'w-[15%]'
                    : currentStep === 2
                    ? 'w-[48%]'
                    : currentStep === 3
                    ? 'w-[81%]'
                    : ''
                } absolute top-[30px] -z-[1] m-auto h-1 bg-primary transition-[width] ltr:left-0 rtl:right-0`}
              ></div>
              <ul className="mb-5 grid grid-cols-3">
                <li className="mx-auto">
                  <button
                    type="button"
                    onClick={() => dispatch(setStep(1))}
                    className={`${
                      currentStep === 1 ? '!border-primary !bg-primary text-white' : ''
                    } flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                  >
                    <IconMenuForms className="h-7 w-7" />
                  </button>
                  <span className={`${currentStep === 1 ? 'text-primary ' : ''}text-center mt-2 block`}>
                    Car Details
                  </span>
                </li>
                <li className="mx-auto">
                  <button
                    type="button"
                    onClick={() => dispatch(setStep(2))}
                    className={`${
                      currentStep === 2 ? '!border-primary !bg-primary text-white' : ''
                    } flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                  >
                    <IconGallery className="h-7 w-7" />
                  </button>
                  <span className={`${currentStep === 2 ? 'text-primary ' : ''}text-center mt-2 block`}>
                    Photos & Assets
                  </span>
                </li>
                <li className="mx-auto">
                  <button
                    type="button"
                    onClick={() => dispatch(setStep(3))}
                    className={`${
                      currentStep === 3 ? '!border-primary !bg-primary text-white' : ''
                    } flex h-16 w-16 items-center justify-center rounded-full border-[3px] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
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
              {currentStep === 1 && (
                <Formik
                  initialValues={{ ...defaultValues, ...formData }}
                  validationSchema={validationSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    console.log('No validation errors; proceed to next step');
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
                                          const newValue = field.value.filter((id: number) => id !== tag.id);
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
                            <label className="block font-medium">Stock ID (Optional)</label>
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

              {/* STEP 3: PUBLISH */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Review & Publish</h2>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePublish}
                  >
                    Publish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCarComponent;
