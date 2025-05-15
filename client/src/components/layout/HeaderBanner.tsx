import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Category } from '@shared/schema';

interface HeaderBannerProps {
  slug: string;
}

export default function HeaderBanner({ slug }: HeaderBannerProps) {
  const { data: category } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
    enabled: !!slug,
  });

  if (!category || (!category.imageUrl && !category.desktopImageUrl && !category.mobileImageUrl)) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden">
      <picture>
        {(category.mobileImageUrl || category.imageUrl) && (
          <source media="(max-width: 768px)" srcSet={category.mobileImageUrl || category.imageUrl} />
        )}
        {(category.desktopImageUrl || category.imageUrl) && (
          <source media="(min-width: 769px)" srcSet={category.desktopImageUrl || category.imageUrl} />
        )}
        <img
          src={category.desktopImageUrl || category.mobileImageUrl || category.imageUrl}
          alt={category.name}
          className="w-full object-cover"
        />
      </picture>
    </div>
  );
}
