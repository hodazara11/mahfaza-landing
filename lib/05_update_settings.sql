-- ============================================================================
-- Update Site Settings — Run in Supabase SQL Editor
-- This syncs the database with the latest values (social links + refund policy)
-- ============================================================================

-- Update social media links
UPDATE site_settings
SET value = '"https://www.instagram.com/ssolutions01/"'::jsonb,
    updated_at = NOW()
WHERE key = 'social_instagram';

UPDATE site_settings
SET value = '"https://www.facebook.com/share/1H2mwrtZ5h/"'::jsonb,
    updated_at = NOW()
WHERE key = 'social_facebook';

UPDATE site_settings
SET value = '"https://www.tiktok.com/@smartsolutions011"'::jsonb,
    updated_at = NOW()
WHERE key = 'social_tiktok';

-- Confirm refund window is 3 days (already correct from seed)
UPDATE site_settings
SET value = '3'::jsonb,
    updated_at = NOW()
WHERE key = 'refund_window_days';

-- Verify
SELECT key, value, updated_at
FROM site_settings
WHERE key IN ('social_instagram', 'social_facebook', 'social_tiktok', 'refund_window_days')
ORDER BY key;
