'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { AsyncPaginate } from 'react-select-async-paginate';
import IconSave from '@/components/icon/icon-save';
import { useDropzone } from 'react-dropzone';
import SectionHeader from '@/components/utils/SectionHeader';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFiles } from '@/store/fileSelectionSlice';

// Services
import BlogTagService from '@/services/BlogTagService';
import BlogTypeService from '@/services/BlogTypeService';
import BlogService from '@/services/BlogService';
import BlogCategoryService from '@/services/BlogCategoryService';
import { getCookie } from '@/utils/cookieFunction';
import ConfirmationModal from '@/components/modal/MediaModal';

const MySwal = withReactContent(Swal);

interface UpdateBlogPostFormValues {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  blogCategoryId: number | null;
  blogTypeId: number | null;
  blogTags: number[];
}

interface UpdateBlogPostComponentProps {
  postId: number;
}

const UpdateBlogPostComponent: React.FC<UpdateBlogPostComponentProps> = ({ postId }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const formikRef = useRef<any>(null);

  // For cover image preview
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const selectedFiles = useSelector((state: any) => state.fileSelection.selectedFileIds);

  // For dropdowns
  const [selectedCategory, setSelectedCategory] = useState<{ value: number; label: string } | null>(null);
  const [selectedType, setSelectedType] = useState<{ value: number; label: string } | null>(null);
  const [selectedTags, setSelectedTags] = useState<Array<{ value: number; label: string }>>([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form initial values
  const [initialValues, setInitialValues] = useState<UpdateBlogPostFormValues>({
    id: '',
    title: '',
    content: '',
    excerpt: '',
    blogCategoryId: null,
    blogTypeId: null,
    blogTags: [],
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch Existing Blog Post
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchExistingBlogPost = async (id: number) => {
    try {
      Swal.fire({
        title: 'Loading...',
        text: 'Fetching blog post details.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await BlogService.getBlogPostById(id);
      Swal.close();

      if (!response || !response.data) {
        throw new Error('Blog post not found.');
      }

      const blogData = response.data;

      // Set form initial values
      setInitialValues({
        id: blogData.id || '',
        title: blogData.title || '',
        content: blogData.content || '',
        excerpt: blogData.excerpt || '',
        blogCategoryId: blogData.blogCategoryId || null,
        blogTypeId: blogData.blogTypeId || null,
        blogTags: blogData.blogTags?.map((tag: any) => tag.id) || [],
      });

      // Set selected dropdown values
      if (blogData.blogCategoryId && blogData.blogCategory) {
        setSelectedCategory({
          value: blogData.blogCategoryId,
          label: blogData.blogCategory.name,
        });
      }
      if (blogData.blogTypeId && blogData.blogType) {
        setSelectedType({
          value: blogData.blogTypeId,
          label: blogData.blogType.name,
        });
      }
      if (blogData.blogTags && Array.isArray(blogData.blogTags)) {
        const mappedTags = blogData.blogTags.map((tag: any) => ({
          value: tag.id,
          label: tag.name,
        }));
        setSelectedTags(mappedTags);
      }

      // Set cover image preview if available
      if (blogData.coverImage && blogData.coverImage.thumbnailPath) {
        setCoverPreview(blogData.coverImage.thumbnailPath);
        dispatch(setSelectedFiles([blogData.coverImage]));
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to fetch blog post details.',
      }).then(() => {
        // router.push('/blogs/blog-post/list');
      });
    }
  };

  useEffect(() => {
    if (postId) {
      fetchExistingBlogPost(postId);
    }
  }, [postId]);

  // Update cover preview when selected files change
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      setCoverPreview(selectedFile.thumbnailPath || selectedFile.path);
    }
  }, [selectedFiles]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Dropzone for Cover Image
  // ─────────────────────────────────────────────────────────────────────────────
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          Swal.fire({
            title: 'Uploading...',
            text: 'Please wait while the file is being uploaded.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/file-system/upload`, {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Upload Successful!',
              text: 'The image has been uploaded to the file manager.',
            });

            setCoverPreview(data.thumbnailPath);
            dispatch(setSelectedFiles([data]));
          } else {
            throw new Error(data.message || 'Failed to upload image.');
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: error instanceof Error ? error.message : 'Something went wrong.',
          });
        }
      }
    },
  });

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverPreview(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // AsyncPaginate loaders (Categories, Types, Tags)
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchCategories = async (
    searchQuery = '',
    loadedOptions = [],
    additional: { page: number } = { page: 1 }
  ) => {
    try {
      const params = {
        page: additional.page,
        limit: 10,
        search: searchQuery,
        status: 'published',
      };
      const response = await BlogCategoryService.listBlogCategories(params);
      console.log('Fetched categories:', response);

      if (!response || !Array.isArray(response.data)) {
        return { options: [], hasMore: false };
      }

      const options = response.data.map((cat: any) => ({
        value: cat.id,
        label: cat.name,
      }));

      const hasMore = response.pagination.currentPage < response.pagination.totalPages;
      return {
        options,
        hasMore,
        additional: { page: additional.page + 1 },
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { options: [], hasMore: false };
    }
  };

  const fetchTypes = async (
    searchQuery = '',
    loadedOptions = [],
    additional: { page: number } = { page: 1 }
  ) => {
    try {
      const params = {
        page: additional.page,
        limit: 10,
        search: searchQuery,
      };
      const response = await BlogTypeService.listBlogTypes(params);
      console.log('Fetched types:', response);

      if (!response || !Array.isArray(response.data)) {
        return { options: [], hasMore: false };
      }

      const options = response.data.map((type: any) => ({
        value: type.id,
        label: type.name,
      }));

      const hasMore = response.pagination.currentPage < response.pagination.totalPages;
      return {
        options,
        hasMore,
        additional: { page: additional.page + 1 },
      };
    } catch (error) {
      console.error('Error fetching types:', error);
      return { options: [], hasMore: false };
    }
  };

  const fetchTags = async (
    searchQuery = '',
    loadedOptions = [],
    additional: { page: number } = { page: 1 }
  ) => {
    try {
      const params = {
        page: additional.page,
        limit: 10,
        search: searchQuery,
      };
      const response = await BlogTagService.listBlogTags(params);
      console.log('Fetched tags:', response);

      if (!response || !Array.isArray(response.data)) {
        return { options: [], hasMore: false };
      }

      const options = response.data.map((tag: any) => ({
        value: tag.id,
        label: tag.name,
      }));

      const hasMore = response.pagination.currentPage < response.pagination.totalPages;
      return {
        options,
        hasMore,
        additional: { page: additional.page + 1 },
      };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return { options: [], hasMore: false };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Validation schema
  // ─────────────────────────────────────────────────────────────────────────────
  const BlogPostSchema = Yup.object().shape({
    title: Yup.string().required('Title is required.'),
    content: Yup.string().required('Content is required.'),
    excerpt: Yup.string(),
    blogCategoryId: Yup.number().required('Category is required.'),
    blogTypeId: Yup.number().required('Type is required.'),
  });

  const userId = getCookie('userId');

  // ─────────────────────────────────────────────────────────────────────────────
  // Handle Submit (Update)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleUpdate = async (
    values: UpdateBlogPostFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    if (!postId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No Blog ID provided.',
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      ...values,
      coverImageId: selectedFiles.length > 0 ? String(selectedFiles[0].id) : null,
      authorId: userId,
    };

    try {
      Swal.fire({
        title: 'Updating Blog Post...',
        text: 'Please wait.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await BlogService.updateBlogPost(payload);

      if (response?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Blog Post Updated!',
          text: 'Your blog post has been updated.',
        }).then(() => {
          router.push('/blogs/blog-post/list');
        });
      } else {
        throw new Error(response?.msg || 'Failed to update blog post.');
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

  const handleConfirmSelection = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSelection}
        title="Select Cover Image"
        description="Choose an image for the blog cover."
        allowFolders={false}
        selectionMode="multi"
      />

      <div className="flex flex-col gap-2.5 xl:flex-row">
        <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
          <SectionHeader title="Update Blog Post" />

          <div className="px-4 w-100">
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              enableReinitialize={true}
              validationSchema={BlogPostSchema}
              onSubmit={handleUpdate}
            >
              {({ setFieldValue, values }) => (
                <Form className="space-y-5">
                  {/* Title */}
                  <div>
                    <label htmlFor="title">Title</label>
                    <Field name="title" type="text" placeholder="Enter Title" className="form-input" />
                    <ErrorMessage name="title" component="div" className="text-danger" />
                  </div>

                  {/* Content */}
                  <div>
                    <label htmlFor="content">Content</label>
                    <RichTextEditor initialValue={values.content} onChange={(content) => setFieldValue('content', content)} />
                    <ErrorMessage name="content" component="div" className="text-danger" />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label htmlFor="excerpt">Excerpt</label>
                    <Field name="excerpt" type="text" placeholder="Enter Excerpt" className="form-input" />
                    <ErrorMessage name="excerpt" component="div" className="text-danger" />
                  </div>

                  {/* Category, Type, Tags */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <label htmlFor="blogCategoryId">Select Category</label>
                      <AsyncPaginate
                        loadOptions={fetchCategories}
                        debounceTimeout={300}
                        additional={{ page: 1 }}
                        value={selectedCategory}
                        onChange={(option: { value: number; label: string } | null) => {
                          setSelectedCategory(option);
                          setFieldValue('blogCategoryId', option ? option.value : null);
                        }}
                        placeholder="Search category..."
                      />
                      <ErrorMessage name="blogCategoryId" component="div" className="text-danger" />
                    </div>

                    <div>
                      <label htmlFor="blogTypeId">Select Type</label>
                      <AsyncPaginate
                        loadOptions={fetchTypes}
                        debounceTimeout={300}
                        additional={{ page: 1 }}
                        value={selectedType}
                        onChange={(option: { value: number; label: string } | null) => {
                          setSelectedType(option);
                          setFieldValue('blogTypeId', option ? option.value : null);
                        }}
                        placeholder="Search type..."
                      />
                      <ErrorMessage name="blogTypeId" component="div" className="text-danger" />
                    </div>

                    <div>
                      <label htmlFor="blogTags">Select Tags</label>
                      <AsyncPaginate
                        isMulti
                        loadOptions={fetchTags}
                        debounceTimeout={300}
                        additional={{ page: 1 }}
                        value={selectedTags}
                        onChange={(options: any) => {
                          setSelectedTags(options);
                          setFieldValue('blogTags', options ? options.map((opt: any) => opt.value) : []);
                        }}
                        placeholder="Search tags..."
                      />
                      <ErrorMessage name="blogTags" component="div" className="text-danger" />
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="grid grid-cols-1 gap-5">
                    <div
                      {...getRootProps()}
                      className="dropzone border-dashed border-2 border-gray-300 rounded-lg p-5 cursor-pointer text-center"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <input {...getInputProps()} name="logo" id="logo" />
                      {coverPreview ? (
                        <div className="file-selected">
                          <p className="mb-2">Selected Image:</p>
                          <div className="flex justify-center">
                            <img
                              src={process.env.NEXT_PUBLIC_IMAGE_BASE_URL + coverPreview}
                              alt="Cover Image Preview"
                              className="max-w-full max-h-48"
                            />
                          </div>
                          <button type="button" onClick={handleRemoveImage} className="mt-2 text-red-500 underline">
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500">Drag & drop an image here, or click to select one</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Update Button */}
                  <button type="submit" className="btn btn-success w-full">
                    <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                    Update Blog Post
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBlogPostComponent;
