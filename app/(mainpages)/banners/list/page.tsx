import BannerListing from '@/components/banner/BannerListing';
import Breadcrumb from '@/components/utils/Breadcrumbs';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'List Models',
};


const ListBrand = () => {
    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Banner', link: '/banners/list', isActive: false }
    ];
    return <div>
        <Breadcrumb items={breadcrumbItems} />
        <BannerListing />
    </div>;
};

export default ListBrand;
