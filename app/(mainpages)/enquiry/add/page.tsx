import AddBrandComponent from '@/components/car/brand/AddBrandComponent';
import AddEnquiryComponent from '@/components/enquiry/AddEnquiryComponent';
import ComponentsFormsValidationCustomStyles from '@/components/forms/validation/components-forms-validation-custom-styles';
import Breadcrumb from '@/components/utils/Breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Brand',
};

const AddBrand = () => {
    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Brands', link: '/brand/list', isActive: false },
        { label: 'Add Brand', link: '', isActive: true },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <AddEnquiryComponent />

        </div>)
};

export default AddBrand;
