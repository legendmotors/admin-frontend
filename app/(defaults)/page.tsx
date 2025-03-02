import AnalyticsComponent from '@/components/dashboard/AnalyticsComponent';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Dashboard',
};

const Sales = () => {
    return <>
        <AnalyticsComponent />
        {/* <ComponentsDashboardAnalytics /> */}
    </>
};

export default Sales;
