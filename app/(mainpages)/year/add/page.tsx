import AddBrandComponent from '@/components/car/brand/AddBrandComponent';
import AddFeatureComponent from '@/components/car/feature/AddFeatureComponent';
import AddYearComponent from '@/components/car/year/AddYearComponent';
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
        { label: 'All Year', link: '/year/list', isActive: false },
        { label: 'Add Year', link: '', isActive: true },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <AddYearComponent />

        </div>)
};

export default AddBrand;
