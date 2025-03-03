'use client'; // This tells Next.js this component is client-side

import UpdateBannerComponent from '@/components/banner/UpdateBannerComponent';
import PageUpdateComponent from '@/components/cms/PageUpdateComponent';
import UpdatePartnerLogoComponent from '@/components/partners/UpdatePartnerLogoComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';

import { useParams } from 'next/navigation'; // Import useParams from next/navigation

const EditBanner = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const partnerLogoId  = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `partnerLogoId ` is not a valid number, show an error
    if (isNaN(partnerLogoId )) {
        return <div>Invalid Brand ID</div>; // Show error if `id` is invalid
    }

    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Partners', link: '/partners/list', isActive: false },
        { label: 'Edit Partner', link: '', isActive: true },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <UpdatePartnerLogoComponent partnerLogoId ={partnerLogoId } /> {/* Pass the valid partnerLogoId  as a prop */}
        </div>
    );
};

export default EditBanner;
