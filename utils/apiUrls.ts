
const API_URL: string =
    document.domain === 'localhost'
        ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`
        : "production";

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

    // Brand Apis
    GetBrandList: `${API_URL}/api/brand/list`,

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
