'use client';

import React from 'react';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import ReusableTable from '@/components/common/data-table/ReusableTable';
import BlogCommentService from '@/services/BlogCommentService';

const BlogCommentListingTable: React.FC = () => {
  const columns = [
    { accessor: 'content', title: 'Comment', sortable: false },
    { accessor: 'blogPostId', title: 'Blog Post ID', sortable: true },
    { accessor: 'userId', title: 'User ID', sortable: true },
    { accessor: 'createdAt', title: 'Created At', sortable: true },
  ];

  const actions = [
    {
      label: 'Delete',
      icon: <IconTrashLines />,
      show: true,
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Blog Comment List</h1>
      <ReusableTable
        modelName="BlogComment"
        columns={columns}
        statusOptions={[]} // Comments may not have a status field
        listService={BlogCommentService.listBlogComments}
        deleteService={BlogCommentService.deleteBlogComment}
        bulkDeleteService={BlogCommentService.bulkDeleteBlogComments}
        actions={actions}
        addUrl="" // Typically, comments are added via the blog post view
      />
    </div>
  );
};

export default BlogCommentListingTable;
