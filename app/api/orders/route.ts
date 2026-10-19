import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, bairros } from '@/db/schema';
import { eq } from 'drizzle-orm';

const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '5547992869293';
const PIX_KEY = process.env.PIX_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      orderType,
      bairroId,
      ruaNumero,
      lat,
      lng,
      paymentMethod,
      observations,
      items,
    } = body;

    // Validation
    if (!customerName || !orderType || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let deliveryFeeCents = 0;
    let minOrderCents = 0;
    let bairroName = '';

    if (orderType === 'delivery') {
      if (!bairroId) {
        return NextResponse.json({ error: 'Bairro required for delivery' }, { status: 400 });
      }
      const bairro = await db.query.bairros.findFirst({ where: eq(bairros.id, bairroId) });
      if (!bairro) {
        return NextResponse.json({ error: 'Invalid bairro' }, { status: 400 });
      }
      deliveryFeeCents = bairro.deliveryFeeCents;
      minOrderCents = bairro.minOrderCents;
      bairroName = bairro.name;
    }

    const subtotalCents = items.reduce((sum: number, item: any) => sum + (item.priceCents * item.quantity), 0);

    if (orderType === 'delivery' && subtotalCents < minOrderCents) {
      return NextResponse.json({
        error: `Minimum order for ${bairroName} is R$ ${(minOrderCents / 100).toFixed(2)}`,
      }, { status: 400 });
    }

    const totalCents = subtotalCents + deliveryFeeCents;

    // Persist order
    const [newOrder] = await db.insert(orders).values({
      customerName,
      orderType,
      bairroId: orderType === 'delivery' ? bairroId : null,
      ruaNumero,
      lat,
      lng,
      paymentMethod,
      observations,
      subtotalCents,
      deliveryFeeCents,
      totalCents,
      itemsSnapshot: items,
      whatsappPhone: WHATSAPP_PHONE,
      status: 'pending',
    }).returning();

    // Build WhatsApp message
    const itemsText = items.map((i: any) => `• ${i.quantity}x ${i.name} (${i.variantLabel})`).join('\n');
    const msg = `*Novo Pedido - Leo Bebidas*\n` +
      `*Cliente:* ${customerName}\n` +
      `*Tipo:* ${orderType === 'delivery' ? 'Entrega' : 'Retirada'}\n` +
      (orderType === 'delivery' ? `*Bairro:* ${bairroName}\n*Endereço:* ${ruaNumero}\n` : '') +
      `*Pagamento:* ${paymentMethod.toUpperCase()}\n` +
      (paymentMethod === 'pix' ? `*Chave Pix:* ${PIX_KEY}\n` : '') +
      (observations ? `*Obs:* ${observations}\n` : '') +
      `\n*Itens:*\n${itemsText}\n` +
      `*Subtotal:* R$ ${(subtotalCents / 100).toFixed(2).replace('.', ',')}\n` +
      (deliveryFeeCents > 0 ? `*Taxa de entrega:* R$ ${(deliveryFeeCents / 100).toFixed(2).replace('.', ',')}\n` : '') +
      `*TOTAL: R$ ${(totalCents / 100).toFixed(2).replace('.', ',')}*`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;

    return NextResponse.json({ orderId: newOrder.id, whatsappUrl, totalCents });
  } catch (err) {
    console.error('Order creation failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}