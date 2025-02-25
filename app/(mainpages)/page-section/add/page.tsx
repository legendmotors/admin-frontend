"use client"
import AddBrandComponent from '@/components/car/brand/AddBrandComponent';
import AddFeatureComponent from '@/components/car/feature/AddFeatureComponent';
import AddPageSectionComponent from '@/components/cms/AddPageSectionComponent';
import ComponentsFormsValidationCustomStyles from '@/components/forms/validation/components-forms-validation-custom-styles';
import Breadcrumb from '@/components/utils/Breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const AddBrand = () => {
    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Brands', link: '/brand/list', isActive: false },
        { label: 'Add Brand', link: '', isActive: true },
    ];

    const searchParams = useSearchParams();
    const pageIdParam = searchParams.get('pageId');
    const pageId = pageIdParam ? Number(pageIdParam) : undefined;

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <AddPageSectionComponent pageId={pageId} />

        </div>)
};

export default AddBrand;
