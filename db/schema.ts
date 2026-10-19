import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  imageUrl: text('image_url').notNull(),
  category: text('category').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  type: text('type').notNull().$type<'unidade' | 'fardo'>(),
  priceCents: integer('price_cents').notNull(),
  unitLabel: text('unit_label').notNull(),
  packQuantity: integer('pack_quantity'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bairros = pgTable('bairros', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  deliveryFeeCents: integer('delivery_fee_cents').notNull(),
  minOrderCents: integer('min_order_cents').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerName: text('customer_name').notNull(),
  orderType: text('order_type').notNull().$type<'delivery' | 'retirada'>(),
  bairroId: uuid('bairro_id').references(() => bairros.id, { onDelete: 'set null' }),
  ruaNumero: text('rua_numero'),
  lat: text('lat'),
  lng: text('lng'),
  paymentMethod: text('payment_method').notNull().$type<'pix' | 'cartao' | 'dinheiro'>(),
  observations: text('observations'),
  subtotalCents: integer('subtotal_cents').notNull(),
  deliveryFeeCents: integer('delivery_fee_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull(),
  itemsSnapshot: jsonb('items_snapshot').notNull(),
  whatsappPhone: text('whatsapp_phone').notNull().default('47992869293'),
  status: text('status').notNull().default('pending').$type<'pending' | 'confirmed' | 'cancelled'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});