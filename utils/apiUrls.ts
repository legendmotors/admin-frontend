const API_URL: string = process.env.NEXT_PUBLIC_IMAGE_BASE_URL as string;

const Apis: Record<string, string> = {
    // Authentication API
    GetUserLogin: `${API_URL}/api/auth/rootLogin`,
    GetUserRegister: `${API_URL}/api/auth/register`,
    GetAllUserList: `${API_URL}/api/auth/user/getAllUserList`,
    GetUserUpdate: `${API_URL}/api/auth/user/update`,
    GetDeleteUserList: `${API_URL}/api/auth/user/delete`,

    // 🔹 OTP APIs
    RequestOtp: `${API_URL}/api/auth/requestOtp`,
    VerifyOtp: `${API_URL}/api/auth/verifyOtp`,
    ResendOtp: `${API_URL}/api/auth/resendOtp`,

    // 🔹 Password Recovery APIs
    ForgotPassword: `${API_URL}/api/auth/forgotPassword`,
    ResetPassword: `${API_URL}/api/auth/resetPassword`,

    // User APIs
    GetUserList: `${API_URL}/api/auth/user/getUserList`,
    DeleteUser: `${API_URL}/api/auth/user/delete`,
    BulkDeleteUser: `${API_URL}/api/auth/user/bulkDelete`,
    GetUserById: `${API_URL}/api/auth/user/getUserById`,
    RestoreUser: `${API_URL}/api/auth/user/restore`,
    UpdateUserStatus: `${API_URL}/api/auth/user/UpdateUserStatus`,
    UpdateUser: `${API_URL}/api/auth/user/Update`,

    // Roles APIs
    CreateRole: `${API_URL}/api/auth/roles/create`,
    GetAllRoles: `${API_URL}/api/auth/roles`,
    GetRoleById: `${API_URL}/api/auth/roles/getById`,
    UpdateRole: `${API_URL}/api/auth/roles/update`,
    AssignPermissionsToRole: `${API_URL}/api/auth/roles/assignPermissions`,
    GetPermissionsForRole: `${API_URL}/api/auth/roles/getPermissions`,

    // Permissions APIs
    CreatePermission: `${API_URL}/api/auth/permissions/create`,
    GetAllPermissions: `${API_URL}/api/auth/permissions`,
    GetPermissionById: `${API_URL}/api/auth/permissions/getById`,
    UpdatePermission: `${API_URL}/api/auth/permissions/update`,
    DeletePermission: `${API_URL}/api/auth/permissions/delete`,

    // User Role Assignment API
    AssignRoleToUser: `${API_URL}/api/users/assignRole`,

    // Brand APIs
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
    UpdateStatus: `${API_URL}/api/status/update`,
    BulkUpdateStatus: `${API_URL}/api/status/bulk-update`,
    GetItemsByStatus: `${API_URL}/api/status/filter`,
    GetStatusById: `${API_URL}/api/status/status-by-id`,
    UpdateStatusById: `${API_URL}/api/status/update-by-id`,

    // CarTag APIs
    GetTagList: `${API_URL}/api/tag/list`,
    AddTag: `${API_URL}/api/tag/create`,
    UpdateTag: `${API_URL}/api/tag/update`,
    DeleteTag: `${API_URL}/api/tag/delete`,
    GetTagById: `${API_URL}/api/tag/getById`,
    GetTagBySlug: `${API_URL}/api/tag/getBySlug`,
    BulkDeleteTags: `${API_URL}/api/tag/bulk-delete`,

    // -------------------------------
    // New Blog Endpoints
    // -------------------------------

    // Blog Post APIs
    GetBlogPostList: `${API_URL}/api/blog-post/list`,
    AddBlogPost: `${API_URL}/api/blog-post/create`,
    UpdateBlogPost: `${API_URL}/api/blog-post/update`,
    DeleteBlogPost: `${API_URL}/api/blog-post/delete`,
    GetBlogPostById: `${API_URL}/api/blog-post/getById`,
    GetBlogPostBySlug: `${API_URL}/api/blog-post/getBySlug`,
    BulkDeleteBlogPosts: `${API_URL}/api/blog-post/bulk-delete`,

    // Blog Category APIs
    GetBlogCategoryList: `${API_URL}/api/blog-category/list`,
    AddBlogCategory: `${API_URL}/api/blog-category/create`,
    UpdateBlogCategory: `${API_URL}/api/blog-category/update`,
    DeleteBlogCategory: `${API_URL}/api/blog-category/delete`,
    GetBlogCategoryById: `${API_URL}/api/blog-category/getById`,
    BulkDeleteBlogCategories: `${API_URL}/api/blog-category/bulk-delete`,

    // Blog Tag APIs
    GetBlogTagList: `${API_URL}/api/blog-tag/list`,
    AddBlogTag: `${API_URL}/api/blog-tag/create`,
    UpdateBlogTag: `${API_URL}/api/blog-tag/update`,
    DeleteBlogTag: `${API_URL}/api/blog-tag/delete`,
    GetBlogTagById: `${API_URL}/api/blog-tag/getById`,
    GetBlogTagBySlug: `${API_URL}/api/blog-tag/getBySlug`,
    BulkDeleteBlogTags: `${API_URL}/api/blog-tag/bulk-delete`,

    // Blog Type APIs
    GetBlogTypeList: `${API_URL}/api/blog-type/list`,
    AddBlogType: `${API_URL}/api/blog-type/create`,
    UpdateBlogType: `${API_URL}/api/blog-type/update`,
    DeleteBlogType: `${API_URL}/api/blog-type/delete`,
    GetBlogTypeById: `${API_URL}/api/blog-type/getById`,
    BulkDeleteBlogTypes: `${API_URL}/api/blog-type/bulk-delete`,

    // Blog Comment APIs
    GetBlogCommentList: `${API_URL}/api/blog-comment/list`,
    AddBlogComment: `${API_URL}/api/blog-comment/create`,
    UpdateBlogComment: `${API_URL}/api/blog-comment/update`,
    DeleteBlogComment: `${API_URL}/api/blog-comment/delete`,
    GetBlogCommentById: `${API_URL}/api/blog-comment/getById`,
    BulkDeleteBlogComments: `${API_URL}/api/blog-comment/bulk-delete`,

    // Page endpoints
    GetPageList: `${API_URL}/api/page/list`,
    AddPage: `${API_URL}/api/page/create`,
    UpdatePage: `${API_URL}/api/page/update`,
    DeletePage: `${API_URL}/api/page/delete`,
    GetPageById: `${API_URL}/api/page/getById`,
    GetPageBySlug: `${API_URL}/api/page/getBySlug`,
    BulkDeletePages: `${API_URL}/api/page/bulk-delete`,

    // Page Section endpoints
    GetPageSectionList: `${API_URL}/api/page-section/list`,
    AddPageSection: `${API_URL}/api/page-section/create`,
    UpdatePageSection: `${API_URL}/api/page-section/update`,
    DeletePageSection: `${API_URL}/api/page-section/delete`,
    GetPageSectionById: `${API_URL}/api/page-section/getById`,
    GetPageSectionBySlug: `${API_URL}/api/page-section/getBySlug`,
    BulkDeletePageSections: `${API_URL}/api/page-section/bulk-delete`,

    // Banner endpoints
    GetBannerList: `${API_URL}/api/banner/list`,
    AddBanner: `${API_URL}/api/banner/create`,
    UpdateBanner: `${API_URL}/api/banner/update`,
    DeleteBanner: `${API_URL}/api/banner/delete`,
    GetBannerById: `${API_URL}/api/banner/getById`,
    GetBannerBySlug: `${API_URL}/api/banner/getBySlug`,
    BulkDeleteBanners: `${API_URL}/api/banner/bulk-delete`,

    // Newsletter endpoints
    AddNewsletter: `${API_URL}/api/newsletter/subscribe`,
    GetNewsletterList: `${API_URL}/api/newsletter/list`,
    DeleteNewsletter: `${API_URL}/api/newsletter/delete`,
    UnsubscribeNewsletter: `${API_URL}/api/newsletter/unsubscribe`,

    // Car Enquiry endpoints
    AddCarEnquiry: `${API_URL}/api/car-enquiry/create`,
    GetCarEnquiryList: `${API_URL}/api/car-enquiry/list`,
    GetCarEnquiryById: `${API_URL}/api/car-enquiry/getById`,
    DeleteCarEnquiry: `${API_URL}/api/car-enquiry/delete`,

    // Contact Us endpoints
    AddContact: `${API_URL}/api/contact-us/subscribe`,
    GetContactList: `${API_URL}/api/contact-us/list`,
    GetContactById: `${API_URL}/api/contact-us/getById`,
    DeleteContact: `${API_URL}/api/contact-us/delete`,
};

export { API_URL, Apis };
