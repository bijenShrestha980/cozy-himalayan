-- Drop all problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update any order" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Create new policies that avoid recursion by using JWT claims instead of querying the users table

-- Users table policies
CREATE POLICY "Admins can view all users" 
ON users FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM auth.jwt() 
    WHERE auth.jwt() ->> 'role' = 'admin'
  )
);

-- Products table policies
CREATE POLICY "Admins can insert products" 
ON products FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM auth.jwt() 
    WHERE auth.jwt() ->> 'role' = 'admin'
  )
);

CREATE POLICY "Admins can update products" 
ON products FOR UPDATE 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM auth.jwt() 
    WHERE auth.jwt() ->> 'role' = 'admin'
  )
)
WITH CHECK (true);

CREATE POLICY "Admins can delete products" 
ON products FOR DELETE 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM auth.jwt() 
    WHERE auth.jwt() ->> 'role' = 'admin'
  )
);

-- Categories table policies
CREATE POLICY "Admins can manage categories" 
ON categories FOR ALL 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM auth.jwt() 
    WHERE auth.jwt() ->> 'role' = 'admin'
  )
);

-- Orders table policies
CREATE POLICY "Admins can view all orders" 
ON orders FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM auth.jwt() 
    WHERE auth.jwt() ->> 'role' = 'admin'
  )
);

CREATE POLICY "Admins can update any order" 
ON orders FOR UPDATE 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM auth.jwt() 
    WHERE auth.jwt() ->> 'role' = 'admin'
  )
)
WITH CHECK (true);

-- Order items policies
CREATE POLICY "Admins can view all order items" 
ON order_items FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM auth.jwt() 
    WHERE auth.jwt() ->> 'role' = 'admin'
  )
);

-- Alternative approach using auth.uid() and raw_user_meta_data
-- If the JWT approach doesn't work, uncomment and use this approach instead

/*
-- Users table policies
CREATE POLICY "Admins can view all users" 
ON users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Products table policies
CREATE POLICY "Admins can insert products" 
ON products FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can update products" 
ON products FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (true);

CREATE POLICY "Admins can delete products" 
ON products FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Categories table policies
CREATE POLICY "Admins can manage categories" 
ON categories FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Orders table policies
CREATE POLICY "Admins can view all orders" 
ON orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can update any order" 
ON orders FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (true);

-- Order items policies
CREATE POLICY "Admins can view all order items" 
ON order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);
*/

