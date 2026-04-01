import { navigation } from '@/lib/navigation';
import SiteHeader from './SiteHeader';

export default async function ServerSiteHeader() {
  let navItems: { label: string; href: string }[] | undefined;

  try {
    const headerMenu = await navigation.getHeaderMenu();
    if (headerMenu.length > 0) {
      navItems = headerMenu.map((item) => ({
        label: item.label,
        href: item.url,
      }));
    }
  } catch {
    // Navigation collection not yet provisioned — use defaults in SiteHeader
  }

  return <SiteHeader navItems={navItems} />;
}
