-- Add rating field to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE products ADD COLUMN rating NUMERIC(3,1) DEFAULT 0;
    END IF;
END $$;

-- Update existing products with random ratings for demo purposes
UPDATE products
SET rating = ROUND(CAST(3 + RANDOM() * 2 AS NUMERIC), 1)
WHERE rating IS NULL OR rating = 0;

