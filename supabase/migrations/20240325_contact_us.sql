-- Create contact_us table
CREATE TABLE IF NOT EXISTS contact_us (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  map_url TEXT,
  social_media JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table for storing form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for contact_us
ALTER TABLE contact_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy for reading contact_us (public)
CREATE POLICY "Anyone can read contact_us" 
ON contact_us FOR SELECT 
USING (true);

-- Policy for managing contact_us (admin only)
CREATE POLICY "Only admins can manage contact_us" 
ON contact_us FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Policy for inserting contact_messages (public)
CREATE POLICY "Anyone can submit contact messages" 
ON contact_messages FOR INSERT 
WITH CHECK (true);

-- Policy for reading and managing contact_messages (admin only)
CREATE POLICY "Only admins can read contact messages" 
ON contact_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Only admins can update contact messages" 
ON contact_messages FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Insert default contact_us content
INSERT INTO contact_us (title, content, email, phone, address, social_media)
VALUES (
  'Contact Us',
  'We''d love to hear from you! Please fill out the form below or use our contact information to get in touch.',
  'support@cozyhimalayan.com',
  '+1 (555) 123-4567',
  '123 E-Commerce St, Shopping City, SC 12345',
  '[
    {"platform": "Facebook", "url": "https://facebook.com/cozyhimalayan"},
    {"platform": "Twitter", "url": "https://twitter.com/cozyhimalayan"},
    {"platform": "Instagram", "url": "https://instagram.com/cozyhimalayan"}
  ]'
)
ON CONFLICT (id) DO NOTHING;

