import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DealBreadcrumbProps {
  category?: { nameHe: string; slug: string } | null;
  dealTitle: string;
}

export default function DealBreadcrumb({
  category,
  dealTitle,
}: DealBreadcrumbProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clickly.co.il";

  const items: BreadcrumbItem[] = [
    { label: "\u05D1\u05D9\u05EA", href: "/" },
    { label: "\u05D3\u05D9\u05DC\u05D9\u05DD", href: "/deals" },
  ];

  if (category) {
    items.push({
      label: category.nameHe,
      href: `/deals?category=${category.slug}`,
    });
  }

  items.push({ label: dealTitle });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${siteUrl}${item.href}` }),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-sm text-gray-400 flex-wrap">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-gray-600">&gt;</span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-300 line-clamp-1 max-w-[200px]">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
