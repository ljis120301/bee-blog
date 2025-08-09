import Link from 'next/link';
import { IconChevronRight, IconHome } from '@tabler/icons-react';

export default function Breadcrumb({ items = [] }) {
  const allItems = [
    { name: 'Home', href: '/', icon: IconHome },
    ...items
  ];

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-[#4c4f69] dark:text-cat-frappe-subtext0">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <IconChevronRight 
                size={16} 
                className="mx-2 text-[#6c6f85] dark:text-cat-frappe-subtext1" 
              />
            )}
            {index === allItems.length - 1 ? (
              <span 
                className="font-medium text-cat-frappe-base dark:text-cat-frappe-yellow flex items-center"
                aria-current="page"
              >
                {item.icon && <item.icon size={16} className="mr-1" />}
                {item.name}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-cat-frappe-peach transition-colors flex items-center"
              >
                {item.icon && <item.icon size={16} className="mr-1" />}
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
