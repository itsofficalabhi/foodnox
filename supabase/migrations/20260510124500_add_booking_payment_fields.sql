ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'pay_at_restaurant',
  ADD COLUMN IF NOT EXISTS payment_status public.payment_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS booking_fee INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;
