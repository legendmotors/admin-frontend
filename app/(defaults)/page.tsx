import AnalyticsComponent from '@/components/dashboard/AnalyticsComponent';
import ComponentsDashboardAnalytics from '@/components/dashboard/components-dashboard-analytics';
import ComponentsDashboardCrypto from '@/components/dashboard/components-dashboard-crypto';
import ComponentsDashboardFinance from '@/components/dashboard/components-dashboard-finance';
import ComponentsDashboardSales from '@/components/dashboard/components-dashboard-sales';
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
