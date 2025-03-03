
import PartnerListing from '@/components/partners/PartnerListing';
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
        <PartnerListing />
    </div>;
};

export default ListBrand;
