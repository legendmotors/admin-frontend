'use client';
import PageSectionListingComponent from '@/components/cms/PageSectionListingComponent';
import { Metadata } from 'next';
import { useParams } from 'next/navigation';
import React from 'react';


const ListPageSection = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const pageId = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `pageId ` is not a valid number, show an error
    if (isNaN(pageId)) {
        return <div>Invalid Brand ID</div>; // Show error if `id` is invalid
    }

    return <PageSectionListingComponent pageId={pageId} />;
};

export default ListPageSection;
