import { useQuery } from '@tanstack/react-query';
import { Collection as CollectionType } from '@shared/schema';

interface CollectionBannerProps {
  slug: string;
}

export default function CollectionBanner({ slug }: CollectionBannerProps) {
  const { data: collection } = useQuery<CollectionType>({
    queryKey: [`/api/collections/${slug}`],
    enabled: !!slug,
  });

  if (!collection || (!collection.desktopImageUrl && !collection.mobileImageUrl)) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden">
      <picture>
        {collection.mobileImageUrl && (
          <source media="(max-width: 768px)" srcSet={collection.mobileImageUrl} />
        )}
        {collection.desktopImageUrl && (
          <source media="(min-width: 769px)" srcSet={collection.desktopImageUrl} />
        )}
        <img
          src={collection.desktopImageUrl || collection.mobileImageUrl}
          alt={collection.name}
          className="w-full object-cover"
        />
      </picture>
    </div>
  );
}
