import Link from "next/link";

type ProductCardProps = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
};

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceInCents / 100);
}

export function ProductCard({
  slug,
  name,
  price,
  image,
}: ProductCardProps) {
  return (
    <article className="group">
      <Link href={`/produtos/${slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#ece9e3]">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-[8px] uppercase tracking-[0.4em] text-black/20">
                Saint Marin
              </span>
            </div>
          )}
        </div>

        <div className="pt-4">
          <h3 className="text-[12px] tracking-wide">
            {name}
          </h3>

          <p className="mt-2 text-[11px] text-black/50">
            {formatPrice(price)}
          </p>
        </div>
      </Link>
    </article>
  );
}