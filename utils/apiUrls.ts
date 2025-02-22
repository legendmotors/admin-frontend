
const API_URL: string = process.env.NEXT_PUBLIC_IMAGE_BASE_URL as string;

const Apis: Record<string, string> = {
    // Authentication API
    GetUserLogin: `${API_URL}/api/auth/rootLogin`,
    GetUserRegister: `${API_URL}/api/auth/register`,
    GetAllUserList: `${API_URL}/api/auth/user/getAllUserList`,
    GetUserUpdate: `${API_URL}/api/auth/user/update`,
    GetDeleteUserList: `${API_URL}/api/auth/user/delete`,

    // 🔹 OTP APIs
    RequestOtp: `${API_URL}/api/auth/requestOtp`, // Send OTP to user email
    VerifyOtp: `${API_URL}/api/auth/verifyOtp`, // Verify OTP before registration
    ResendOtp: `${API_URL}/api/auth/resendOtp`, // Resend OTP if expired

    // 🔹 Password Recovery APIs (Optional)
    ForgotPassword: `${API_URL}/api/auth/forgotPassword`, // Request password reset
    ResetPassword: `${API_URL}/api/auth/resetPassword`, // Reset password with token

    // User Apis
    GetUserList: `${API_URL}/api/auth/user/getUserList`,
    DeleteUser: `${API_URL}/api/auth/user/delete`,
    BulkDeleteUser: `${API_URL}/api/auth/user/bulkDelete`,
    GetUserById: `${API_URL}/api/auth/user/getUserById`,  // ✅ Fetch a single user by ID
    RestoreUser: `${API_URL}/api/auth/user/restore`,  // ✅ Restore a soft-deleted user
    UpdateUserStatus: `${API_URL}/api/auth/user/UpdateUserStatus`,  // ✅ Restore a soft-deleted user
    UpdateUser: `${API_URL}/api/auth/user/Update`,  // ✅ Restore a soft-deleted user

    // Roles APIs
    CreateRole: `${API_URL}/api/auth/roles/create`, // Create a new role
    GetAllRoles: `${API_URL}/api/auth/roles`, // Get all roles with pagination, search, and sorting
    GetRoleById:`${API_URL}/api/auth/roles/getById`,
    UpdateRole:`${API_URL}/api/auth/roles/update`,
    AssignPermissionsToRole: `${API_URL}/api/auth/roles/assignPermissions`, // Assign permissions to a role
    GetPermissionsForRole: `${API_URL}/api/auth/roles/getPermissions`, // Get permissions for a specific role

    // Permissions APIs
    CreatePermission: `${API_URL}/api/auth/permissions/create`, // Create a new permission
    GetAllPermissions: `${API_URL}/api/auth/permissions`, // Get all permissions with pagination, search, and sorting
    GetPermissionById: `${API_URL}/api/auth/permissions/getById`, // Get a specific permission by ID
    UpdatePermission: `${API_URL}/api/auth/permissions/update`, // Update a specific permission
    DeletePermission: `${API_URL}/api/auth/permissions/delete`, // Delete a specific permission


    // User Role Assignment API
    AssignRoleToUser: `${API_URL}/api/users/assignRole`, // Assign a role to a user

    // Brand Apis
    GetBrandList: `${API_URL}/api/brand/list`,
    AddBrand: `${API_URL}/api/brand/create`,
    UpdateBrand: `${API_URL}/api/brand/update`,
    DeleteBrand: `${API_URL}/api/brand/delete`,
    GetBrandById: `${API_URL}/api/brand/getById`,
    GetBrandBySlug: `${API_URL}/api/brand/getBySlug`,
    BulkDeleteBrands: `${API_URL}/api/brand/bulk-delete`,
    ImportBrands: `${API_URL}/api/brand/import`,

    // Car Model APIs
    GetCarModelList: `${API_URL}/api/carmodel/list`,
    AddCarModel: `${API_URL}/api/carmodel/create`,
    UpdateCarModel: `${API_URL}/api/carmodel/update`,
    DeleteCarModel: `${API_URL}/api/carmodel/delete`,
    GetCarModelById: `${API_URL}/api/carmodel/getById`,
    BulkDeleteCarModels: `${API_URL}/api/carmodel/bulk-delete`,

    // Trim APIs
    GetTrimList: `${API_URL}/api/trim/list`,
    AddTrim: `${API_URL}/api/trim/create`,
    UpdateTrim: `${API_URL}/api/trim/update`,
    DeleteTrim: `${API_URL}/api/trim/delete`,
    GetTrimById: `${API_URL}/api/trim/getById`,
    BulkDeleteTrims: `${API_URL}/api/trim/bulk-delete`,

    // Feature APIs
    GetFeatureList: `${API_URL}/api/feature/list`,
    AddFeature: `${API_URL}/api/feature/create`,
    UpdateFeature: `${API_URL}/api/feature/update`,
    DeleteFeature: `${API_URL}/api/feature/delete`,
    GetFeatureById: `${API_URL}/api/feature/getById`,
    GetFeatureBySlug: `${API_URL}/api/feature/getBySlug`,
    BulkDeleteFeatures: `${API_URL}/api/feature/bulk-delete`,

    // FeatureValue APIs
    GetFeatureValueList: `${API_URL}/api/featurevalue/list`,
    AddFeatureValue: `${API_URL}/api/featurevalue/create`,
    UpdateFeatureValue: `${API_URL}/api/featurevalue/update`,
    DeleteFeatureValue: `${API_URL}/api/featurevalue/delete`,
    GetFeatureValueById: `${API_URL}/api/featurevalue/getById`,
    GetFeatureValueBySlug: `${API_URL}/api/featurevalue/getBySlug`,
    BulkDeleteFeatureValues: `${API_URL}/api/featurevalue/bulk-delete`,

    // Specification APIs
    GetSpecificationList: `${API_URL}/api/specification/list`,
    AddSpecification: `${API_URL}/api/specification/create`,
    UpdateSpecification: `${API_URL}/api/specification/update`,
    DeleteSpecification: `${API_URL}/api/specification/delete`,
    GetSpecificationById: `${API_URL}/api/specification/getById`,
    GetSpecificationBySlug: `${API_URL}/api/specification/getBySlug`,
    BulkDeleteSpecifications: `${API_URL}/api/specification/bulk-delete`,

    // SpecificationValue APIs
    GetSpecificationValueList: `${API_URL}/api/specificationvalue/list`,
    AddSpecificationValue: `${API_URL}/api/specificationvalue/create`,
    UpdateSpecificationValue: `${API_URL}/api/specificationvalue/update`,
    DeleteSpecificationValue: `${API_URL}/api/specificationvalue/delete`,
    GetSpecificationValueById: `${API_URL}/api/specificationvalue/getById`,
    BulkDeleteSpecificationValues: `${API_URL}/api/specificationvalue/bulk-delete`,

    // Year API
    GetYearList: `${API_URL}/api/year/list`,
    AddYear: `${API_URL}/api/year/create`,
    UpdateYear: `${API_URL}/api/year/update`,
    DeleteYear: `${API_URL}/api/year/delete`,
    GetYearById: `${API_URL}/api/year/getById`,
    BulkDeleteYears: `${API_URL}/api/year/bulk-delete`,

    // Car APIs
    AddCar: `${API_URL}/api/car/create`,
    UpdateCar: `${API_URL}/api/car/update`,
    DeleteCar: `${API_URL}/api/car/delete`,
    GetCarList: `${API_URL}/api/car/list`,
    GetCarById: `${API_URL}/api/car/getById`,
    GetCarBySlug: `${API_URL}/api/car/getBySlug`,
    BulkDeleteCars: `${API_URL}/api/car/bulk-delete`,

    // Status APIs
    UpdateStatus: '/api/status/update',               // POST - Update status for a single item
    BulkUpdateStatus: '/api/status/bulk-update',      // POST - Bulk update status for multiple items
    GetItemsByStatus: '/api/status/filter',           // GET - Get items by status (draft/published)
    GetStatusById: '/api/status/status-by-id',        // GET - Get item status by ID
    UpdateStatusById: '/api/status/update-by-id',  

    // CarTag APIs
    GetTagList: `${API_URL}/api/tag/list`,
    AddTag: `${API_URL}/api/tag/create`,
    UpdateTag: `${API_URL}/api/tag/update`,
    DeleteTag: `${API_URL}/api/tag/delete`,
    GetTagById: `${API_URL}/api/tag/getById`,
    GetTagBySlug: `${API_URL}/api/tag/getBySlug`,
    BulkDeleteTags: `${API_URL}/api/tag/bulk-delete`,




    // Dashboard
    GetOrderByStatus: `${API_URL}/api/order/status`,
    GetAllStatusOrder: `${API_URL}/api/order/count`,

    // Vendor API
    CreateSupplierList: `${API_URL}/api/supplier/create`,
    CreateSupplierProduct: `${API_URL}/api/supplier/product-add`,
    GetAllSellerList: `${API_URL}/api/supplier/list`,
    GetUpdateSellerList: `${API_URL}/api/supplier/update`,
    GetDeleteSellerList: `${API_URL}/api/supplier/delete`,

    // Location API
    GetAllLocationCreate: `${API_URL}/api/location/create`,
    GetAllLocationList: `${API_URL}/api/location/list`,
    GetLocationDeleteById: `${API_URL}/api/location/delete`,
    GetLocationUpdate: `${API_URL}/api/location/update`,

    // Area API
    CreateAreaList: `${API_URL}/api/location/area/create`,
    GetAllAreaList: `${API_URL}/api/location/area/list`,
    GetAreaDeleteById: `${API_URL}/api/location/area/delete`,
    GetAreaUpdate: `${API_URL}/api/location/area/update`,
    GetAllAreaByLocation: `${API_URL}/api/location/area/getAllAreaList?locationId=`,

    // Category API
    CreateCategoryList: `${API_URL}/api/category/create`,
    GetAllCategoryList: `${API_URL}/api/category/main-list`,
    GetUpdateCategoryList: `${API_URL}/api/category/main-list/update`,

    // Subcategory API
    CreateSubCategoryList: `${API_URL}/api/category/create-sub`,
    GetAllSubCategoryList: `${API_URL}/api/category/sub-list`,
    GetUpdateSubCategoryList: `${API_URL}/api/category/sub-list/update`,
    GetSubDeleteById: `${API_URL}/api/category/sub-list/delete`,

    // Child Category API
    GetAllSubCategory: `${API_URL}/api/category/getAllSubCategory?categoryId=`,
    CreateChildCategory: `${API_URL}/api/category/create-sub-child`,
    GetAllChildCategoryList: `${API_URL}/api/category/list`,
    GetChildDeleteById: `${API_URL}/api/category/child/deleteById`,
    GetAllSubChildCategory: `${API_URL}/api/category/getAllSubChildCategory?subcategoryId=`,

    // Product API
    AddProductList: `${API_URL}/api/product/add`,
    GetAllProductList: `${API_URL}/api/product/getAllproductList`,
    GetAllProductPhoto: `${API_URL}/api/product/getAllPhoto`,
    GetUpdateProduct: `${API_URL}/api/product/update`,
    GetUploadProductImage: `${API_URL}/api/product/upload-img`,
    GetDeleteProduct: `${API_URL}/api/product/delete`,
    GetProductById: `${API_URL}/api/product/getProductById`,
    GetProductPhotoDeleteById: `${API_URL}/api/product/aws/delete/photo`,

    // Order Details
    GetAllOrderDetails: `${API_URL}/api/order/list`,
    GetOrderStatusUpdate: `${API_URL}/api/order/status/update`,

    // Customer Details
    GetAllCustomerDetails: `${API_URL}/api/customer/list`,
    GetCustomerDeleteById: `${API_URL}/api/customer/delete`,

    // Payment List
    GetAllPaymentList: `${API_URL}/api/payment/getAllPayment`,
};

export { API_URL, Apis };
