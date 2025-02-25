'use client';

import React, { useEffect, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import AnimateHeight from 'react-animate-height';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import { toggleSidebar } from '@/store/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconGallery from '@/components/icon/icon-gallery';
import IconListCheck from '@/components/icon/icon-list-check';
import IconSettings from '@/components/icon/icon-settings';
import IconUsers from '@/components/icon/icon-users';
import IconNotes from '@/components/icon/icon-notes';
import IconTxtFile from '@/components/icon/icon-txt-file';
import IconPencilPaper from '@/components/icon/icon-pencil-paper';
import IconUsersGroup from '@/components/icon/icon-users-group';
import IconSquareRotated from '@/components/icon/icon-square-rotated';
import IconFile from '@/components/icon/icon-file';
import { getCookie, setCookie } from '@/utils/cookieFunction';
import { GetUserDetails } from '@/services';

// Define types for submenus and menu items.
interface SubMenuItem {
    label: string;
    href: string;
}

interface MenuItem {
    key: string;
    label: string;
    icon: JSX.Element;
    requiredPermissions: string[];
    href?: string;
    subMenu?: SubMenuItem[];
}

// Static menu configuration.
const menuItems: MenuItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <IconMenuDashboard />,
        requiredPermissions: ['view_dashboard'],
        subMenu: [
            { label: 'Analytics', href: '/dashboard/analytics' },
            { label: 'Overview', href: '/dashboard/overview' },
        ],
    },
    {
        key: 'manageCarDetails',
        label: 'Manage Car Details',
        icon: <IconSettings />,
        requiredPermissions: ['manage_car_details'],
        subMenu: [
            { label: 'All Brands', href: '/brand/list' },
            { label: 'All Models', href: '/model/list' },
            { label: 'All Trims', href: '/trim/list' },
        ],
    },
    {
        key: 'userManagement',
        label: 'User Management',
        icon: <IconUsers />,
        requiredPermissions: ['manage_user_management'],
        subMenu: [
            { label: 'All Users', href: '/users/list' },
            { label: 'Roles', href: '/users/roles/list' },
        ],
    },
    {
        key: 'features',
        label: 'Manage Car Features',
        icon: <IconSquareRotated />,
        requiredPermissions: ['manage_car_features'],
        subMenu: [
            { label: 'Features', href: '/feature/list' },
            { label: 'Features With Values', href: '/feature/list-value' },
        ],
    },
    {
        key: 'specification',
        label: 'Manage Car Specification',
        icon: <IconFile />,
        requiredPermissions: ['manage_car_specification'],
        subMenu: [
            { label: 'Specifications', href: '/specification/list' },
            { label: 'Specifications with values', href: '/specification/list-value' },
        ],
    },
    {
        key: 'carTags',
        label: 'Manage Car Tags',
        href: '/car-tags/list',
        icon: <IconListCheck />,
        requiredPermissions: ['manage_car_tags'],
    },
    {
        key: 'inventory',
        label: 'Car Inventory',
        href: '/inventory/list',
        icon: <IconListCheck />,
        requiredPermissions: ['manage_car_inventory'],
    },
    {
        key: 'blog',
        label: 'Blog',
        icon: <IconPencilPaper />,
        requiredPermissions: ['manage_blog'],
        subMenu: [
            { label: 'Posts', href: '/blogs/blog-post/list' },
            { label: 'Categories', href: '/blogs/blog-category/list' },
            { label: 'Tags', href: '/blogs/blog-tag/list' },
            { label: 'Types', href: '/blogs/blog-type/list' },
        ],
    },
    {
        key: 'cms',
        label: 'CMS',
        href: '/page/list',
        icon: <IconTxtFile />,
        requiredPermissions: ['manage_cms'],
    },
    {
        key: 'banners',
        label: 'Banners',
        href: '/banners/list',
        icon: <IconGallery />,
        requiredPermissions: ['manage_banners'],
    },
    {
        key: 'newsLetter',
        label: 'News Letter',
        href: '/newsletter/list',
        icon: <IconNotes />,
        requiredPermissions: ['manage_news_letter'],
    },
    {
        key: 'carEnquiry',
        label: 'Car Enquiry',
        href: '/enquiry/list',
        icon: <IconNotes />,
        requiredPermissions: ['manage_car_enquiry'],
    },
    {
        key: 'contactFormEnquiry',
        label: 'Contact Form Enquiry',
        href: '/contact-enquiry/list',
        icon: <IconNotes />,
        requiredPermissions: ['manage_contact_enquiry'],
    },
    // {
    //     key: 'testimonials',
    //     label: 'Testimonials',
    //     href: '/media-library',
    //     icon: <IconUsersGroup />,
    //     requiredPermissions: ['manage_testimonials'],
    // },
    {
        key: 'mediaLibrary',
        label: 'Media Library',
        href: '/media-library',
        icon: <IconGallery />,
        requiredPermissions: ['manage_media_library'],
    },
    // {
    //     key: 'configuration',
    //     label: 'Configuration',
    //     href: '/media-library',
    //     icon: <IconSettings />,
    //     requiredPermissions: ['manage_configuration'],
    // },
];

export default function Sidebar() {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [rolePermissions, setRolePermissions] = useState<string[]>([]);

    // On mount, attempt to read role permissions from a cookie.
    // If not present, fetch role details from the backend and then save permissions in a cookie.
    useEffect(() => {
        const roleIdCookie = getCookie('roleId');
        const permsCookie = getCookie('rolePermissions');
        if (roleIdCookie) {
            if (permsCookie) {
                // Permissions are stored as a comma-separated list.
                const perms = permsCookie.split(',').map((perm) => perm.trim());
                setRolePermissions(perms);
            } else {
                GetUserDetails.getRoleById(Number(roleIdCookie))
                    .then((response) => {
                        console.log('Role response:', response);
                        if (response && response.success && response.data) {
                            const perms: string[] = Array.isArray(response.data.permissions)
                                ? response.data.permissions.map((perm: any) => perm.name)
                                : [];
                            setRolePermissions(perms);
                            // Save permissions to cookie for 60 minutes.
                            setCookie('rolePermissions', perms.join(','), 60);
                        }
                    })
                    .catch((err) => {
                        console.error('Error fetching role details:', err);
                    });
            }
        }
    }, []);

    // Toggle submenu open/close state
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    // Mark current route as active
    const setActiveRoute = () => {
        const allLinks = document.querySelectorAll('.sidebar ul a.active');
        allLinks.forEach((element) => element.classList.remove('active'));
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname, themeConfig.sidebar, dispatch]);

    // Filter menu items based on rolePermissions
    const filteredMenuItems: MenuItem[] = menuItems.filter((menu) => {
        if (!menu.requiredPermissions || menu.requiredPermissions.length === 0) {
            return true;
        }
        return menu.requiredPermissions.some((perm) => rolePermissions.includes(perm));
    });

    console.log('Role Permissions:', rolePermissions);
    console.log('Filtered Menu Items:', filteredMenuItems);

    return (
        <div className={themeConfig.semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${themeConfig.semidark ? 'text-white-dark' : ''
                    }`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img
                                className="ml-[25px] w-36 flex-none dark:hidden"
                                src="/assets/images/logo/dark-logo.png"
                                alt="logo"
                            />
                            <img
                                className="ml-[25px] w-36 flex-none hidden dark:block"
                                src="/assets/images/logo/white-logo.png"
                                alt="logo"
                            />
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            {filteredMenuItems.map((menu) => (
                                <li key={menu.key} className="menu nav-item">
                                    {menu.subMenu ? (
                                        <>
                                            <button
                                                type="button"
                                                className={`nav-link group w-full flex items-center justify-between ${currentMenu === menu.key ? 'active' : ''
                                                    }`}
                                                onClick={() => toggleMenu(menu.key)}
                                            >
                                                <div className="flex items-center">
                                                    {menu.icon}
                                                    <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690]">{t(menu.label)}</span>
                                                </div>
                                                <IconCaretDown
                                                    className={`${currentMenu !== menu.key ? '-rotate-90 rtl:rotate-90' : ''}`}
                                                />
                                            </button>
                                            <AnimateHeight duration={300} height={currentMenu === menu.key ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    {menu.subMenu.map((subItem, idx) => (
                                                        <li key={idx}>
                                                            <Link href={subItem.href}>{t(subItem.label)}</Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AnimateHeight>
                                        </>
                                    ) : (
                                        <li className="menu nav-item">
                                            <Link href={menu.href!} className="group">
                                                <div className="flex items-center">
                                                    {menu.icon}
                                                    <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t(menu.label)}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
}
