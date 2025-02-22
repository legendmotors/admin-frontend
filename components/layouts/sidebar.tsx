'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import IconGallery from '../icon/icon-gallery';
import IconListCheck from '../icon/icon-list-check';
import IconSettings from '../icon/icon-settings';
import IconUsers from '../icon/icon-users';
import IconNotes from '../icon/icon-notes';
import IconTxtFile from '../icon/icon-txt-file';
import IconPencilPaper from '../icon/icon-pencil-paper';
import IconServer from '../icon/icon-server';
import IconUsersGroup from '../icon/icon-users-group';
import IconSquareRotated from '../icon/icon-square-rotated';
import IconFile from '../icon/icon-file';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
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
                            {/* <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('dashboard')}>
                                    <div className="flex items-center">
                                        <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('dashboard')}</span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/">{t('analytics')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li> */}

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'brand' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('brand')}>
                                    <div className="flex items-center">
                                        <IconSettings className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Manage Car Details</span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'brand' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/brand/list">All Brands</Link>
                                        </li>
                                        <li>
                                            <Link href="/model/list">All Models</Link>
                                        </li>
                                        <li>
                                            <Link href="/trim/list">All Trims</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'features' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('features')}>
                                    <div className="flex items-center">
                                        <IconSquareRotated className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Manage Car Features</span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'features' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/feature/list">Features</Link>
                                        </li>
                                        <li>
                                            <Link href="/feature/list-value">Features With Values</Link>
                                        </li>
                                        {/* <li>
                                            <Link href="/brand/list">Exterior & Control</Link>
                                        </li>
                                        <li>
                                            <Link href="/model/list">Interior Features</Link>
                                        </li>
                                        <li>
                                            <Link href="/trim/list">Security</Link>
                                        </li>
                                        <li>
                                            <Link href="/trim/list">Comfort & Convenience</Link>
                                        </li>
                                        <li>
                                            <Link href="/trim/list">Infotainment</Link>
                                        </li> */}
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'specification' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('specification')}>
                                    <div className="flex items-center">
                                        <IconFile className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Manage Car Specification</span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'specification' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">

                                        <li>
                                            <Link href="/specification/list">Specifications</Link>
                                        </li>
                                        <li>
                                            <Link href="/specification/list-value">Specifications with values</Link>
                                        </li>
                                        {/* <li>
                                            <Link href="/brand/list">Regional specs</Link>
                                        </li>
                                        <li>
                                            <Link href="/brand/list">Steering side</Link>
                                        </li>
                                        <li>
                                            <Link href="/brand/list">Color</Link>
                                        </li>
                                        <li>
                                            <Link href="/brand/list">Wheel size</Link>
                                        </li>  <li>
                                            <Link href="/brand/list">Body type</Link>
                                        </li>  <li>
                                            <Link href="/brand/list">Seats </Link>
                                        </li>  <li>
                                            <Link href="/brand/list">Doors </Link>
                                        </li>  <li>
                                            <Link href="/brand/list">Fuel type</Link>
                                        </li>  <li>
                                            <Link href="/brand/list">Cylinders</Link>
                                        </li>  <li>
                                            <Link href="/brand/list">Drive Type </Link>
                                        </li>  <li>
                                            <Link href="/brand/list">Transmission</Link>
                                        </li>  <li>
                                            <Link href="/brand/list">Engine size (Litres)</Link>
                                        </li>
                                        <li>
                                            <Link href="/brand/list">Horsepower</Link>
                                        </li> */}
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/car-tags/list" className="group">
                                    <div className="flex items-center">
                                        <IconListCheck className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Manage Car Tags</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/inventory/list" className="group">
                                    <div className="flex items-center">
                                        <IconListCheck className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Car Inventory</span>
                                    </div>
                                </Link>
                            </li>

                            {/* <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'trim' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('trim')}>
                                    <div className="flex items-center">
                                        <IconUsers className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">User Management</span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'trim' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/users/list">All Users</Link>
                                        </li>
                                        <li>
                                            <Link href="/users/roles/list">Roles</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'blog' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('blog')}>
                                    <div className="flex items-center">
                                        <IconPencilPaper className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Blog</span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'blog' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/trim/list">All Blogs</Link>
                                        </li>
                                        <li>
                                            <Link href="/trim/add">Categories</Link>
                                        </li>
                                        <li>
                                            <Link href="/trim/add">Tags</Link>
                                        </li>
                                        <li>
                                            <Link href="/trim/add">Types</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/media-library" className="group">
                                    <div className="flex items-center">
                                        <IconTxtFile className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">CMS</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/media-library" className="group">
                                    <div className="flex items-center">
                                        <IconGallery className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Banners</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/media-library" className="group">
                                    <div className="flex items-center">
                                        <IconNotes className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">News Letter</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/media-library" className="group">
                                    <div className="flex items-center">
                                        <IconUsersGroup className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Testimonials</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/media-library" className="group">
                                    <div className="flex items-center">
                                        <IconGallery className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Media Library</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/media-library" className="group">
                                    <div className="flex items-center">
                                        <IconSettings className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Configuration</span>
                                    </div>
                                </Link>
                            </li> */}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
