import type { FC, ReactNode } from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

interface PageContainerProps {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}

export const PageContainer: FC<PageContainerProps> = ({ title, extra, children }) => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);

  const breadcrumbItems = [
    {
      title: <Link to="/">Trang chủ</Link>,
    },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const name = snippet.charAt(0).toUpperCase() + snippet.slice(1);
      return {
        title: index === pathSnippets.length - 1 ? name : <Link to={url}>{name}</Link>,
      };
    }),
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} className="mb-2" />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {extra && <div className="flex gap-2">{extra}</div>}
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};
