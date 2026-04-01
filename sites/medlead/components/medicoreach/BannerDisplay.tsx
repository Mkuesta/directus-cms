import { banners } from '@/lib/banners';

export async function BannerDisplay() {
  try {
    const activeBanners = await banners.getActiveBanners();

    if (activeBanners.length === 0) return null;

    return (
      <>
        {activeBanners
          .filter((b) => b.position === 'top')
          .map((banner) => (
            <div
              key={banner.id}
              className="text-center py-2 px-4 text-sm font-medium"
              style={{
                backgroundColor: banner.backgroundColor || (
                  banner.type === 'warning' ? '#eab308' :
                  banner.type === 'promotion' ? '#22c55e' :
                  '#0d9488'
                ),
                color: banner.textColor || '#ffffff',
              }}
            >
              {banner.linkUrl ? (
                <a href={banner.linkUrl} className="no-underline text-inherit hover:underline">
                  {banner.content} {banner.linkText && <span className="underline ml-1">{banner.linkText}</span>}
                </a>
              ) : (
                banner.content
              )}
            </div>
          ))}
      </>
    );
  } catch {
    // Banners collection not yet provisioned
    return null;
  }
}
