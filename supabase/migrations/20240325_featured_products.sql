-- Create featured_products table
CREATE TABLE IF NOT EXISTS featured_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Create RLS policies for featured_products
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

-- Policy for reading featured products (public)
CREATE POLICY "Anyone can read featured products" 
ON featured_products FOR SELECT 
USING (true);

-- Policy for managing featured products (admin only)
CREATE POLICY "Only admins can manage featured products" 
ON featured_products FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

