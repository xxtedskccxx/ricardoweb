ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_location boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS location_latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS location_longitude numeric(9,6);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_location_latitude_check'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_location_latitude_check
      CHECK (location_latitude IS NULL OR location_latitude BETWEEN -90 AND 90);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_location_longitude_check'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_location_longitude_check
      CHECK (location_longitude IS NULL OR location_longitude BETWEEN -180 AND 180);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_location_coordinates_pair_check'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_location_coordinates_pair_check
      CHECK ((location_latitude IS NULL) = (location_longitude IS NULL));
  END IF;
END $$;
