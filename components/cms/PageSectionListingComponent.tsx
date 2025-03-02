'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import PageSectionService from '@/services/PageSectionService';

interface PageSectionListingProps {
  pageId: number;
}

const PageSectionListingComponent: React.FC<PageSectionListingProps> = ({ pageId }) => {
  // Define your table columns. You might want to update these for page sections.
  const columns = [
    { accessor: 'sectionKey', title: 'Section Key', sortable: true },
    { accessor: 'title', title: 'Title', sortable: true },
    { accessor: 'content', title: 'Content', sortable: false },
  ];

  // Define dynamic actions
  const actions = [
    {
      label: 'Edit',
      href: '/page-section/edit',
      className: 'btn btn-sm btn-info',
      icon: <IconEdit className="h-4.5 w-4.5" />,
      show: true,
    },
    {
      label: 'View',
      href: '/page-section/view',
      className: 'btn btn-sm btn-info',
      icon: <IconEye />,
      show: true,
    },
    {
      label: 'Delete',
      icon: <IconTrashLines />,
      show: true,
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Page Section Lists</h1>
      <ReusableTable
        modelName="PageSection"
        columns={columns}
        statusOptions={[]}
        // Wrap the list service to always pass the pageId in the params.
        listService={(params: Record<string, any>) =>
          PageSectionService.listPageSections({ ...params, pageId })
        }
        deleteService={PageSectionService.deletePageSection}
        bulkDeleteService={PageSectionService.bulkDeletePageSections}
        actions={actions}
        addUrl={`/page-section/add?pageId=${pageId}`}
      />
    </div>
  );
};

export default PageSectionListingComponent;
