import { prisma } from "@/lib/db";
import DealCard from "@/components/DealCard";

interface RelatedDealsProps {
  productId: string;
  categoryId: string | null;
  storeId: string;
}

export default async function RelatedDeals({
  productId,
  categoryId,
  storeId,
}: RelatedDealsProps) {
  const relatedDeals = await prisma.product.findMany({
    where: {
      id: { not: productId },
      isPublished: true,
      status: "PUBLISHED",
      OR: [
        ...(categoryId ? [{ categoryId }] : []),
        { storeId },
      ],
    },
    orderBy: { score: "desc" },
    take: 4,
    include: {
      store: { select: { name: true, platform: true } },
      category: { select: { nameHe: true, slug: true } },
    },
  });

  if (relatedDeals.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
        דילים דומים שיעניינו אתכם
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedDeals.map((deal) => (
          <DealCard key={deal.id} product={deal} />
        ))}
      </div>
    </section>
  );
}
