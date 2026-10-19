"use client";

interface Product {
  id: string;
  name: string;
  image_url: string;
  category: string;
  variants: { price_cents: number }[];
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const minPrice = Math.min(...product.variants.map((v) => v.price_cents));
  const formattedPrice = `R$ ${(minPrice / 100).toFixed(2).replace(".", ",")}`;

  return (
    <button
      onClick={onClick}
      className="group bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-glow hover:border-brand border border-transparent transition-all duration-200 text-left w-full"
    >
      <div className="aspect-square bg-surface-elevated flex items-center justify-center">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%2327272A' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23A1A1AA' font-size='14'%3E🍺%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="text-base font-semibold text-text truncate">{product.name}</h3>
        <p className="text-sm text-text-muted capitalize">{product.category}</p>
        <p className="text-lg font-bold text-brand mt-1">{formattedPrice}</p>
      </div>
    </button>
  );
}