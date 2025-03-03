import AddBannerComponent from '@/components/banner/AddBannerComponent';
import AddPartnerLogoComponent from '@/components/partners/AddPartnerLogoComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Brand',
};

const AddBanner = () => {
    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Banner', link: '/banners/list', isActive: false },
        { label: 'Add Banner', link: '', isActive: true },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <AddPartnerLogoComponent />

        </div>)
};

export default AddBanner;
