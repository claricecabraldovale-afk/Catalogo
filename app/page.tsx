"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, X, Minus, Plus, MapPin, Copy, Truck, Store, CreditCard, Banknote, QrCode } from "lucide-react";

// --- Types ---
interface Variant {
  id: string;
  type: "unidade" | "fardo";
  price_cents: number;
  unit_label: string;
}

interface Product {
  id: string;
  name: string;
  image_url: string;
  category: string;
  variants: Variant[];
}

interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  unitPriceCents: number;
  quantity: number;
}

interface Bairro {
  id: string;
  name: string;
  delivery_fee_cents: number;
  min_order_cents: number;
}

type OrderType = "delivery" | "retirada";
type PaymentMethod = "pix" | "cartao" | "dinheiro";

// --- Mock Data ---
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Eisenbahn Pilsen",
    image_url: "https://placehold.co/400x400/FACC15/000000?text=Eisenbahn",
    category: "cerveja",
    variants: [
      { id: "v1u", type: "unidade", price_cents: 599, unit_label: "Unidade" },
      { id: "v1f", type: "fardo", price_cents: 6499, unit_label: "Fardo (12un)" },
    ],
  },
  {
    id: "p2",
    name: "Brahma Malzbier",
    image_url: "https://placehold.co/400x400/DC2626/FFFFFF?text=Brahma",
    category: "cerveja",
    variants: [
      { id: "v2u", type: "unidade", price_cents: 799, unit_label: "Unidade" },
      { id: "v2f", type: "fardo", price_cents: 8999, unit_label: "Fardo (12un)" },
    ],
  },
  {
    id: "p3",
    name: "Heineken Long Neck",
    image_url: "https://placehold.co/400x400/16A34A/FFFFFF?text=Heineken",
    category: "cerveja",
    variants: [
      { id: "v3u", type: "unidade", price_cents: 899, unit_label: "Unidade" },
    ],
  },
];

const MOCK_BAIRROS: Bairro[] = [
  { id: "b1", name: "Paciência", delivery_fee_cents: 400, min_order_cents: 1000 },
  { id: "b2", name: "Santa Cruz", delivery_fee_cents: 500, min_order_cents: 1500 },
];

const PIX_KEY = "62346ec7-d3b4-47d0-8ab2-762ad18";
const WHATSAPP_PHONE = "5547992869293";

// --- Components ---

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const minPrice = Math.min(...product.variants.map((v) => v.price_cents));
  return (
    <button onClick={onClick} className="group bg-[#18181B] rounded-xl overflow-hidden border border-[#3F3F46] hover:border-[#D4AF37] transition-all text-left w-full">
      <div className="aspect-square bg-[#27272A] relative">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-white truncate">{product.name}</h3>
        <p className="text-xs text-[#A1A1AA] capitalize mt-1">{product.category}</p>
        <p className="text-lg font-bold text-[#D4AF37] mt-2">R$ {(minPrice / 100).toFixed(2).replace(".", ",")}</p>
      </div>
    </button>
  );
}

function VariantModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (v: Variant, qty: number) => void }) {
  const [selected, setSelected] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#18181B] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#3F3F46]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">{product.name}</h2>
            <button onClick={onClose} className="p-2 bg-[#27272A] rounded-full hover:bg-[#3F3F46]"><X size={20} className="text-white" /></button>
          </div>

          <div className="space-y-3 mb-6">
            {product.variants.map((v) => (
              <button key={v.id} onClick={() => { setSelected(v); setQty(1); }}
                className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${selected?.id === v.id ? "bg-[#D4AF37] border-[#E8C84A] shadow-[0_0_20px_rgba(212,175,55,0.3)]" : "bg-[#27272A] border-[#3F3F46] hover:border-[#D4AF37]"}`}>
                <div className="text-left">
                  <span className={`font-bold block ${selected?.id === v.id ? "text-[#0A0A0A]" : "text-white"}`}>{v.unit_label}</span>
                  <span className={`text-xs ${selected?.id === v.id ? "text-[#0A0A0A]/70" : "text-[#A1A1AA]"}`}>{selected?.id === v.id ? "Selecionado" : "Escolher"}</span>
                </div>
                <span className={`text-xl font-bold ${selected?.id === v.id ? "text-[#0A0A0A]" : "text-[#D4AF37]"}`}>
                  R$ {(v.price_cents / 100).toFixed(2).replace(".", ",")}
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#27272A] rounded-full p-1 border border-[#3F3F46]">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center hover:bg-[#E8C84A]"><Minus size={18} /></button>
                <span className="w-8 text-center font-bold text-white">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center hover:bg-[#E8C84A]"><Plus size={18} /></button>
              </div>
              <button onClick={() => onAdd(selected, qty)} className="flex-1 bg-[#D4AF37] hover:bg-[#E8C84A] text-[#0A0A0A] font-bold py-3 px-4 rounded-xl shadow-lg transition-colors">
                Adicionar {qty} item{qty > 1 ? "s" : ""} · R$ {((selected.price_cents * qty) / 100).toFixed(2).replace(".", ",")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [bairroId, setBairroId] = useState<string>("b1");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [obs, setObs] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedBairro = MOCK_BAIRROS.find(b => b.id === bairroId);

  const subtotal = cart.reduce((acc, item) => acc + (item.unitPriceCents * item.quantity), 0);
  const deliveryFee = orderType === "delivery" ? (selectedBairro?.delivery_fee_cents || 0) : 0;
  const total = subtotal + deliveryFee;
  const minOrderMet = orderType === "retirada" || subtotal >= (selectedBairro?.min_order_cents || 0);

  const addToCart = (variant: Variant, qty: number, product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.variantId === variant.id);
      if (existing) {
        return prev.map(i => i.variantId === variant.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { productId: product.id, variantId: variant.id, productName: product.name, variantLabel: variant.unit_label, unitPriceCents: variant.price_cents, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (variantId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.variantId === variantId) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleCheckout = () => {
    if (!minOrderMet || !customerName) return;

    const itemsText = cart.map(i => `• ${i.quantity}x ${i.productName} (${i.variantLabel})`).join("\n");
    const msg = `*Novo Pedido - Leo Bebidas*\n\n` +
                `*Cliente:* ${customerName}\n` +
                `*Tipo:* ${orderType === "delivery" ? "Entrega" : "Retirada"}\n` +
                (orderType === "delivery" ? `*Bairro:* ${selectedBairro?.name}\n*Endereço:* ${address}\n` : "") +
                `*Pagamento:* ${payment.toUpperCase()}\n` +
                (payment === "pix" ? `*Chave Pix:* ${PIX_KEY}\n` : "") +
                (obs ? `*Obs:* ${obs}\n` : "") +
                `\n*Itens:*\n${itemsText}\n\n` +
                `*Subtotal:* R$ ${(subtotal / 100).toFixed(2).replace(".", ",")}\n` +
                (deliveryFee > 0 ? `*Taxa de entrega:* R$ ${(deliveryFee / 100).toFixed(2).replace(".", ",")}\n` : "") +
                `*TOTAL: R$ ${(total / 100).toFixed(2).replace(".", ",")}*`;

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#3F3F46] px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0A0A0A] font-bold text-lg">L</div>
          <h1 className="text-xl font-bold tracking-tight">LEO BEBIDAS</h1>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-[#18181B] rounded-full border border-[#3F3F46] hover:border-[#D4AF37] transition-colors">
          <ShoppingCart size={24} className="text-white" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#0A0A0A] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Catalog */}
      <main className="max-w-7xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 text-[#D4AF37]">Catálogo de Bebidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_PRODUCTS.map(p => (
            <ProductCard key={p.id} product={p} onClick={() => setModalProduct(p)} />
          ))}
        </div>
      </main>

      {/* Modals & Drawers */}
      {modalProduct && (
        <VariantModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAdd={(v, q) => addToCart(v, q, modalProduct)}
        />
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
          <div className="w-full max-w-md bg-[#0A0A0A] h-full border-l border-[#3F3F46] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#3F3F46] flex justify-between items-center bg-[#18181B]">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={20} className="text-[#D4AF37]" /> Seu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[#27272A] rounded-full"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Items */}
              {cart.length === 0 ? (
                <div className="text-center py-12 text-[#A1A1AA]">Seu carrinho está vazio.</div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.variantId} className="bg-[#18181B] p-3 rounded-xl border border-[#3F3F46] flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{item.productName}</p>
                        <p className="text-xs text-[#A1A1AA]">{item.variantLabel} · R$ {(item.unitPriceCents / 100).toFixed(2).replace(".", ",")} un</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-[#27272A] rounded-full p-1">
                          <button onClick={() => updateQty(item.variantId, -1)} className="w-7 h-7 rounded-full bg-[#3F3F46] text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors"><Minus size={14} /></button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.variantId, 1)} className="w-7 h-7 rounded-full bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center hover:bg-[#E8C84A] transition-colors"><Plus size={14} /></button>
                        </div>
                        <p className="font-bold text-sm w-20 text-right">R$ {((item.unitPriceCents * item.quantity) / 100).toFixed(2).replace(".", ",")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-4 pt-4 border-t border-[#3F3F46]">
                <div>
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">Nome do cliente</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Digite seu nome" className="w-full bg-[#18181B] border border-[#3F3F46] rounded-lg p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-2 block">Tipo de pedido</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#18181B] p-1 rounded-xl border border-[#3F3F46]">
                    <button onClick={() => setOrderType("delivery")} className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${orderType === "delivery" ? "bg-[#D4AF37] text-[#0A0A0A] shadow-md" : "text-[#A1A1AA] hover:text-white"}`}><Truck size={16} /> Delivery</button>
                    <button onClick={() => setOrderType("retirada")} className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${orderType === "retirada" ? "bg-[#D4AF37] text-[#0A0A0A] shadow-md" : "text-[#A1A1AA] hover:text-white"}`}><Store size={16} /> Retirada</button>
                  </div>
                </div>

                {orderType === "delivery" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">Bairro</label>
                      <select value={bairroId} onChange={e => setBairroId(e.target.value)} className="w-full bg-[#18181B] border border-[#3F3F46] rounded-lg p-3 text-sm focus:border-[#D4AF37] focus:outline-none appearance-none">
                        {MOCK_BAIRROS.map(b => <option key={b.id} value={b.id}>{b.name} - R$ {(b.delivery_fee_cents / 100).toFixed(2).replace(".", ",")}</option>)}
                      </select>
                    </div>

                    {!minOrderMet && (
                      <div className="bg-[#F59E0B]/10 border border-[#F59E0B] rounded-lg p-3 flex gap-3 items-start">
                        <div className="mt-0.5 text-[#F59E0B]"><MapPin size={16} /></div>
                        <div>
                          <p className="text-xs font-bold text-[#F59E0B] uppercase">Pedido mínimo para entrega</p>
                          <p className="text-xs text-[#A1A1AA] mt-0.5">{selectedBairro?.name}: R$ {((selectedBairro?.min_order_cents || 0) / 100).toFixed(2).replace(".", ",")}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">Rua e número</label>
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: Rua das Flores, 120" className="w-full bg-[#18181B] border border-[#3F3F46] rounded-lg p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors" />
                      <button className="mt-2 w-full py-2 border border-[#D4AF37] text-[#D4AF37] rounded-lg text-xs font-bold hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-2">
                        <MapPin size={14} /> Usar minha localização atual
                      </button>
                    </div>
                  </>
                )}

                {/* Payment */}
                <div>
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-2 block">Forma de pagamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["pix", "cartao", "dinheiro"] as PaymentMethod[]).map(m => (
                      <button key={m} onClick={() => setPayment(m)} className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${payment === m ? "bg-[#D4AF37] text-[#0A0A0A]" : "bg-[#18181B] border border-[#3F3F46] text-[#A1A1AA] hover:border-[#D4AF37]"}`}>
                        {m === "pix" ? "Pix" : m === "cartao" ? "Cartão" : "Dinheiro"}
                      </button>
                    ))}
                  </div>

                  {payment === "pix" && (
                    <div className="mt-3 bg-[#22C55E]/10 border border-[#22C55E] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <QrCode size={18} className="text-[#22C55E]" />
                        <h3 className="text-sm font-bold text-[#22C55E]">Pagamento via Pix</h3>
                      </div>
                      <p className="text-xs text-[#A1A1AA] mb-3">Copie a chave, faça o pagamento e envie o comprovante no WhatsApp.</p>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-[#0A0A0A] p-2 rounded-lg text-xs break-all font-mono text-white border border-[#3F3F46]">{PIX_KEY}</code>
                        <button onClick={copyPix} className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-3 rounded-lg text-xs font-bold transition-colors">
                          {copied ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase mb-1 block">Observações</label>
                  <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Preferência de marca, sabor ou substituição..." rows={2} className="w-full bg-[#18181B] border border-[#3F3F46] rounded-lg p-3 text-sm focus:border-[#D4AF37] focus:outline-none resize-none transition-colors" />
                </div>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="p-4 bg-[#18181B] border-t border-[#3F3F46] space-y-3">
              <div className="flex justify-between text-sm text-[#A1A1AA]">
                <span>Produtos</span>
                <span>R$ {(subtotal / 100).toFixed(2).replace(".", ",")}</span>
              </div>
              {orderType === "delivery" && (
                <div className="flex justify-between text-sm text-[#A1A1AA]">
                  <span>Taxa de entrega</span>
                  <span>R$ {(deliveryFee / 100).toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-[#D4AF37] pt-2 border-t border-[#3F3F46]">
                <span>TOTAL</span>
                <span>R$ {(total / 100).toFixed(2).replace(".", ",")}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!minOrderMet || cart.length === 0 || !customerName}
                className="w-full bg-[#D4AF37] hover:bg-[#E8C84A] disabled:bg-[#3F3F46] disabled:text-[#71717A] disabled:cursor-not-allowed text-[#0A0A0A] font-bold py-4 rounded-xl shadow-lg transition-all flex flex-col items-center justify-center"
              >
                <span className="text-lg">Finalizar pedido · R$ {(total / 100).toFixed(2).replace(".", ",")}</span>
                <span className="text-xs font-medium opacity-80">Enviar pelo WhatsApp</span>
              </button>
              <p className="text-center text-[10px] text-[#A1A1AA]">Pedido via WhatsApp: 47 99286-9293</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}