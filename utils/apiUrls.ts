const API_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL as string;

const Apis: Record<string, string> = {
    // Authentication API
    GetUserLogin: `${API_URL}auth/rootLogin`,
    GetUserRegister: `${API_URL}auth/register`,
    GetAllUserList: `${API_URL}auth/user/getAllUserList`,
    GetUserUpdate: `${API_URL}auth/user/update`,
    GetDeleteUserList: `${API_URL}auth/user/delete`,

    // 🔹 OTP APIs
    RequestOtp: `${API_URL}auth/requestOtp`,
    VerifyOtp: `${API_URL}auth/verifyOtp`,
    ResendOtp: `${API_URL}auth/resendOtp`,

    // 🔹 Password Recovery APIs
    ForgotPassword: `${API_URL}auth/forgotPassword`,
    ResetPassword: `${API_URL}auth/resetPassword`,

    // User APIs
    GetUserList: `${API_URL}auth/user/getUserList`,
    DeleteUser: `${API_URL}auth/user/delete`,
    BulkDeleteUser: `${API_URL}auth/user/bulkDelete`,
    GetUserById: `${API_URL}auth/user/getUserById`,
    RestoreUser: `${API_URL}auth/user/restore`,
    UpdateUserStatus: `${API_URL}auth/user/UpdateUserStatus`,
    UpdateUser: `${API_URL}auth/user/Update`,

    // Roles APIs
    CreateRole: `${API_URL}auth/roles/create`,
    GetAllRoles: `${API_URL}auth/roles`,
    GetRoleById: `${API_URL}auth/roles/getById`,
    UpdateRole: `${API_URL}auth/roles/update`,
    AssignPermissionsToRole: `${API_URL}auth/roles/assignPermissions`,
    GetPermissionsForRole: `${API_URL}auth/roles/getPermissions`,

    // Permissions APIs
    CreatePermission: `${API_URL}auth/permissions/create`,
    GetAllPermissions: `${API_URL}auth/permissions`,
    GetPermissionById: `${API_URL}auth/permissions/getById`,
    UpdatePermission: `${API_URL}auth/permissions/update`,
    DeletePermission: `${API_URL}auth/permissions/delete`,

    // User Role Assignment API
    AssignRoleToUser: `${API_URL}users/assignRole`,

    // Brand APIs
    GetBrandList: `${API_URL}brand/list`,
    AddBrand: `${API_URL}brand/create`,
    UpdateBrand: `${API_URL}brand/update`,
    DeleteBrand: `${API_URL}brand/delete`,
    GetBrandById: `${API_URL}brand/getById`,
    GetBrandBySlug: `${API_URL}brand/getBySlug`,
    BulkDeleteBrands: `${API_URL}brand/bulk-delete`,
    ImportBrands: `${API_URL}brand/import`,

    // Car Model APIs
    GetCarModelList: `${API_URL}carmodel/list`,
    AddCarModel: `${API_URL}carmodel/create`,
    UpdateCarModel: `${API_URL}carmodel/update`,
    DeleteCarModel: `${API_URL}carmodel/delete`,
    GetCarModelById: `${API_URL}carmodel/getById`,
    BulkDeleteCarModels: `${API_URL}carmodel/bulk-delete`,

    // Trim APIs
    GetTrimList: `${API_URL}trim/list`,
    AddTrim: `${API_URL}trim/create`,
    UpdateTrim: `${API_URL}trim/update`,
    DeleteTrim: `${API_URL}trim/delete`,
    GetTrimById: `${API_URL}trim/getById`,
    BulkDeleteTrims: `${API_URL}trim/bulk-delete`,

    // Feature APIs
    GetFeatureList: `${API_URL}feature/list`,
    AddFeature: `${API_URL}feature/create`,
    UpdateFeature: `${API_URL}feature/update`,
    DeleteFeature: `${API_URL}feature/delete`,
    GetFeatureById: `${API_URL}feature/getById`,
    GetFeatureBySlug: `${API_URL}feature/getBySlug`,
    BulkDeleteFeatures: `${API_URL}feature/bulk-delete`,

    // FeatureValue APIs
    GetFeatureValueList: `${API_URL}featurevalue/list`,
    AddFeatureValue: `${API_URL}featurevalue/create`,
    UpdateFeatureValue: `${API_URL}featurevalue/update`,
    DeleteFeatureValue: `${API_URL}featurevalue/delete`,
    GetFeatureValueById: `${API_URL}featurevalue/getById`,
    GetFeatureValueBySlug: `${API_URL}featurevalue/getBySlug`,
    BulkDeleteFeatureValues: `${API_URL}featurevalue/bulk-delete`,

    // Specification APIs
    GetSpecificationList: `${API_URL}specification/list`,
    AddSpecification: `${API_URL}specification/create`,
    UpdateSpecification: `${API_URL}specification/update`,
    DeleteSpecification: `${API_URL}specification/delete`,
    GetSpecificationById: `${API_URL}specification/getById`,
    GetSpecificationBySlug: `${API_URL}specification/getBySlug`,
    BulkDeleteSpecifications: `${API_URL}specification/bulk-delete`,

    // SpecificationValue APIs
    GetSpecificationValueList: `${API_URL}specificationvalue/list`,
    AddSpecificationValue: `${API_URL}specificationvalue/create`,
    UpdateSpecificationValue: `${API_URL}specificationvalue/update`,
    DeleteSpecificationValue: `${API_URL}specificationvalue/delete`,
    GetSpecificationValueById: `${API_URL}specificationvalue/getById`,
    BulkDeleteSpecificationValues: `${API_URL}specificationvalue/bulk-delete`,

    // Year API
    GetYearList: `${API_URL}year/list`,
    AddYear: `${API_URL}year/create`,
    UpdateYear: `${API_URL}year/update`,
    DeleteYear: `${API_URL}year/delete`,
    GetYearById: `${API_URL}year/getById`,
    BulkDeleteYears: `${API_URL}year/bulk-delete`,

    // Car APIs
    AddCar: `${API_URL}car/create`,
    UpdateCar: `${API_URL}car/update`,
    DeleteCar: `${API_URL}car/delete`,
    GetCarList: `${API_URL}car/list`,
    GetCarByIdOrSlug: `${API_URL}car/getCarByIdOrSlug`,
    GetCarBySlug: `${API_URL}car/getBySlug`,
    BulkDeleteCars: `${API_URL}car/bulk-delete`,
    FuzzySearchCars: `${API_URL}car/fuzzy-search`,

    // Status APIs
    UpdateStatus: `${API_URL}status/update`,
    BulkUpdateStatus: `${API_URL}status/bulk-update`,
    GetItemsByStatus: `${API_URL}status/filter`,
    GetStatusById: `${API_URL}status/status-by-id`,
    UpdateStatusById: `${API_URL}status/update-by-id`,

    // CarTag APIs
    GetTagList: `${API_URL}tag/list`,
    AddTag: `${API_URL}tag/create`,
    UpdateTag: `${API_URL}tag/update`,
    DeleteTag: `${API_URL}tag/delete`,
    GetTagById: `${API_URL}tag/getById`,
    GetTagBySlug: `${API_URL}tag/getBySlug`,
    BulkDeleteTags: `${API_URL}tag/bulk-delete`,

    // -------------------------------
    // New Blog Endpoints
    // -------------------------------

    // Blog Post APIs
    GetBlogPostList: `${API_URL}blog-post/list`,
    AddBlogPost: `${API_URL}blog-post/create`,
    UpdateBlogPost: `${API_URL}blog-post/update`,
    DeleteBlogPost: `${API_URL}blog-post/delete`,
    GetBlogPostById: `${API_URL}blog-post/getById`,
    GetBlogPostBySlug: `${API_URL}blog-post/getBySlug`,
    BulkDeleteBlogPosts: `${API_URL}blog-post/bulk-delete`,

    // Blog Category APIs
    GetBlogCategoryList: `${API_URL}blog-category/list`,
    AddBlogCategory: `${API_URL}blog-category/create`,
    UpdateBlogCategory: `${API_URL}blog-category/update`,
    DeleteBlogCategory: `${API_URL}blog-category/delete`,
    GetBlogCategoryById: `${API_URL}blog-category/getById`,
    BulkDeleteBlogCategories: `${API_URL}blog-category/bulk-delete`,

    // Blog Tag APIs
    GetBlogTagList: `${API_URL}blog-tag/list`,
    AddBlogTag: `${API_URL}blog-tag/create`,
    UpdateBlogTag: `${API_URL}blog-tag/update`,
    DeleteBlogTag: `${API_URL}blog-tag/delete`,
    GetBlogTagById: `${API_URL}blog-tag/getById`,
    GetBlogTagBySlug: `${API_URL}blog-tag/getBySlug`,
    BulkDeleteBlogTags: `${API_URL}blog-tag/bulk-delete`,

    // Blog Type APIs
    GetBlogTypeList: `${API_URL}blog-type/list`,
    AddBlogType: `${API_URL}blog-type/create`,
    UpdateBlogType: `${API_URL}blog-type/update`,
    DeleteBlogType: `${API_URL}blog-type/delete`,
    GetBlogTypeById: `${API_URL}blog-type/getById`,
    BulkDeleteBlogTypes: `${API_URL}blog-type/bulk-delete`,

    // Blog Comment APIs
    GetBlogCommentList: `${API_URL}blog-comment/list`,
    AddBlogComment: `${API_URL}blog-comment/create`,
    UpdateBlogComment: `${API_URL}blog-comment/update`,
    DeleteBlogComment: `${API_URL}blog-comment/delete`,
    GetBlogCommentById: `${API_URL}blog-comment/getById`,
    BulkDeleteBlogComments: `${API_URL}blog-comment/bulk-delete`,

    // Page endpoints
    GetPageList: `${API_URL}page/list`,
    AddPage: `${API_URL}page/create`,
    UpdatePage: `${API_URL}page/update`,
    DeletePage: `${API_URL}page/delete`,
    GetPageById: `${API_URL}page/getById`,
    GetPageBySlug: `${API_URL}page/getBySlug`,
    BulkDeletePages: `${API_URL}page/bulk-delete`,

    // Page Section endpoints
    GetPageSectionList: `${API_URL}page-section/list`,
    AddPageSection: `${API_URL}page-section/create`,
    UpdatePageSection: `${API_URL}page-section/update`,
    DeletePageSection: `${API_URL}page-section/delete`,
    GetPageSectionById: `${API_URL}page-section/getById`,
    GetPageSectionBySlug: `${API_URL}page-section/getBySlug`,
    BulkDeletePageSections: `${API_URL}page-section/bulk-delete`,

    // Banner endpoints
    GetBannerList: `${API_URL}banner/list`,
    AddBanner: `${API_URL}banner/create`,
    UpdateBanner: `${API_URL}banner/update`,
    DeleteBanner: `${API_URL}banner/delete`,
    GetBannerById: `${API_URL}banner/getById`,
    GetBannerBySlug: `${API_URL}banner/getBySlug`,
    BulkDeleteBanners: `${API_URL}banner/bulk-delete`,
    GetBannerByIdentifier:`${API_URL}banner/getByIdentifier`,

    // Newsletter endpoints
    AddNewsletter: `${API_URL}newsletter/subscribe`,
    GetNewsletterList: `${API_URL}newsletter/list`,
    DeleteNewsletter: `${API_URL}newsletter/delete`,
    UnsubscribeNewsletter: `${API_URL}newsletter/unsubscribe`,

    // Car Enquiry endpoints
    AddCarEnquiry: `${API_URL}car-enquiry/create`,
    GetCarEnquiryList: `${API_URL}car-enquiry/list`,
    GetCarEnquiryById: `${API_URL}car-enquiry/getById`,
    DeleteCarEnquiry: `${API_URL}car-enquiry/delete`,

    // Contact Us endpoints
    AddContact: `${API_URL}contact-us/subscribe`,
    GetContactList: `${API_URL}contact-us/list`,
    GetContactById: `${API_URL}contact-us/getById`,
    DeleteContact: `${API_URL}contact-us/delete`,
};

export { API_URL, Apis };
