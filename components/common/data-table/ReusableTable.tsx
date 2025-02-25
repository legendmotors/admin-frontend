'use client';

import React, { useEffect, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { sortBy } from 'lodash';
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link';
import { format } from 'date-fns';

import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconPlus from '@/components/icon/icon-plus';
import ImportComponent from '@/components/utils/ImportComponent';
import UpdateStatusService from '@/services/UpdateStatusService';
import { getTranslation } from '@/i18n';
import Swal from 'sweetalert2';

type ImportComponentConfig = {
  endpoint: string;
  socketEvent: string;
  socketURL: string;
  title: string;
  description: string;
  acceptedFileTypes: string;
  onComplete: () => void;
};

// 1) Constrain T so it MUST have `id: number`.
type BaseRow = {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
};

// 2) Define the table props with that constraint.
type TableProps<T extends BaseRow> = {
  listService: (params: Record<string, any>) => Promise<{
    data: T[];
    pagination: { totalItems: number; totalPages: number };
  }>;
  /** If not provided, no single-item delete button is shown. */
  deleteService?: (id: number) => Promise<boolean>;
  /** If not provided, no bulk-delete button is shown. */
  bulkDeleteService?: (ids: number[]) => Promise<boolean>;
  columns: any[];
  actions?: Array<{
    label?: string | ((row: T) => string);
    show?: boolean;
    href?: string;
    onClick?: (id: number) => void;
    className?: string;
    // icon can be a static node or a function taking (id: number)
    icon?: React.ReactNode | ((id: number) => React.ReactNode);
  }>;
  PAGE_SIZES?: number[];
  searchPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  customStyles?: StylesConfig<any, boolean>;
  modelName: string;
  importComponentConfig?: ImportComponentConfig;
  addUrl?: string;
};

const ReusableTable = <T extends BaseRow>({
  columns,
  actions = [],
  PAGE_SIZES = [10, 20, 30, 50, 100],
  searchPlaceholder = 'Search...',
  statusOptions,
  modelName,
  listService,
  deleteService,
  bulkDeleteService,
  importComponentConfig,
  addUrl,
}: TableProps<T>) => {
  const { t, i18n } = getTranslation();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [paginationInfo, setPaginationInfo] = useState<{
    totalItems: number;
    totalPages: number;
  }>({
    totalItems: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState<string>('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'desc',
  });
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);

  // Fetch data on mount or when dependencies change
  useEffect(() => {
    const fetchDataFromAPI = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: pageSize,
          sortBy: sortStatus.columnAccessor,
          order: sortStatus.direction.toUpperCase(),
          lang: i18n.language,
        };

        if (search.trim()) params.search = search.trim();
        if (statusFilter) params.status = statusFilter;

        const response = await listService(params);
        setItems(sortBy(response.data, 'name')); // sort by 'name' if T has it
        setPaginationInfo(response.pagination);
      } catch (error) {
        console.error('Error fetching data:', error);
        setItems([]);
        setPaginationInfo({ totalItems: 0, totalPages: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromAPI();
  }, [page, pageSize, search, sortStatus, statusFilter, i18n.language]);

  // Reset to page 1 when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const handleStatusChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    setStatusFilter(selectedOption?.value || null);
  };

  const updateStatus = async (newStatus: 'published' | 'draft') => {
    if (selectedRecords.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Items Selected',
        text: 'Please select at least one item.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const ids = selectedRecords.map((item) => item.id);

    try {
      setUpdating(true);

      // Call your service for bulk updating status
      const success = await UpdateStatusService.bulkUpdateStatus({
        model: modelName,
        ids,
        status: newStatus,
      });

      if (success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            ids.includes(item.id) ? { ...item, status: newStatus } : item
          )
        );
        setSelectedRecords([]);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Items successfully updated to ${newStatus}`,
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: `Failed to update items to ${newStatus}`,
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the item status.',
        confirmButtonText: 'OK',
      });
    } finally {
      setUpdating(false);
    }
  };

  // For single/bulk delete, only show if the relevant services are provided
  const showDeleteConfirmation = (id: number | null) => {
    // If no single ID and no selected records, show message
    if (id === null && selectedRecords.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Items Selected',
        text: 'Please select at least one item to delete.',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (id !== null && deleteService) {
            // Single delete
            const success = await deleteService(id);
            if (success) {
              setItems((prevItems) => prevItems.filter((item) => item.id !== id));
            }
          } else if (bulkDeleteService) {
            // Bulk delete
            const ids = selectedRecords.map((item) => item.id);
            const success = await bulkDeleteService(ids);
            if (success) {
              setItems((prevItems) => prevItems.filter((item) => !ids.includes(item.id)));
              setSelectedRecords([]);
            }
          }
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    });
  };

  const handleImportComplete = () => {
    console.log('Import completed! Refreshing data...');
    // If you need to refresh the table, do so here or re-trigger useEffect.
  };

  // Single delete handler (only if deleteService is provided)
  const handleDelete = (id: number | null) => {
    if (!deleteService || id === null) return;
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const success = await deleteService(id);
          if (success) {
            setItems((prevItems) => prevItems.filter((item) => item.id !== id));
          }
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }
    });
  };

  // Renders the "Actions" column for each row
  const renderActions = (id: number) => (
    <div className="flex gap-2">
      {actions
        .filter((action) => action.show !== false)
        .map((action, index) => {
          // 1) Handle icon
          let iconElement: React.ReactNode;
          if (typeof action.icon === 'function') {
            iconElement = action.icon(id);
          } else {
            iconElement = action.icon;
          }

          // 2) Handle label
          let labelElement: React.ReactNode;
          if (typeof action.label === 'function') {
            // If the function expects row data, you'd pass the row object. 
            // If it only needs an ID, you could pass that. Adjust as needed.
            labelElement = action.label({} as T);
          } else {
            labelElement = action.label;
          }

          // 3) Return link or button
          if (action.href) {
            return (
              <a
                key={index}
                href={`${action.href}/${id}`}
                className={action.className || 'btn btn-sm btn-primary'}
              >
                {iconElement} {labelElement}
              </a>
            );
          } 
          else if (labelElement === 'Delete' && deleteService) {
            // Only show "Delete" if we have a deleteService
            return (
              <button
                key={index}
                onClick={() => handleDelete(id)}
                className={action.className || 'btn btn-sm btn-danger'}
              >
                {iconElement} {labelElement}
              </button>
            );
          } 
          else {
            return (
              <button
                key={index}
                onClick={() => action.onClick?.(id)}
                className={action.className || 'btn btn-sm btn-primary'}
              >
                {iconElement} {labelElement}
              </button>
            );
          }
        })}
    </div>
  );

  return (
    <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
      <div className="invoice-table">
        <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            {/* Only show publish/unpublish if relevant (custom logic) */}
            {selectedRecords.length > 0 && (
              <>
                {selectedRecords.every((item) => item.status === 'draft') && (
                  <button
                    type="button"
                    className="btn btn-success gap-2"
                    onClick={() => updateStatus('published')}
                  >
                    Publish
                  </button>
                )}
                {selectedRecords.every((item) => item.status === 'published') && (
                  <button
                    type="button"
                    className="btn btn-warning gap-2"
                    onClick={() => updateStatus('draft')}
                  >
                    Unpublish
                  </button>
                )}
                {selectedRecords.some((item) => item.status === 'draft') &&
                  selectedRecords.some((item) => item.status === 'published') && (
                    <>
                      <button
                        type="button"
                        className="btn btn-success gap-2"
                        onClick={() => updateStatus('published')}
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        className="btn btn-warning gap-2"
                        onClick={() => updateStatus('draft')}
                      >
                        Unpublish
                      </button>
                    </>
                  )}
              </>
            )}

            {/* Bulk delete button: only if bulkDeleteService is provided */}
            {bulkDeleteService && (
              <button
                type="button"
                className="btn btn-danger gap-2"
                onClick={() => showDeleteConfirmation(null)}
              >
                <IconTrashLines />
                Delete
              </button>
            )}

            {addUrl ? (
              <Link href={addUrl} className="btn btn-primary gap-2">
                <IconPlus />
                Add New
              </Link>
            ) : (
              <button className="btn btn-primary gap-2" disabled>
                <IconPlus />
                Add New
              </button>
            )}
          </div>

          <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
            {/* Optional import component */}
            {importComponentConfig && (
              <ImportComponent
                endpoint={importComponentConfig.endpoint}
                socketEvent={importComponentConfig.socketEvent}
                title={importComponentConfig.title}
                description={importComponentConfig.description}
                acceptedFileTypes={importComponentConfig.acceptedFileTypes}
                onComplete={importComponentConfig.onComplete || handleImportComplete}
              />
            )}
            {/* Search input */}
            <input
              type="text"
              className="form-input w-auto"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Status filter */}
            {statusOptions?.length ? (
              <Select
                options={statusOptions}
                value={statusOptions.find(
                  (option) => option.value === (statusFilter || '')
                )}
                onChange={handleStatusChange}
                isSearchable={false}
                placeholder="Select Status"
                className="w-auto"
              />
            ) : null}
          </div>
        </div>

        <div className="datatables pagination-padding">
          {loading ? (
            <div className="text-center p-4">Loading data...</div>
          ) : (
            <DataTable
              records={items}
              columns={[
                { accessor: 'id', title: 'ID', sortable: true },
                ...columns,
                {
                  accessor: 'createdAt',
                  title: 'Created At',
                  sortable: true,
                  render: (row) =>
                    row.createdAt
                      ? format(new Date(row.createdAt), 'dd MMM yyyy HH:mm:ss')
                      : '',
                },
                {
                  accessor: 'updatedAt',
                  title: 'Updated At',
                  sortable: true,
                  render: (row) =>
                    row.updatedAt
                      ? format(new Date(row.updatedAt), 'dd MMM yyyy HH:mm:ss')
                      : '',
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  sortable: false,
                  render: (row) => renderActions(row.id),
                },
              ]}
              highlightOnHover
              totalRecords={paginationInfo.totalItems}
              recordsPerPage={pageSize}
              page={page}
              onPageChange={setPage}
              recordsPerPageOptions={PAGE_SIZES}
              onRecordsPerPageChange={setPageSize}
              sortStatus={sortStatus}
              onSortStatusChange={setSortStatus}
              selectedRecords={selectedRecords}
              onSelectedRecordsChange={setSelectedRecords}
              paginationText={({ from, to, totalRecords }) =>
                `Showing ${from} to ${to} of ${totalRecords} entries`
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReusableTable;
