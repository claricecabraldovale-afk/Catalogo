"use client";

import { useState } from "react";
import { X, Minus, Plus } from "lucide-react";

interface Variant {
  id: string;
  type: "unidade" | "fardo";
  price_cents: number;
  unit_label: string;
}

interface Product {
  id: string;
  name: string;
  variants: Variant[];
}

interface VariantModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (variantId: string, productName: string, variantLabel: string, unitPriceCents: number, qty: number) => void;
}

export function VariantModal({ product, onClose, onAddToCart }: VariantModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const totalPrice = selectedVariant ? selectedVariant.price_cents * quantity : 0;

  const handleAdd = () => {
    if (!selectedVariant) return;
    onAddToCart(selectedVariant.id, product.name, selectedVariant.unit_label, selectedVariant.price_cents, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="relative p-4">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full bg-surface-elevated hover:bg-border transition-colors">
            <X className="w-5 h-5 text-text" />
          </button>

          <div className="aspect-square bg-surface-elevated rounded-lg mb-4 flex items-center justify-center">
            <span className="text-6xl"></span>
          </div>

          <h2 className="text-2xl font-bold text-text">{product.name}</h2>
          <p className="text-sm text-text-muted mt-1">Escolha unidade ou fardo.</p>

          <div className="mt-4 space-y-3">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  setSelectedVariantId(variant.id);
                  setQuantity(1);
                }}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  selectedVariantId === variant.id
                    ? "bg-brand border-brand-hover shadow-glow"
                    : "bg-surface-elevated border-border hover:border-brand"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`font-semibold ${selectedVariantId === variant.id ? "text-brand-contrast" : "text-text"}`}>
                      {variant.unit_label}
                    </span>
                    <p className={`text-xs mt-0.5 ${selectedVariantId === variant.id ? "text-brand-contrast/80" : "text-text-muted"}`}>
                      {selectedVariantId === variant.id ? "Selecionado" : "Selecionar"}
                    </p>
                  </div>
                  <span className={`text-xl font-bold ${selectedVariantId === variant.id ? "text-brand-contrast" : "text-brand"}`}>
                    R$ {(variant.price_cents / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedVariant && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-elevated rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-brand text-brand-contrast flex items-center justify-center hover:bg-brand-hover transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-lg font-semibold text-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-brand text-brand-contrast flex items-center justify-center hover:bg-brand-hover transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 bg-brand hover:bg-brand-hover text-brand-contrast font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-glow transition-all"
              >
                Adicionar {quantity} item{quantity > 1 ? "s" : ""} · R$ {(totalPrice / 100).toFixed(2).replace(".", ",")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}