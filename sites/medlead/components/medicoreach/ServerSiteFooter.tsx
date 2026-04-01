import { navigation } from '@/lib/navigation';
import SiteFooter from './SiteFooter';

export default async function ServerSiteFooter() {
  let quickLinks: { label: string; href: string }[] | undefined;
  let resourceLinks: { label: string; href: string }[] | undefined;

  try {
    const footerMenu = await navigation.getFooterMenu();
    if (footerMenu.length > 0) {
      // Split footer items into two columns based on children or use flat list
      quickLinks = footerMenu
        .filter((item) => !item.cssClass?.includes('resource'))
        .map((item) => ({ label: item.label, href: item.url }));
      resourceLinks = footerMenu
        .filter((item) => item.cssClass?.includes('resource'))
        .map((item) => ({ label: item.label, href: item.url }));
    }
  } catch {
    // Navigation collection not yet provisioned — use defaults in SiteFooter
  }

  return (
    <SiteFooter
      quickLinks={quickLinks && quickLinks.length > 0 ? quickLinks : undefined}
      resourceLinks={resourceLinks && resourceLinks.length > 0 ? resourceLinks : undefined}
    />
  );
}
