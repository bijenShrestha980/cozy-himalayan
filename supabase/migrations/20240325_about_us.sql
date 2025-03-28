-- Create about_us table
CREATE TABLE IF NOT EXISTS about_us (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mission TEXT,
  vision TEXT,
  team_members JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for about_us
ALTER TABLE about_us ENABLE ROW LEVEL SECURITY;

-- Policy for reading about_us (public)
CREATE POLICY "Anyone can read about_us" 
ON about_us FOR SELECT 
USING (true);

-- Policy for managing about_us (admin only)
CREATE POLICY "Only admins can manage about_us" 
ON about_us FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Insert default about_us content
INSERT INTO about_us (title, content, mission, vision, team_members)
VALUES (
  'About Cozy Himalayan',
  'Cozy Himalayan is a premier e-commerce platform dedicated to providing high-quality products at competitive prices. Founded in 2023, we have quickly grown to become a trusted name in online shopping.',
  'Our mission is to make online shopping easy, secure, and enjoyable for everyone.',
  'We envision a world where quality products are accessible to all, with a seamless shopping experience from browsing to delivery.',
  '[
    {"name": "John Doe", "position": "CEO", "bio": "John has over 15 years of experience in retail and e-commerce."},
    {"name": "Jane Smith", "position": "CTO", "bio": "Jane leads our technology team with expertise in building scalable platforms."},
    {"name": "Michael Johnson", "position": "Head of Customer Service", "bio": "Michael ensures that our customers always receive exceptional support."}
  ]'
)
ON CONFLICT (id) DO NOTHING;

