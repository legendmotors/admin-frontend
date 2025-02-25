'use client';

import React from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import BlogCategoryService from '@/services/BlogCategoryService';

const BlogCategoryListingTable: React.FC = () => {
  const columns = [
    { accessor: 'name', title: 'Name', sortable: true },
    { accessor: 'slug', title: 'Slug', sortable: true },
  ];

  const actions = [
    {
      label: 'Edit',
      href: '/blogs/blog-category/edit',
      className: 'btn btn-sm btn-info',
      icon: <IconEdit className="h-4.5 w-4.5" />,
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
      <h1 className="text-2xl font-bold mb-4">Blog Category List</h1>
      <ReusableTable
        modelName="BlogCategory"
        columns={columns}
        // If your category doesn't have a status field, leave statusOptions empty
        statusOptions={[]}
        listService={BlogCategoryService.listBlogCategories}
        deleteService={BlogCategoryService.deleteBlogCategory}
        bulkDeleteService={BlogCategoryService.bulkDeleteBlogCategories}
        actions={actions}
        addUrl="/blogs/blog-category/add"
      />
    </div>
  );
};

export default BlogCategoryListingTable;
