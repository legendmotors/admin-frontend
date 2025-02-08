import IconHome from '@/components/icon/icon-home';
import Link from 'next/link';

type BreadcrumbItem = {
    label: string;
    isHome?: boolean;
    isActive?: boolean;
    link: string; // link should be required
};

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <div className="mb-3">
            <ol className="flex items-center font-semibold text-gray-500 dark:text-white-dark">
                {items.map((item, index) => (
                    <li key={index} className={`flex items-center ${index < items.length - 1 ? 'mr-2' : ''}`}>
                        {item.isHome ? (
                            <Link href={item.link} className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
                                <IconHome className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link href={item.link}
                                type="button"
                                className={`${item.isActive
                                    ? 'text-black dark:text-white-light'
                                    : 'hover:text-black/70 dark:hover:text-white-light/70'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )}
                        {index < items.length - 1 && <span className="mx-1">/</span>} {/* Adds a separator */}
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default Breadcrumb;