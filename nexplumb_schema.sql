-- ============================================================
-- NEXPLUMB DATABASE SCHEMA
-- Part 1: Extensions, Enums, Core User Tables
-- Stack: Supabase (PostgreSQL 15+)
-- All monetary values stored in KOBO (₦1 = 100 kobo)
-- ============================================================

-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy search on names
CREATE EXTENSION IF NOT EXISTS "postgis";       -- GPS coordinates & geo queries
CREATE EXTENSION IF NOT EXISTS "pg_cron";       -- scheduled jobs
CREATE EXTENSION IF NOT EXISTS "unaccent";      -- accent-insensitive search


-- ============================================================
-- SECTION 2: ENUMS
-- ============================================================

-- User roles across all portals
CREATE TYPE user_role AS ENUM (
  'customer',
  'artisan',
  'supplier',
  'enterprise_admin',
  'enterprise_staff',
  'admin',
  'super_admin'
);

-- Artisan trades (Phase 1 core + Phase 2 expansions)
CREATE TYPE artisan_trade AS ENUM (
  'plumbing',
  'electrical',
  'carpentry',
  'painting',
  'tiling',
  'masonry',
  'roofing',
  'welding',
  'ac_technician',
  'appliance_repair',
  'fumigation',
  'generator_repair',
  'borehole',
  'landscaping',
  'interior_design',
  'security_installation',
  'solar_installation',
  'general_handyman'
);

-- Artisan account status
CREATE TYPE artisan_status AS ENUM (
  'pending',        -- just registered, not yet verified
  'under_review',   -- KYC documents submitted
  'approved',       -- active and bookable
  'suspended',      -- temporarily banned
  'blacklisted',    -- permanently banned
  'deactivated'     -- self-deactivated
);

-- Job lifecycle states
CREATE TYPE job_status AS ENUM (
  'pending',         -- customer posted, no artisan assigned yet
  'quoted',          -- artisan sent quote, awaiting customer acceptance
  'accepted',        -- customer accepted quote, awaiting payment
  'paid',            -- escrow funded, artisan notified
  'en_route',        -- artisan travelling to site
  'on_site',         -- artisan checked in at location
  'in_progress',     -- work started
  'completed',       -- artisan marked done, awaiting customer confirm
  'confirmed',       -- customer confirmed, escrow released ✓
  'disputed',        -- dispute filed on this job
  'cancelled',       -- cancelled before work started
  'refunded'         -- escrow refunded to customer
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'successful',
  'failed',
  'refunded',
  'partially_refunded'
);

-- Payment gateway
CREATE TYPE payment_gateway AS ENUM (
  'paystack',
  'manual',         -- admin-processed
  'wallet'          -- paid from customer wallet
);

-- Escrow status
CREATE TYPE escrow_status AS ENUM (
  'held',
  'released',
  'refunded',
  'partially_released',
  'frozen'          -- admin-frozen pending dispute
);

-- Dispute status
CREATE TYPE dispute_status AS ENUM (
  'open',
  'under_review',
  'awaiting_evidence',
  'resolved_customer',
  'resolved_artisan',
  'resolved_split',
  'escalated',
  'closed'
);

-- Dispute filed by role
CREATE TYPE dispute_filer AS ENUM ('customer', 'artisan', 'admin');

-- Notification channel
CREATE TYPE notification_channel AS ENUM (
  'push',
  'sms',
  'email',
  'whatsapp',
  'in_app'
);

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'job_new',
  'job_accepted',
  'job_paid',
  'job_en_route',
  'job_on_site',
  'job_completed',
  'job_confirmed',
  'job_cancelled',
  'job_disputed',
  'payment_received',
  'payment_failed',
  'escrow_released',
  'escrow_refunded',
  'withdrawal_processed',
  'withdrawal_failed',
  'review_received',
  'review_reply',
  'dispute_update',
  'dispute_resolved',
  'kyc_approved',
  'kyc_rejected',
  'account_suspended',
  'badge_awarded',
  'promo',
  'system'
);

-- WhatsApp session state
CREATE TYPE whatsapp_session_status AS ENUM (
  'active',
  'idle',
  'closed',
  'blocked'
);

-- Artisan verification document types
CREATE TYPE verification_doc_type AS ENUM (
  'nin',              -- National Identity Number
  'bvn',              -- Bank Verification Number
  'cac',              -- Business registration
  'trade_certificate',
  'guarantor_form',
  'face_photo',
  'utility_bill'
);

-- Artisan badge types
CREATE TYPE artisan_badge AS ENUM (
  'top_rated',        -- 4.8+ rating, 50+ jobs
  'verified_pro',     -- full KYC passed
  'fast_responder',   -- avg response < 15 min
  'reliable',         -- 95%+ completion rate
  'experienced',      -- 200+ jobs
  'eco_friendly',     -- uses sustainable materials
  'background_checked'
);

-- Supplier status
CREATE TYPE supplier_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'blacklisted'
);

-- Product status
CREATE TYPE product_status AS ENUM (
  'draft',
  'active',
  'out_of_stock',
  'discontinued'
);

-- Material order status
CREATE TYPE material_order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'ready_for_pickup',
  'dispatched',
  'delivered',
  'cancelled',
  'refunded'
);

-- Enterprise account plan
CREATE TYPE enterprise_plan AS ENUM (
  'starter',
  'growth',
  'premium',
  'custom'
);

-- Credit application status (Phase 3)
CREATE TYPE credit_status AS ENUM (
  'not_applied',
  'applied',
  'under_review',
  'approved',
  'rejected',
  'active',
  'defaulted',
  'paid_off'
);

-- Withdrawal status
CREATE TYPE withdrawal_status AS ENUM (
  'pending',
  'processing',
  'successful',
  'failed',
  'reversed'
);

-- Job urgency type
CREATE TYPE job_urgency AS ENUM (
  'standard',   -- normal booking
  'urgent'      -- +30% premium, within 2 hours
);

-- Days of week for availability
CREATE TYPE day_of_week AS ENUM (
  'monday', 'tuesday', 'wednesday', 'thursday',
  'friday', 'saturday', 'sunday'
);


-- ============================================================
-- SECTION 3: PROFILES (Supabase auth.users mirror)
-- ============================================================

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'customer',
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  phone           TEXT NOT NULL UNIQUE,       -- +234 format, validated
  phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  email           TEXT,
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url      TEXT,                       -- Supabase storage path
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen_at    TIMESTAMPTZ,
  device_tokens   TEXT[] DEFAULT '{}',        -- FCM push tokens
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_phone_format CHECK (phone ~ '^\+234[0-9]{10}$')
);

CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_role  ON profiles(role);


-- ============================================================
-- SECTION 4: CUSTOMERS
-- ============================================================

CREATE TABLE customers (
  id                  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- Location
  default_address     TEXT,
  default_lga         TEXT,                   -- Lagos LGA
  default_state       TEXT DEFAULT 'Lagos',
  default_lat         DOUBLE PRECISION,
  default_lng         DOUBLE PRECISION,
  -- Stats
  total_jobs          INTEGER NOT NULL DEFAULT 0,
  total_spent         BIGINT  NOT NULL DEFAULT 0,  -- kobo
  -- Preferences
  preferred_language  TEXT DEFAULT 'en',
  receives_promos     BOOLEAN DEFAULT TRUE,
  -- Referral
  referral_code       TEXT UNIQUE DEFAULT UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  referred_by         UUID REFERENCES customers(id),
  referral_credits    BIGINT DEFAULT 0,           -- kobo
  -- Meta
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_lga ON customers(default_lga);
CREATE INDEX idx_customers_referral_code ON customers(referral_code);


-- ============================================================
-- SECTION 5: ARTISANS
-- ============================================================

CREATE TABLE artisans (
  id                  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- Identity
  slug                TEXT UNIQUE,             -- URL-friendly: john-doe-plumber-ikeja
  trade               artisan_trade NOT NULL,
  bio                 TEXT,                    -- max 500 chars, Lora font
  years_experience    SMALLINT DEFAULT 0,
  -- Location & service area
  lga                 TEXT NOT NULL,           -- primary LGA
  state               TEXT NOT NULL DEFAULT 'Lagos',
  service_lgas        TEXT[] DEFAULT '{}',     -- additional LGAs served
  lat                 DOUBLE PRECISION,
  lng                 DOUBLE PRECISION,
  current_lat         DOUBLE PRECISION,        -- live GPS (realtime)
  current_lng         DOUBLE PRECISION,
  last_gps_update     TIMESTAMPTZ,
  -- Account status
  status              artisan_status NOT NULL DEFAULT 'pending',
  approved_at         TIMESTAMPTZ,
  approved_by         UUID,                    -- admin who approved
  suspended_at        TIMESTAMPTZ,
  suspension_reason   TEXT,
  -- KYC
  nin_number          TEXT,                    -- encrypted
  nin_verified        BOOLEAN DEFAULT FALSE,
  bvn_verified        BOOLEAN DEFAULT FALSE,
  face_verified       BOOLEAN DEFAULT FALSE,
  background_checked  BOOLEAN DEFAULT FALSE,
  -- Ratings
  rating_avg          NUMERIC(3,2) DEFAULT 0.00,
  rating_count        INTEGER DEFAULT 0,
  -- Job stats
  total_jobs          INTEGER DEFAULT 0,
  completion_rate     NUMERIC(5,2) DEFAULT 0.00,  -- 0-100%
  avg_response_time   INTEGER DEFAULT 0,           -- minutes
  -- Wallet
  wallet_balance      BIGINT DEFAULT 0,            -- kobo, available
  wallet_pending      BIGINT DEFAULT 0,            -- kobo, in escrow
  -- Availability
  is_online           BOOLEAN DEFAULT FALSE,
  accepts_urgent      BOOLEAN DEFAULT TRUE,
  -- Bank details (for withdrawals)
  bank_name           TEXT,
  bank_code           TEXT,                    -- Nigerian bank code
  account_number      TEXT,
  account_name        TEXT,
  -- Nex credit score (Phase 3)
  nex_score           INTEGER DEFAULT 0,       -- 0-850
  -- Meta
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artisans_trade       ON artisans(trade);
CREATE INDEX idx_artisans_lga         ON artisans(lga);
CREATE INDEX idx_artisans_status      ON artisans(status);
CREATE INDEX idx_artisans_rating      ON artisans(rating_avg DESC);
CREATE INDEX idx_artisans_online      ON artisans(is_online) WHERE is_online = TRUE;
CREATE INDEX idx_artisans_slug        ON artisans(slug);
CREATE INDEX idx_artisans_nex_score   ON artisans(nex_score DESC);
-- Geo search index (requires PostGIS)
CREATE INDEX idx_artisans_geo         ON artisans USING GIST(ST_MakePoint(lng, lat));


-- ============================================================
-- SECTION 6: ARTISAN SUB-TABLES
-- ============================================================

-- 6.1 Guarantors (2 required for KYC)
CREATE TABLE artisan_guarantors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id      UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  relationship    TEXT NOT NULL,       -- "Brother", "Employer", etc.
  address         TEXT NOT NULL,
  occupation      TEXT,
  nin_number      TEXT,                -- encrypted
  signed_at       TIMESTAMPTZ,
  signature_url   TEXT,                -- Supabase storage path
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guarantors_artisan ON artisan_guarantors(artisan_id);

-- 6.2 Artisan skills / sub-specialties
CREATE TABLE artisan_skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id  UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  skill       TEXT NOT NULL,           -- e.g. "Burst pipe repair", "PVC piping"
  is_featured BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (artisan_id, skill)
);

CREATE INDEX idx_skills_artisan ON artisan_skills(artisan_id);
CREATE INDEX idx_skills_search  ON artisan_skills USING GIN(to_tsvector('english', skill));

-- 6.3 Portfolio photos
CREATE TABLE artisan_portfolio (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id      UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  photo_url       TEXT NOT NULL,       -- Supabase storage path
  caption         TEXT,
  job_id          UUID,                -- linked job if applicable
  sort_order      SMALLINT DEFAULT 0,
  is_featured     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_artisan ON artisan_portfolio(artisan_id);

-- 6.4 Weekly availability schedule
CREATE TABLE artisan_availability_schedule (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id  UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  day         day_of_week NOT NULL,
  start_time  TIME NOT NULL DEFAULT '08:00',
  end_time    TIME NOT NULL DEFAULT '18:00',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (artisan_id, day)
);

CREATE INDEX idx_schedule_artisan ON artisan_availability_schedule(artisan_id);

-- 6.5 Blocked dates (holidays, leave)
CREATE TABLE artisan_blocked_dates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id  UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason      TEXT,
  UNIQUE (artisan_id, blocked_date)
);

CREATE INDEX idx_blocked_artisan ON artisan_blocked_dates(artisan_id);

-- 6.6 Badge assignments
CREATE TABLE artisan_badge_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id  UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  badge       artisan_badge NOT NULL,
  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_by  UUID,                    -- NULL = auto-awarded by system
  expires_at  TIMESTAMPTZ,             -- NULL = permanent
  is_active   BOOLEAN DEFAULT TRUE,
  UNIQUE (artisan_id, badge)
);

CREATE INDEX idx_badges_artisan ON artisan_badge_assignments(artisan_id);

-- 6.7 Verification document queue
CREATE TABLE artisan_verification_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id      UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  doc_type        verification_doc_type NOT NULL,
  doc_url         TEXT,                -- Supabase storage path
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID,                -- admin ID
  is_approved     BOOLEAN,
  rejection_reason TEXT,
  UNIQUE (artisan_id, doc_type)
);

CREATE INDEX idx_verif_queue_artisan ON artisan_verification_queue(artisan_id);
CREATE INDEX idx_verif_queue_pending ON artisan_verification_queue(reviewed_at) WHERE reviewed_at IS NULL;

-- 6.8 Saved / favourited artisans by customers
CREATE TABLE saved_artisans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  artisan_id  UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, artisan_id)
);

CREATE INDEX idx_saved_customer ON saved_artisans(customer_id);
CREATE INDEX idx_saved_artisan  ON saved_artisans(artisan_id);


-- ============================================================
-- SECTION 7: PRICE ESTIMATES (Lagos market rates)
-- ============================================================

CREATE TABLE price_estimates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade           artisan_trade NOT NULL,
  job_type        TEXT NOT NULL,           -- "Tap replacement", "Pipe repair"
  lga             TEXT,                    -- NULL = applies to all LGAs
  complexity      TEXT NOT NULL DEFAULT 'standard', -- simple / standard / complex
  price_budget    BIGINT NOT NULL,         -- kobo (lower bound)
  price_typical   BIGINT NOT NULL,         -- kobo (recommended)
  price_premium   BIGINT NOT NULL,         -- kobo (upper bound)
  is_active       BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trade, job_type, lga, complexity)
);

CREATE INDEX idx_price_est_trade ON price_estimates(trade);


-- ============================================================
-- NEXPLUMB DATABASE SCHEMA
-- Part 2: Jobs, Payments, Escrow, Reviews
-- ============================================================


-- ============================================================
-- SECTION 8: JOBS
-- ============================================================

CREATE TABLE jobs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference               TEXT UNIQUE,                -- NX-2025-00001

  -- Parties
  customer_id             UUID NOT NULL REFERENCES customers(id),
  artisan_id              UUID REFERENCES artisans(id),

  -- Job details
  trade                   artisan_trade NOT NULL,
  title                   TEXT NOT NULL,
  description             TEXT NOT NULL,
  urgency                 job_urgency NOT NULL DEFAULT 'standard',

  -- Location
  address                 TEXT NOT NULL,
  lga                     TEXT NOT NULL,
  state                   TEXT NOT NULL DEFAULT 'Lagos',
  lat                     DOUBLE PRECISION,
  lng                     DOUBLE PRECISION,
  location_notes          TEXT,                       -- "Red gate, call on arrival"

  -- Scheduling
  preferred_date          DATE,
  preferred_time_slot     TEXT,                       -- "morning", "afternoon", "evening", "anytime"
  scheduled_at            TIMESTAMPTZ,

  -- Photos (before/after)
  customer_photos         TEXT[] DEFAULT '{}',        -- storage paths
  artisan_before_photos   TEXT[] DEFAULT '{}',
  artisan_after_photos    TEXT[] DEFAULT '{}',

  -- Pricing (all in kobo)
  quoted_price            BIGINT,                     -- artisan's quote
  agreed_price            BIGINT,                     -- accepted price
  urgency_premium         BIGINT DEFAULT 0,           -- +30% if urgent
  platform_fee            BIGINT DEFAULT 0,           -- 12% of agreed_price
  materials_cost          BIGINT DEFAULT 0,           -- if artisan supplies materials
  total_amount            BIGINT,                     -- agreed + premium + fee + materials

  -- Status
  status                  job_status NOT NULL DEFAULT 'pending',

  -- Key timestamps
  quoted_at               TIMESTAMPTZ,
  accepted_at             TIMESTAMPTZ,
  paid_at                 TIMESTAMPTZ,
  artisan_en_route_at     TIMESTAMPTZ,
  artisan_on_site_at      TIMESTAMPTZ,
  work_started_at         TIMESTAMPTZ,
  work_completed_at       TIMESTAMPTZ,
  customer_confirmed_at   TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,

  -- Cancellation
  cancelled_by            UUID,
  cancellation_reason     TEXT,

  -- Auto-release escrow
  auto_release_at         TIMESTAMPTZ,               -- work_completed_at + 24h
  auto_released           BOOLEAN DEFAULT FALSE,

  -- Enterprise link (Phase 2)
  enterprise_id           UUID,
  property_id             UUID,

  -- Meta
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_customer   ON jobs(customer_id);
CREATE INDEX idx_jobs_artisan    ON jobs(artisan_id);
CREATE INDEX idx_jobs_status     ON jobs(status);
CREATE INDEX idx_jobs_trade      ON jobs(trade);
CREATE INDEX idx_jobs_lga        ON jobs(lga);
CREATE INDEX idx_jobs_created    ON jobs(created_at DESC);
CREATE INDEX idx_jobs_reference  ON jobs(reference);
CREATE INDEX idx_jobs_auto_release ON jobs(auto_release_at) WHERE auto_released = FALSE AND status = 'completed';
-- Full-text search on job title + description
CREATE INDEX idx_jobs_search     ON jobs USING GIN(to_tsvector('english', title || ' ' || description));


-- 8.1 Job status change history (audit trail)
CREATE TABLE job_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  old_status  job_status,
  new_status  job_status NOT NULL,
  changed_by  UUID,                               -- user who triggered change
  note        TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_job ON job_status_history(job_id);

-- 8.2 GPS tracking log (realtime artisan location during job)
CREATE TABLE job_gps_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  artisan_id  UUID NOT NULL REFERENCES artisans(id),
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  accuracy    REAL,                               -- metres
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gps_log_job     ON job_gps_log(job_id);
CREATE INDEX idx_gps_log_artisan ON job_gps_log(artisan_id);
CREATE INDEX idx_gps_log_time    ON job_gps_log(logged_at DESC);
-- Partition by job_id for efficient cleanup
CREATE INDEX idx_gps_log_job_time ON job_gps_log(job_id, logged_at DESC);

-- 8.3 In-job chat messages
CREATE TABLE job_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id),
  message     TEXT,
  photo_url   TEXT,                               -- optional image attachment
  is_read     BOOLEAN DEFAULT FALSE,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_job    ON job_messages(job_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON job_messages(sender_id);
CREATE INDEX idx_messages_unread ON job_messages(job_id) WHERE is_read = FALSE;

-- 8.4 Available jobs feed for artisans (nearby jobs matching their trade)
CREATE TABLE available_jobs_feed (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  artisan_id  UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  distance_km NUMERIC(6,2),                       -- calculated distance
  notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seen_at     TIMESTAMPTZ,
  dismissed   BOOLEAN DEFAULT FALSE,
  UNIQUE (job_id, artisan_id)
);

CREATE INDEX idx_feed_artisan ON available_jobs_feed(artisan_id, notified_at DESC);
CREATE INDEX idx_feed_job     ON available_jobs_feed(job_id);


-- ============================================================
-- SECTION 9: PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID NOT NULL REFERENCES jobs(id),
  customer_id         UUID NOT NULL REFERENCES customers(id),

  -- Paystack
  gateway             payment_gateway NOT NULL DEFAULT 'paystack',
  paystack_reference  TEXT UNIQUE,               -- PSK reference
  paystack_access_code TEXT,                     -- for inline popup
  authorization_url   TEXT,                      -- redirect URL

  -- Amounts (kobo)
  amount              BIGINT NOT NULL,           -- total charged
  gateway_fee         BIGINT DEFAULT 0,          -- Paystack fee (1.5% + ₦100 cap ₦2000)
  amount_net          BIGINT,                    -- amount - gateway_fee

  -- Status
  status              payment_status NOT NULL DEFAULT 'pending',
  failure_reason      TEXT,

  -- Timestamps
  initiated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at         TIMESTAMPTZ,
  failed_at           TIMESTAMPTZ,
  refunded_at         TIMESTAMPTZ,

  -- Refund
  refund_amount       BIGINT,
  refund_reason       TEXT,
  refund_reference    TEXT,

  -- Webhook
  webhook_received_at TIMESTAMPTZ,
  webhook_data        JSONB,                     -- raw Paystack webhook payload

  -- Meta
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_job        ON payments(job_id);
CREATE INDEX idx_payments_customer   ON payments(customer_id);
CREATE INDEX idx_payments_status     ON payments(status);
CREATE INDEX idx_payments_paystack   ON payments(paystack_reference);
CREATE INDEX idx_payments_created    ON payments(created_at DESC);


-- ============================================================
-- SECTION 10: ESCROW
-- ============================================================

CREATE TABLE escrow_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID NOT NULL UNIQUE REFERENCES jobs(id),
  payment_id          UUID NOT NULL REFERENCES payments(id),
  customer_id         UUID NOT NULL REFERENCES customers(id),
  artisan_id          UUID NOT NULL REFERENCES artisans(id),

  -- Amounts (kobo)
  amount_held         BIGINT NOT NULL,           -- total held
  platform_fee        BIGINT NOT NULL,           -- nexplumb cut
  artisan_net         BIGINT NOT NULL,           -- artisan receives this

  -- Status
  status              escrow_status NOT NULL DEFAULT 'held',

  -- Key timestamps
  held_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at         TIMESTAMPTZ,
  refunded_at         TIMESTAMPTZ,

  -- Admin override
  released_by         UUID,                      -- admin who released manually
  refunded_by         UUID,
  override_reason     TEXT,                      -- if admin overrode auto-release

  -- Meta
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escrow_job      ON escrow_records(job_id);
CREATE INDEX idx_escrow_artisan  ON escrow_records(artisan_id);
CREATE INDEX idx_escrow_customer ON escrow_records(customer_id);
CREATE INDEX idx_escrow_status   ON escrow_records(status);
CREATE INDEX idx_escrow_held_status ON escrow_records(status) WHERE status = 'held';

-- Artisan wallet transaction ledger
CREATE TABLE artisan_wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id      UUID NOT NULL REFERENCES artisans(id),
  job_id          UUID REFERENCES jobs(id),
  escrow_id       UUID REFERENCES escrow_records(id),
  type            TEXT NOT NULL,                 -- 'credit', 'debit', 'pending', 'withdrawal'
  amount          BIGINT NOT NULL,               -- kobo (positive for credit)
  balance_after   BIGINT NOT NULL,               -- wallet balance after this tx
  description     TEXT NOT NULL,
  reference       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artisan_wallet_tx_artisan ON artisan_wallet_transactions(artisan_id, created_at DESC);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id      UUID NOT NULL REFERENCES artisans(id),
  amount          BIGINT NOT NULL,               -- kobo
  bank_name       TEXT NOT NULL,
  bank_code       TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  account_name    TEXT NOT NULL,
  status          withdrawal_status NOT NULL DEFAULT 'pending',
  -- Paystack transfer
  transfer_code   TEXT,
  transfer_reference TEXT,
  failure_reason  TEXT,
  -- Timestamps
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  -- Admin
  processed_by    UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_artisan ON withdrawal_requests(artisan_id, requested_at DESC);
CREATE INDEX idx_withdrawals_status  ON withdrawal_requests(status);

-- Customer wallet (for referral credits, refunds, promos)
CREATE TABLE customer_wallets (
  id              UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  balance         BIGINT NOT NULL DEFAULT 0,     -- kobo
  total_earned    BIGINT NOT NULL DEFAULT 0,
  total_spent     BIGINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  job_id          UUID REFERENCES jobs(id),
  type            TEXT NOT NULL,                 -- 'referral_credit', 'promo', 'refund', 'payment'
  amount          BIGINT NOT NULL,               -- kobo
  balance_after   BIGINT NOT NULL,
  description     TEXT NOT NULL,
  reference       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cust_wallet_tx ON customer_wallet_transactions(customer_id, created_at DESC);


-- ============================================================
-- SECTION 11: REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL UNIQUE REFERENCES jobs(id),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  artisan_id      UUID NOT NULL REFERENCES artisans(id),

  -- Ratings (1-5)
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rating_quality  SMALLINT CHECK (rating_quality BETWEEN 1 AND 5),
  rating_punctuality SMALLINT CHECK (rating_punctuality BETWEEN 1 AND 5),
  rating_value    SMALLINT CHECK (rating_value BETWEEN 1 AND 5),
  rating_comms    SMALLINT CHECK (rating_comms BETWEEN 1 AND 5),

  -- Content
  review_text     TEXT,                          -- max 1000 chars
  photos          TEXT[] DEFAULT '{}',           -- storage paths

  -- Moderation
  is_visible      BOOLEAN DEFAULT TRUE,
  flagged         BOOLEAN DEFAULT FALSE,
  flagged_reason  TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_artisan  ON reviews(artisan_id, created_at DESC);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_rating   ON reviews(artisan_id, rating DESC);

-- Artisan reply to review
CREATE TABLE review_replies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  artisan_id  UUID NOT NULL REFERENCES artisans(id),
  reply_text  TEXT NOT NULL,                     -- max 500 chars
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- NEXPLUMB DATABASE SCHEMA
-- Part 3: Disputes, Admin, Notifications, WhatsApp
-- ============================================================


-- ============================================================
-- SECTION 12: DISPUTES
-- ============================================================

CREATE TABLE disputes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           TEXT UNIQUE,               -- NXD-2025-00001
  job_id              UUID NOT NULL REFERENCES jobs(id),
  escrow_id           UUID REFERENCES escrow_records(id),

  -- Parties
  filed_by            UUID NOT NULL REFERENCES profiles(id),
  filed_against       UUID NOT NULL REFERENCES profiles(id),
  filer_role          dispute_filer NOT NULL,

  -- Details
  status              dispute_status NOT NULL DEFAULT 'open',
  reason_category     TEXT NOT NULL,             -- 'incomplete_work', 'poor_quality', 'no_show', 'overcharge', 'damage', 'other'
  description         TEXT NOT NULL,
  evidence_urls       TEXT[] DEFAULT '{}',        -- storage paths

  -- Resolution
  resolution          TEXT,
  resolution_amount   BIGINT,                    -- kobo (if partial refund)
  resolved_at         TIMESTAMPTZ,
  resolved_by         UUID,                      -- admin

  -- SLA
  sla_deadline        TIMESTAMPTZ,               -- filed_at + 48h
  sla_breached        BOOLEAN DEFAULT FALSE,
  escalated_at        TIMESTAMPTZ,
  escalated_to        UUID,                      -- senior admin

  -- Meta
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disputes_job      ON disputes(job_id);
CREATE INDEX idx_disputes_filed_by ON disputes(filed_by);
CREATE INDEX idx_disputes_status   ON disputes(status);
CREATE INDEX idx_disputes_sla      ON disputes(sla_deadline) WHERE status IN ('open', 'under_review');
CREATE INDEX idx_disputes_created  ON disputes(created_at DESC);

-- Dispute timeline / audit trail
CREATE TABLE dispute_timeline (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id  UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  actor_id    UUID,                              -- admin or party
  action      TEXT NOT NULL,                    -- 'filed', 'evidence_added', 'admin_reviewed', 'resolved'
  note        TEXT,
  attachments TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispute_timeline ON dispute_timeline(dispute_id, created_at);


-- ============================================================
-- SECTION 13: ADMIN PORTAL
-- ============================================================

CREATE TABLE admin_profiles (
  id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  admin_role      TEXT NOT NULL DEFAULT 'support',   -- 'support', 'operations', 'finance', 'super_admin'
  department      TEXT,
  permissions     TEXT[] DEFAULT '{}',               -- granular permissions array
  created_by      UUID,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin action log (immutable audit trail)
CREATE TABLE admin_action_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES admin_profiles(id),
  action_type     TEXT NOT NULL,                 -- 'approve_artisan', 'suspend_user', 'release_escrow', etc.
  target_type     TEXT NOT NULL,                 -- 'artisan', 'customer', 'job', 'dispute', 'withdrawal'
  target_id       UUID NOT NULL,
  previous_value  JSONB,
  new_value       JSONB,
  note            TEXT,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_log_admin  ON admin_action_log(admin_id, created_at DESC);
CREATE INDEX idx_admin_log_target ON admin_action_log(target_type, target_id);
CREATE INDEX idx_admin_log_action ON admin_action_log(action_type);

-- Flagged users (for moderation queue)
CREATE TABLE flagged_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  flagged_by      UUID,                          -- user who reported, or NULL if system
  reason          TEXT NOT NULL,
  evidence        TEXT[] DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed', 'actioned'
  reviewed_by     UUID,
  review_note     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);

CREATE INDEX idx_flagged_user   ON flagged_users(user_id);
CREATE INDEX idx_flagged_status ON flagged_users(status) WHERE status = 'pending';

-- Platform metrics daily aggregates
CREATE TABLE platform_metrics_daily (
  metric_date         DATE PRIMARY KEY,
  total_jobs          INTEGER DEFAULT 0,
  completed_jobs      INTEGER DEFAULT 0,
  cancelled_jobs      INTEGER DEFAULT 0,
  disputed_jobs       INTEGER DEFAULT 0,
  new_customers       INTEGER DEFAULT 0,
  new_artisans        INTEGER DEFAULT 0,
  approved_artisans   INTEGER DEFAULT 0,
  revenue_kobo        BIGINT DEFAULT 0,           -- platform fee collected
  gmv_kobo            BIGINT DEFAULT 0,           -- gross merchandise value
  escrow_released_kobo BIGINT DEFAULT 0,
  escrow_refunded_kobo BIGINT DEFAULT 0,
  avg_job_value_kobo  BIGINT DEFAULT 0,
  avg_rating          NUMERIC(3,2),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 14: NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  channel         notification_channel NOT NULL DEFAULT 'in_app',
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  data            JSONB DEFAULT '{}',             -- deep-link data {job_id, artisan_id, etc}
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  -- Delivery tracking
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  failure_reason  TEXT,
  -- External refs
  external_id     TEXT,                           -- FCM message ID, SMS ID, etc
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user       ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notif_unread     ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notif_type       ON notifications(type);

-- Per-user notification preferences
CREATE TABLE notification_preferences (
  id                  UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  -- In-app
  in_app_enabled      BOOLEAN DEFAULT TRUE,
  -- Push notifications
  push_enabled        BOOLEAN DEFAULT TRUE,
  push_job_updates    BOOLEAN DEFAULT TRUE,
  push_promos         BOOLEAN DEFAULT TRUE,
  -- SMS
  sms_enabled         BOOLEAN DEFAULT TRUE,
  sms_job_updates     BOOLEAN DEFAULT TRUE,
  sms_otp             BOOLEAN DEFAULT TRUE,
  -- Email
  email_enabled       BOOLEAN DEFAULT TRUE,
  email_receipts      BOOLEAN DEFAULT TRUE,
  email_newsletter    BOOLEAN DEFAULT FALSE,
  -- WhatsApp
  whatsapp_enabled    BOOLEAN DEFAULT TRUE,
  -- Quiet hours (Lagos time)
  quiet_hours_start   TIME DEFAULT '22:00',
  quiet_hours_end     TIME DEFAULT '07:00',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 15: WHATSAPP SESSIONS
-- ============================================================

-- WhatsApp session per phone number
CREATE TABLE whatsapp_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone               TEXT NOT NULL UNIQUE,      -- +234 format
  user_id             UUID REFERENCES profiles(id),
  session_status      whatsapp_session_status NOT NULL DEFAULT 'active',
  -- State machine
  current_step        TEXT,                      -- 'welcome', 'menu', 'booking_trade', 'booking_address', etc.
  session_data        JSONB DEFAULT '{}',        -- partial booking data, context
  language            TEXT DEFAULT 'en',         -- 'en', 'yo', 'ig', 'ha'
  -- Metrics
  message_count       INTEGER DEFAULT 0,
  last_message_at     TIMESTAMPTZ,
  -- Timestamps
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_sessions_phone  ON whatsapp_sessions(phone);
CREATE INDEX idx_wa_sessions_user   ON whatsapp_sessions(user_id);
CREATE INDEX idx_wa_sessions_active ON whatsapp_sessions(session_status) WHERE session_status = 'active';
CREATE INDEX idx_wa_sessions_last   ON whatsapp_sessions(last_message_at DESC);

-- Individual WhatsApp messages log
CREATE TABLE whatsapp_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  direction       TEXT NOT NULL,                 -- 'inbound' | 'outbound'
  -- WhatsApp message IDs
  wa_message_id   TEXT,                          -- Meta WABA message ID
  -- Content
  message_type    TEXT NOT NULL DEFAULT 'text',  -- 'text', 'interactive', 'template', 'image', 'document'
  message_body    TEXT,
  media_url       TEXT,
  template_name   TEXT,
  template_params JSONB,
  -- Delivery
  status          TEXT DEFAULT 'sent',           -- 'sent', 'delivered', 'read', 'failed'
  error_code      TEXT,
  error_message   TEXT,
  -- Timestamps
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ
);

CREATE INDEX idx_wa_messages_session ON whatsapp_messages(session_id, sent_at DESC);
CREATE INDEX idx_wa_messages_wa_id   ON whatsapp_messages(wa_message_id);

-- WhatsApp template library
CREATE TABLE whatsapp_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,          -- matches Meta approved template name
  description     TEXT,
  language        TEXT NOT NULL DEFAULT 'en',
  category        TEXT NOT NULL,                 -- 'UTILITY', 'MARKETING', 'AUTHENTICATION'
  params_schema   JSONB,                         -- expected parameter keys
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-load core templates
INSERT INTO whatsapp_templates (name, description, category, params_schema) VALUES
  ('booking_confirmation',  'Sent to customer when booking is confirmed',       'UTILITY', '{"job_reference": "string", "artisan_name": "string", "trade": "string", "date": "string"}'),
  ('artisan_assigned',      'Artisan notified of new job',                      'UTILITY', '{"artisan_name": "string", "trade": "string", "customer_address": "string", "amount": "string"}'),
  ('payment_received',      'Customer payment confirmed, escrow funded',         'UTILITY', '{"customer_name": "string", "job_reference": "string", "amount": "string"}'),
  ('artisan_en_route',      'Customer notified artisan is on the way',          'UTILITY', '{"artisan_name": "string", "eta_minutes": "string"}'),
  ('job_completed',         'Customer prompted to confirm job completion',       'UTILITY', '{"artisan_name": "string", "job_reference": "string"}'),
  ('escrow_released',       'Artisan notified payment released to wallet',      'UTILITY', '{"artisan_name": "string", "amount": "string", "wallet_balance": "string"}'),
  ('dispute_opened',        'Both parties notified of dispute',                 'UTILITY', '{"reference": "string", "reason": "string", "sla_deadline": "string"}'),
  ('otp_verification',      'OTP for phone verification',                       'AUTHENTICATION', '{"otp": "string", "expiry_minutes": "string"}');

  -- ============================================================
-- NEXPLUMB DATABASE SCHEMA
-- Part 5: Functions, Triggers, RLS Policies, Cron Jobs,
--          Storage Buckets, Realtime, Seed Data
-- ============================================================


-- ============================================================
-- SECTION 21: SEQUENCES
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS job_reference_seq     START 1;
CREATE SEQUENCE IF NOT EXISTS dispute_reference_seq START 1;
CREATE SEQUENCE IF NOT EXISTS order_reference_seq   START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq    START 1;


-- ============================================================
-- SECTION 22: UTILITY FUNCTIONS
-- ============================================================

-- 22.1 Generate human-readable job reference
CREATE OR REPLACE FUNCTION generate_job_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NX-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('job_reference_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 22.2 Generate dispute reference
CREATE OR REPLACE FUNCTION generate_dispute_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NXD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('dispute_reference_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 22.3 Generate material order reference
CREATE OR REPLACE FUNCTION generate_order_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NXO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_reference_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 22.4 Generate enterprise invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 22.5 Generate artisan slug
CREATE OR REPLACE FUNCTION generate_artisan_slug(
  p_first_name TEXT,
  p_last_name  TEXT,
  p_trade      artisan_trade,
  p_lga        TEXT
)
RETURNS TEXT AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INTEGER := 0;
BEGIN
  base_slug := LOWER(
    REGEXP_REPLACE(
      CONCAT(p_first_name, '-', p_last_name, '-', p_trade::TEXT, '-', p_lga),
      '[^a-z0-9\-]', '-', 'g'
    )
  );
  base_slug  := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM artisans WHERE slug = final_slug) LOOP
    counter    := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 22.6 Recalculate artisan rating
CREATE OR REPLACE FUNCTION recalculate_artisan_rating(p_artisan_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE artisans
  SET
    rating_avg   = COALESCE((SELECT AVG(rating::NUMERIC) FROM reviews WHERE artisan_id = p_artisan_id), 0),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE artisan_id = p_artisan_id),
    updated_at   = NOW()
  WHERE id = p_artisan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 22.7 Calculate total job amount (breakdown)
CREATE OR REPLACE FUNCTION calculate_job_total(
  p_base_price     BIGINT,
  p_is_urgent      BOOLEAN,
  p_materials_cost BIGINT DEFAULT 0
)
RETURNS TABLE (
  agreed_price    BIGINT,
  urgency_premium BIGINT,
  platform_fee    BIGINT,
  materials_cost  BIGINT,
  total_amount    BIGINT
) AS $$
DECLARE
  v_urgency_premium BIGINT := 0;
  v_platform_fee    BIGINT;
BEGIN
  IF p_is_urgent THEN
    v_urgency_premium := ROUND(p_base_price * 0.30);
  END IF;
  v_platform_fee := ROUND(p_base_price * 0.12);
  RETURN QUERY SELECT
    p_base_price,
    v_urgency_premium,
    v_platform_fee,
    p_materials_cost,
    p_base_price + v_urgency_premium + v_platform_fee + p_materials_cost;
END;
$$ LANGUAGE plpgsql;

-- 22.8 Recalculate artisan Nex credit score (0-850)
CREATE OR REPLACE FUNCTION calculate_nex_score(p_artisan_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_jobs_score        INTEGER := 0;
  v_completion_score  INTEGER := 0;
  v_rating_score      INTEGER := 0;
  v_earnings_score    INTEGER := 0;
  v_consistency_score INTEGER := 0;
  v_total_score       INTEGER;
  v_artisan           RECORD;
BEGIN
  SELECT total_jobs, completion_rate, rating_avg,
         wallet_balance + wallet_pending AS total_earnings
  INTO v_artisan
  FROM artisans WHERE id = p_artisan_id;

  v_jobs_score       := LEAST(ROUND(v_artisan.total_jobs::NUMERIC / 200 * 100), 100);
  v_completion_score := ROUND(v_artisan.completion_rate);
  v_rating_score     := ROUND(v_artisan.rating_avg / 5 * 100);
  v_earnings_score   := LEAST(ROUND(v_artisan.total_earnings::NUMERIC / 50000000 * 100), 100);

  SELECT LEAST(ROUND(COUNT(*)::NUMERIC / 15 * 100), 100)
  INTO v_consistency_score
  FROM jobs
  WHERE artisan_id = p_artisan_id
    AND status = 'confirmed'
    AND created_at > NOW() - INTERVAL '30 days';

  -- Weighted: jobs 20% | completion 25% | rating 25% | earnings 15% | consistency 15%
  v_total_score := ROUND(
    ((v_jobs_score * 0.20) + (v_completion_score * 0.25) + (v_rating_score * 0.25) +
     (v_earnings_score * 0.15) + (v_consistency_score * 0.15)) * 8.50
  );

  INSERT INTO artisan_credit_profiles (id, nex_score,
    score_jobs_completed, score_completion_rate, score_rating,
    score_earnings, score_consistency, score_calculated_at)
  VALUES (p_artisan_id, v_total_score,
    v_jobs_score, v_completion_score, v_rating_score,
    v_earnings_score, v_consistency_score, NOW())
  ON CONFLICT (id) DO UPDATE SET
    nex_score             = EXCLUDED.nex_score,
    score_jobs_completed  = EXCLUDED.score_jobs_completed,
    score_completion_rate = EXCLUDED.score_completion_rate,
    score_rating          = EXCLUDED.score_rating,
    score_earnings        = EXCLUDED.score_earnings,
    score_consistency     = EXCLUDED.score_consistency,
    score_calculated_at   = NOW(),
    updated_at            = NOW();

  UPDATE artisans SET nex_score = v_total_score, updated_at = NOW()
  WHERE id = p_artisan_id;

  INSERT INTO artisan_credit_score_history (artisan_id, score, reason)
  VALUES (p_artisan_id, v_total_score, 'Scheduled recalculation');

  RETURN v_total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 22.9 Find nearby approved artisans for a job (returns artisan IDs sorted by distance)
CREATE OR REPLACE FUNCTION find_nearby_artisans(
  p_trade    artisan_trade,
  p_lat      DOUBLE PRECISION,
  p_lng      DOUBLE PRECISION,
  p_radius_km NUMERIC DEFAULT 15,
  p_limit    INTEGER DEFAULT 20
)
RETURNS TABLE (artisan_id UUID, distance_km NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    ROUND(
      ST_Distance(
        ST_MakePoint(a.lng, a.lat)::geography,
        ST_MakePoint(p_lng, p_lat)::geography
      ) / 1000, 2
    ) AS dist_km
  FROM artisans a
  WHERE a.trade = p_trade
    AND a.status = 'approved'
    AND a.is_online = TRUE
    AND a.lat IS NOT NULL
    AND ST_DWithin(
      ST_MakePoint(a.lng, a.lat)::geography,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_km * 1000
    )
  ORDER BY dist_km
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 22.10 Admin helper: is caller an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- SECTION 23: TRIGGERS
-- ============================================================

-- 23.1 Generic updated_at setter
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles', 'customers', 'artisans', 'jobs', 'payments',
    'escrow_records', 'reviews', 'review_replies', 'disputes',
    'suppliers', 'products', 'material_orders',
    'enterprise_accounts', 'artisan_credit_profiles',
    'whatsapp_sessions', 'withdrawal_requests',
    'customer_wallets', 'notification_preferences',
    'enterprise_properties', 'artisan_equipment_finance',
    'artisan_credit_disbursements', 'enterprise_job_requests'
  ])
  LOOP
    EXECUTE FORMAT(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t, t
    );
  END LOOP;
END $$;

-- 23.2 Auto job reference
CREATE OR REPLACE FUNCTION trg_set_job_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference IS NULL THEN NEW.reference := generate_job_reference(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_jobs_set_reference BEFORE INSERT ON jobs
  FOR EACH ROW EXECUTE FUNCTION trg_set_job_reference();

-- 23.3 Auto dispute reference + SLA
CREATE OR REPLACE FUNCTION trg_set_dispute_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference IS NULL THEN
    NEW.reference    := generate_dispute_reference();
    NEW.sla_deadline := NOW() + INTERVAL '48 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_disputes_set_reference BEFORE INSERT ON disputes
  FOR EACH ROW EXECUTE FUNCTION trg_set_dispute_reference();

-- 23.4 Auto order reference
CREATE OR REPLACE FUNCTION trg_set_order_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference IS NULL THEN NEW.reference := generate_order_reference(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_orders_set_reference BEFORE INSERT ON material_orders
  FOR EACH ROW EXECUTE FUNCTION trg_set_order_reference();

-- 23.5 Auto invoice number
CREATE OR REPLACE FUNCTION trg_set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN NEW.invoice_number := generate_invoice_number(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_invoices_set_number BEFORE INSERT ON enterprise_invoices
  FOR EACH ROW EXECUTE FUNCTION trg_set_invoice_number();

-- 23.6 Recalculate artisan rating after review change
CREATE OR REPLACE FUNCTION trg_update_artisan_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN PERFORM recalculate_artisan_rating(OLD.artisan_id);
  ELSE PERFORM recalculate_artisan_rating(NEW.artisan_id); END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trg_update_artisan_rating();

-- 23.7 Log job status changes
CREATE OR REPLACE FUNCTION trg_log_job_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO job_status_history (job_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_jobs_log_status AFTER UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION trg_log_job_status_change();

-- 23.8 Set auto_release_at when job completed
CREATE OR REPLACE FUNCTION trg_set_auto_release()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    NEW.work_completed_at := NOW();
    NEW.auto_release_at   := NOW() + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_jobs_auto_release BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION trg_set_auto_release();

-- 23.9 Update artisan stats + customer spend on job confirmed
CREATE OR REPLACE FUNCTION trg_update_artisan_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
    UPDATE artisans SET
      total_jobs      = total_jobs + 1,
      completion_rate = (
        SELECT ROUND(
          COUNT(*) FILTER (WHERE status = 'confirmed')::NUMERIC /
          NULLIF(COUNT(*) FILTER (WHERE status IN ('confirmed','cancelled')), 0) * 100, 2
        ) FROM jobs WHERE artisan_id = NEW.artisan_id
      ),
      updated_at = NOW()
    WHERE id = NEW.artisan_id;

    UPDATE customers SET
      total_jobs  = total_jobs + 1,
      total_spent = total_spent + NEW.total_amount,
      updated_at  = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_jobs_update_stats AFTER UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION trg_update_artisan_stats();

-- 23.10 Auto-create credit profile on artisan approval
CREATE OR REPLACE FUNCTION trg_create_credit_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    INSERT INTO artisan_credit_profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_artisans_create_credit_profile AFTER UPDATE ON artisans
  FOR EACH ROW EXECUTE FUNCTION trg_create_credit_profile();

-- 23.11 Auto-create customer wallet + notification prefs on insert
CREATE OR REPLACE FUNCTION trg_create_customer_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_wallets (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO notification_preferences (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_customers_create_wallet AFTER INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION trg_create_customer_wallet();

-- 23.12 SLA breach check on dispute update
CREATE OR REPLACE FUNCTION trg_check_dispute_sla()
RETURNS TRIGGER AS $$
BEGIN
  IF NOW() > NEW.sla_deadline AND NOT NEW.sla_breached THEN
    NEW.sla_breached := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_disputes_sla_check BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION trg_check_dispute_sla();

-- 23.13 Artisan credit repayment auto-deduction trigger
-- Fires after escrow is released to artisan wallet
CREATE OR REPLACE FUNCTION trg_auto_deduct_credit_repayment()
RETURNS TRIGGER AS $$
DECLARE
  v_profile       RECORD;
  v_disbursement  RECORD;
  v_repayment_amt BIGINT;
BEGIN
  -- Only fire on escrow release
  IF NEW.status = 'released' AND OLD.status = 'held' THEN
    SELECT cp.*, a.wallet_balance
    INTO v_profile
    FROM artisan_credit_profiles cp
    JOIN artisans a ON a.id = cp.id
    WHERE cp.id = NEW.artisan_id AND cp.credit_used_kobo > 0;

    IF FOUND THEN
      -- Find active disbursement
      SELECT * INTO v_disbursement
      FROM artisan_credit_disbursements
      WHERE artisan_id = NEW.artisan_id AND status = 'active'
      ORDER BY created_at LIMIT 1;

      IF FOUND THEN
        -- Deduct repayment_rate% of artisan_net
        v_repayment_amt := ROUND(NEW.artisan_net * v_profile.repayment_rate / 100);
        v_repayment_amt := LEAST(v_repayment_amt, v_disbursement.amount_outstanding);

        -- Reduce artisan wallet
        UPDATE artisans SET wallet_balance = wallet_balance - v_repayment_amt
        WHERE id = NEW.artisan_id;

        -- Log repayment
        INSERT INTO artisan_credit_repayments
          (disbursement_id, artisan_id, escrow_id, amount, balance_before, balance_after)
        VALUES (
          v_disbursement.id, NEW.artisan_id, NEW.id,
          v_repayment_amt,
          v_disbursement.amount_outstanding,
          v_disbursement.amount_outstanding - v_repayment_amt
        );

        -- Update disbursement
        UPDATE artisan_credit_disbursements SET
          amount_repaid = amount_repaid + v_repayment_amt,
          status = CASE
            WHEN amount_repaid + v_repayment_amt >= total_repayable THEN 'paid_off'::credit_status
            ELSE status
          END,
          actual_payoff = CASE
            WHEN amount_repaid + v_repayment_amt >= total_repayable THEN NOW()::DATE
            ELSE NULL
          END,
          updated_at = NOW()
        WHERE id = v_disbursement.id;

        -- Update credit profile used amount
        UPDATE artisan_credit_profiles SET
          credit_used_kobo = GREATEST(credit_used_kobo - v_repayment_amt, 0),
          updated_at = NOW()
        WHERE id = NEW.artisan_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_escrow_credit_repayment AFTER UPDATE ON escrow_records
  FOR EACH ROW EXECUTE FUNCTION trg_auto_deduct_credit_repayment();


-- ============================================================
-- SECTION 24: SCHEDULED JOBS (pg_cron)
-- Enable pg_cron in Supabase dashboard first
-- ============================================================

-- 24.1 Auto-release escrow 24h after job completion (every 5 min)
SELECT cron.schedule('auto-release-escrow', '*/5 * * * *', $$
  UPDATE jobs SET
    status = 'confirmed', auto_released = TRUE,
    customer_confirmed_at = NOW(), updated_at = NOW()
  WHERE status = 'completed'
    AND auto_release_at <= NOW()
    AND auto_released = FALSE;

  UPDATE escrow_records SET status = 'released', released_at = NOW(), updated_at = NOW()
  WHERE status = 'held' AND job_id IN (
    SELECT id FROM jobs
    WHERE auto_released = TRUE AND customer_confirmed_at >= NOW() - INTERVAL '10 minutes'
  );
$$);

-- 24.2 Recalculate Nex scores weekly (Sunday 1am UTC = 2am Lagos)
SELECT cron.schedule('recalculate-nex-scores', '0 1 * * 0', $$
  SELECT calculate_nex_score(id) FROM artisans WHERE status = 'approved';
$$);

-- 24.3 Refresh artisan search materialized view (every 15 min)
SELECT cron.schedule('refresh-artisan-search', '*/15 * * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY artisan_search_view;
$$);

-- 24.4 Daily platform metrics aggregation (12:05am UTC)
SELECT cron.schedule('aggregate-daily-metrics', '5 0 * * *', $$
  INSERT INTO platform_metrics_daily (
    metric_date, total_jobs, completed_jobs, cancelled_jobs,
    disputed_jobs, new_customers, new_artisans, approved_artisans,
    revenue_kobo, gmv_kobo, escrow_released_kobo, escrow_refunded_kobo,
    avg_job_value_kobo, avg_rating
  )
  SELECT
    CURRENT_DATE - 1,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE - 1),
    COUNT(*) FILTER (WHERE status = 'confirmed' AND DATE(customer_confirmed_at) = CURRENT_DATE - 1),
    COUNT(*) FILTER (WHERE status = 'cancelled' AND DATE(cancelled_at) = CURRENT_DATE - 1),
    COUNT(*) FILTER (WHERE status = 'disputed'  AND DATE(created_at) = CURRENT_DATE - 1),
    (SELECT COUNT(*) FROM customers WHERE DATE(created_at) = CURRENT_DATE - 1),
    (SELECT COUNT(*) FROM artisans  WHERE DATE(created_at) = CURRENT_DATE - 1),
    (SELECT COUNT(*) FROM artisans  WHERE DATE(approved_at) = CURRENT_DATE - 1),
    COALESCE(SUM(platform_fee) FILTER (WHERE status = 'confirmed' AND DATE(customer_confirmed_at) = CURRENT_DATE - 1), 0),
    COALESCE(SUM(total_amount) FILTER (WHERE status = 'confirmed' AND DATE(customer_confirmed_at) = CURRENT_DATE - 1), 0),
    (SELECT COALESCE(SUM(artisan_net), 0) FROM escrow_records WHERE DATE(released_at) = CURRENT_DATE - 1),
    (SELECT COALESCE(SUM(amount_held), 0) FROM escrow_records WHERE status = 'refunded' AND DATE(updated_at) = CURRENT_DATE - 1),
    COALESCE(AVG(total_amount) FILTER (WHERE status = 'confirmed' AND DATE(customer_confirmed_at) = CURRENT_DATE - 1), 0)::BIGINT,
    (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE DATE(created_at) = CURRENT_DATE - 1)
  FROM jobs
  ON CONFLICT (metric_date) DO UPDATE SET
    total_jobs    = EXCLUDED.total_jobs,
    completed_jobs = EXCLUDED.completed_jobs,
    revenue_kobo  = EXCLUDED.revenue_kobo,
    gmv_kobo      = EXCLUDED.gmv_kobo;
$$);

-- 24.5 Expire idle WhatsApp sessions (every hour)
SELECT cron.schedule('expire-whatsapp-sessions', '0 * * * *', $$
  UPDATE whatsapp_sessions SET session_status = 'idle', updated_at = NOW()
  WHERE session_status = 'active' AND last_message_at < NOW() - INTERVAL '6 hours';

  UPDATE whatsapp_sessions SET session_status = 'closed', updated_at = NOW()
  WHERE session_status = 'idle' AND last_message_at < NOW() - INTERVAL '24 hours';
$$);

-- 24.6 Mark overdue disputes (every 15 min)
SELECT cron.schedule('mark-overdue-disputes', '*/15 * * * *', $$
  UPDATE disputes SET sla_breached = TRUE, updated_at = NOW()
  WHERE sla_deadline <= NOW()
    AND sla_breached = FALSE
    AND status IN ('open', 'under_review');
$$);

-- 24.7 Reset product weekly counters (Monday midnight)
SELECT cron.schedule('reset-product-weekly-counters', '0 0 * * 1', $$
  UPDATE products SET views_this_week = 0, orders_this_week = 0;
$$);

-- 24.8 Purge old GPS logs (keep last 7 days only)
SELECT cron.schedule('purge-old-gps-logs', '0 2 * * *', $$
  DELETE FROM job_gps_log WHERE logged_at < NOW() - INTERVAL '7 days';
$$);


-- ============================================================
-- SECTION 25: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_guarantors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_skills                ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_badge_assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_portfolio             ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_availability_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_blocked_dates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_verification_queue    ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_artisans                ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_history            ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_gps_log                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_messages                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_jobs_feed           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_records                ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_wallet_transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_wallets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_wallet_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies                ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_timeline              ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_accounts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_staff              ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_properties         ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_job_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_invoices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_credit_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_credit_disbursements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_credit_repayments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_equipment_finance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_requests                  ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "Own profile readable"   ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "Own profile updatable"  ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin full profiles"    ON profiles FOR ALL    USING (is_admin());

-- ---- customers ----
CREATE POLICY "Own customer record"    ON customers FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "Customer update self"   ON customers FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin full customers"   ON customers FOR ALL    USING (is_admin());

-- ---- artisans — approved profiles are public ----
CREATE POLICY "Public approved artisans" ON artisans FOR SELECT
  USING (status = 'approved' OR id = auth.uid() OR is_admin());
CREATE POLICY "Artisan update self"      ON artisans FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin full artisans"      ON artisans FOR ALL    USING (is_admin());

-- ---- artisan sub-tables ----
CREATE POLICY "Artisan portfolio public" ON artisan_portfolio FOR SELECT
  USING (artisan_id = auth.uid() OR is_admin() OR
    EXISTS (SELECT 1 FROM artisans WHERE id = artisan_id AND status = 'approved'));
CREATE POLICY "Artisan manage portfolio" ON artisan_portfolio FOR ALL USING (artisan_id = auth.uid());

CREATE POLICY "Public artisan skills"    ON artisan_skills FOR SELECT USING (TRUE);
CREATE POLICY "Artisan manage skills"    ON artisan_skills FOR ALL   USING (artisan_id = auth.uid());

CREATE POLICY "Public schedule"          ON artisan_availability_schedule FOR SELECT USING (TRUE);
CREATE POLICY "Artisan manage schedule"  ON artisan_availability_schedule FOR ALL   USING (artisan_id = auth.uid());
CREATE POLICY "Artisan manage blocked"   ON artisan_blocked_dates         FOR ALL   USING (artisan_id = auth.uid());
CREATE POLICY "Artisan manage guarantors" ON artisan_guarantors FOR ALL   USING (artisan_id = auth.uid());
CREATE POLICY "Guarantors admin read"    ON artisan_guarantors FOR SELECT USING (is_admin());
CREATE POLICY "Admin manage verif queue" ON artisan_verification_queue FOR ALL USING (is_admin());
CREATE POLICY "Artisan view own queue"   ON artisan_verification_queue FOR SELECT USING (artisan_id = auth.uid());
CREATE POLICY "Customer manage saved"    ON saved_artisans FOR ALL USING (customer_id = auth.uid());

-- ---- jobs ----
CREATE POLICY "Customer own jobs"        ON jobs FOR SELECT USING (customer_id = auth.uid() OR is_admin());
CREATE POLICY "Artisan own jobs"         ON jobs FOR SELECT USING (artisan_id  = auth.uid());
CREATE POLICY "Customer create jobs"     ON jobs FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Artisan update own jobs"  ON jobs FOR UPDATE USING (artisan_id  = auth.uid());
CREATE POLICY "Customer update own jobs" ON jobs FOR UPDATE USING (customer_id = auth.uid());
CREATE POLICY "Admin full jobs"          ON jobs FOR ALL USING (is_admin());

-- ---- job messages ----
CREATE POLICY "Job parties read messages" ON job_messages FOR SELECT
  USING (sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND (customer_id = auth.uid() OR artisan_id = auth.uid())));
CREATE POLICY "Job parties send messages" ON job_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status NOT IN ('cancelled') AND
      (customer_id = auth.uid() OR artisan_id = auth.uid())));

-- ---- available_jobs_feed ----
CREATE POLICY "Artisan own feed"         ON available_jobs_feed FOR SELECT USING (artisan_id = auth.uid());
CREATE POLICY "Artisan update own feed"  ON available_jobs_feed FOR UPDATE USING (artisan_id = auth.uid());

-- ---- payments ----
CREATE POLICY "Customer own payments"    ON payments FOR SELECT USING (customer_id = auth.uid() OR is_admin());
CREATE POLICY "Admin full payments"      ON payments FOR ALL    USING (is_admin());

-- ---- escrow ----
CREATE POLICY "Job parties view escrow"  ON escrow_records FOR SELECT
  USING (customer_id = auth.uid() OR artisan_id = auth.uid() OR is_admin());

-- ---- wallet ----
CREATE POLICY "Artisan own wallet tx"    ON artisan_wallet_transactions FOR SELECT USING (artisan_id = auth.uid());
CREATE POLICY "Admin full wallet tx"     ON artisan_wallet_transactions FOR ALL    USING (is_admin());
CREATE POLICY "Artisan own withdrawals"  ON withdrawal_requests FOR ALL            USING (artisan_id = auth.uid());
CREATE POLICY "Admin full withdrawals"   ON withdrawal_requests FOR ALL            USING (is_admin());
CREATE POLICY "Customer own wallet"      ON customer_wallets FOR SELECT            USING (id = auth.uid());
CREATE POLICY "Customer own wallet tx"   ON customer_wallet_transactions FOR SELECT USING (customer_id = auth.uid());

-- ---- reviews ----
CREATE POLICY "Reviews publicly readable" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Customer create review"    ON reviews FOR INSERT
  WITH CHECK (customer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND customer_id = auth.uid() AND status = 'confirmed'));
CREATE POLICY "Admin manage reviews"      ON reviews FOR ALL   USING (is_admin());
CREATE POLICY "Replies publicly readable" ON review_replies FOR SELECT USING (TRUE);
CREATE POLICY "Artisan manage replies"    ON review_replies FOR ALL   USING (artisan_id = auth.uid());

-- ---- disputes ----
CREATE POLICY "Dispute parties view"     ON disputes FOR SELECT
  USING (filed_by = auth.uid() OR filed_against = auth.uid() OR is_admin());
CREATE POLICY "Authenticated file dispute" ON disputes FOR INSERT WITH CHECK (filed_by = auth.uid());
CREATE POLICY "Admin manage disputes"    ON disputes FOR ALL USING (is_admin());
CREATE POLICY "Dispute parties view timeline" ON dispute_timeline FOR SELECT
  USING (EXISTS (SELECT 1 FROM disputes WHERE id = dispute_id AND
    (filed_by = auth.uid() OR filed_against = auth.uid())) OR is_admin());

-- ---- notifications ----
CREATE POLICY "Own notifications"        ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Mark own notifications"   ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Own notif prefs"          ON notification_preferences FOR ALL USING (id = auth.uid());

-- ---- whatsapp (backend/service role only, admin read) ----
CREATE POLICY "Admin read wa sessions"   ON whatsapp_sessions FOR SELECT USING (is_admin());
CREATE POLICY "Admin read wa messages"   ON whatsapp_messages FOR SELECT USING (is_admin());

-- ---- products ----
CREATE POLICY "Active products public"   ON products FOR SELECT USING (status = 'active' OR is_admin());
CREATE POLICY "Supplier manage products" ON products FOR ALL   USING (supplier_id = auth.uid());

-- ---- material orders ----
CREATE POLICY "Artisan own mat orders"   ON material_orders FOR SELECT USING (artisan_id = auth.uid());
CREATE POLICY "Artisan create mat orders" ON material_orders FOR INSERT WITH CHECK (artisan_id = auth.uid());
CREATE POLICY "Supplier see own orders"  ON material_orders FOR SELECT USING (supplier_id = auth.uid());
CREATE POLICY "Supplier update orders"   ON material_orders FOR UPDATE USING (supplier_id = auth.uid());
CREATE POLICY "Admin full mat orders"    ON material_orders FOR ALL    USING (is_admin());
CREATE POLICY "Order items follow order" ON material_order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM material_orders mo WHERE mo.id = order_id AND
    (mo.artisan_id = auth.uid() OR mo.supplier_id = auth.uid())) OR is_admin());

-- ---- enterprise ----
CREATE POLICY "Admin manage enterprise"  ON enterprise_accounts FOR ALL USING (is_admin());
CREATE POLICY "Ent staff view own"       ON enterprise_accounts FOR SELECT
  USING (EXISTS (SELECT 1 FROM enterprise_staff WHERE enterprise_id = id AND user_id = auth.uid()));
CREATE POLICY "Ent staff view properties" ON enterprise_properties FOR SELECT
  USING (EXISTS (SELECT 1 FROM enterprise_staff WHERE enterprise_id = enterprise_id AND user_id = auth.uid()) OR is_admin());
CREATE POLICY "Ent admin manage properties" ON enterprise_properties FOR ALL
  USING (is_admin() OR EXISTS (SELECT 1 FROM enterprise_staff WHERE enterprise_id = enterprise_id AND user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Ent staff manage job requests" ON enterprise_job_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM enterprise_staff WHERE enterprise_id = enterprise_id AND user_id = auth.uid()) OR is_admin());
CREATE POLICY "Ent admin view invoices"  ON enterprise_invoices FOR SELECT
  USING (is_admin() OR EXISTS (SELECT 1 FROM enterprise_staff WHERE enterprise_id = enterprise_id AND user_id = auth.uid()));

-- ---- credit ----
CREATE POLICY "Artisan own credit profile"  ON artisan_credit_profiles FOR SELECT    USING (id = auth.uid());
CREATE POLICY "Admin all credit profiles"   ON artisan_credit_profiles FOR ALL       USING (is_admin());
CREATE POLICY "Artisan own disbursements"   ON artisan_credit_disbursements FOR SELECT USING (artisan_id = auth.uid());
CREATE POLICY "Admin all disbursements"     ON artisan_credit_disbursements FOR ALL   USING (is_admin());
CREATE POLICY "Artisan own repayments"      ON artisan_credit_repayments FOR SELECT  USING (artisan_id = auth.uid());
CREATE POLICY "Artisan own equip finance"   ON artisan_equipment_finance FOR ALL     USING (artisan_id = auth.uid());
CREATE POLICY "Admin all equip finance"     ON artisan_equipment_finance FOR ALL     USING (is_admin());

-- ---- admin-only ----
CREATE POLICY "Admins only"                ON admin_profiles    FOR ALL USING (is_admin());
CREATE POLICY "Admins only action log"     ON admin_action_log  FOR ALL USING (is_admin());
CREATE POLICY "Admins manage flagged"      ON flagged_users     FOR ALL USING (is_admin());

-- ---- OTP (service role only, no direct client access) ----
CREATE POLICY "OTP service role only"      ON otp_requests FOR ALL USING (FALSE);


-- ============================================================
-- SECTION 26: STORAGE BUCKETS
-- (Run via Supabase dashboard or supabase CLI)
-- ============================================================

/*
Create these buckets in Supabase → Storage:

┌─────────────────────────┬────────┬────────────────────────────────────────────────────────────────────────┐
│ Bucket                  │ Public │ Notes                                                                  │
├─────────────────────────┼────────┼────────────────────────────────────────────────────────────────────────┤
│ artisan-photos          │ false  │ Avatar & KYC photos. 5MB max. jpg/png/webp.                            │
│                         │        │ Path: artisan-photos/{artisan_id}/avatar.jpg                           │
│                         │        │ RLS: artisan owns folder; admin reads all                              │
├─────────────────────────┼────────┼────────────────────────────────────────────────────────────────────────┤
│ artisan-portfolio       │ true   │ Portfolio / work samples. 10MB max. jpg/png/webp.                      │
│                         │        │ Path: artisan-portfolio/{artisan_id}/{uuid}.jpg                        │
├─────────────────────────┼────────┼────────────────────────────────────────────────────────────────────────┤
│ job-photos              │ false  │ Before/after job photos. 10MB max. jpg/png/webp.                       │
│                         │        │ Path: job-photos/{job_id}/before/{uuid}.jpg                            │
│                         │        │       job-photos/{job_id}/after/{uuid}.jpg                             │
│                         │        │       job-photos/{job_id}/customer/{uuid}.jpg                          │
│                         │        │ RLS: customer + artisan on that job only                               │
├─────────────────────────┼────────┼────────────────────────────────────────────────────────────────────────┤
│ kyc-documents           │ false  │ NIN, BVN, CAC scans, guarantor forms. 20MB max. jpg/png/pdf.           │
│                         │        │ Path: kyc-documents/{artisan_id}/{doc_type}.pdf                        │
│                         │        │ RLS: artisan uploads, admin reads; never public                        │
├─────────────────────────┼────────┼────────────────────────────────────────────────────────────────────────┤
│ supplier-documents      │ false  │ CAC, trade certs. 20MB max. jpg/png/pdf.                               │
│                         │        │ Path: supplier-documents/{supplier_id}/cac.pdf                         │
├─────────────────────────┼────────┼────────────────────────────────────────────────────────────────────────┤
│ product-photos          │ true   │ Material catalogue images. 5MB max. jpg/png/webp.                      │
│                         │        │ Path: product-photos/{product_id}/{sort_order}.jpg                     │
├─────────────────────────┼────────┼────────────────────────────────────────────────────────────────────────┤
│ review-photos           │ true   │ Photos uploaded with reviews. 5MB max. jpg/png/webp.                   │
│                         │        │ Path: review-photos/{review_id}/{uuid}.jpg                             │
├─────────────────────────┼────────┼────────────────────────────────────────────────────────────────────────┤
│ enterprise-documents    │ false  │ CAC, invoices, PO docs. 20MB max. pdf/jpg/png.                         │
│                         │        │ Path: enterprise-documents/{enterprise_id}/{uuid}.pdf                  │
└─────────────────────────┴────────┴────────────────────────────────────────────────────────────────────────┘

Storage RLS SQL (add in Supabase dashboard → Storage → Policies):

-- artisan-photos: artisan owns their folder
CREATE POLICY "Artisan upload own photo"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'artisan-photos' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- job-photos: job parties only
CREATE POLICY "Job parties upload photos"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'job-photos' AND
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id::TEXT = (storage.foldername(name))[1]
        AND (j.customer_id = auth.uid() OR j.artisan_id = auth.uid())
    )
  );
*/


-- ============================================================
-- SECTION 27: REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime on tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE job_gps_log;       -- artisan live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;               -- status changes
ALTER PUBLICATION supabase_realtime ADD TABLE job_messages;       -- in-job chat
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;      -- notification bell
ALTER PUBLICATION supabase_realtime ADD TABLE available_jobs_feed; -- new job alerts
ALTER PUBLICATION supabase_realtime ADD TABLE disputes;           -- dispute queue SLA
ALTER PUBLICATION supabase_realtime ADD TABLE escrow_records;     -- escrow release events


-- ============================================================
-- SECTION 28: SEED DATA
-- ============================================================

-- Lagos LGAs reference
CREATE TABLE lagos_lgas (
  lga TEXT PRIMARY KEY,
  zone TEXT NOT NULL  -- 'island', 'mainland', 'suburbs'
);

INSERT INTO lagos_lgas (lga, zone) VALUES
  ('Agege', 'mainland'), ('Ajeromi-Ifelodun', 'mainland'), ('Alimosho', 'suburbs'),
  ('Amuwo-Odofin', 'mainland'), ('Apapa', 'island'), ('Badagry', 'suburbs'),
  ('Epe', 'suburbs'), ('Eti-Osa', 'island'), ('Ibeju-Lekki', 'island'),
  ('Ifako-Ijaiye', 'mainland'), ('Ikeja', 'mainland'), ('Ikorodu', 'suburbs'),
  ('Kosofe', 'mainland'), ('Lagos Island', 'island'), ('Lagos Mainland', 'mainland'),
  ('Mushin', 'mainland'), ('Ojo', 'mainland'), ('Oshodi-Isolo', 'mainland'),
  ('Shomolu', 'mainland'), ('Surulere', 'mainland'), ('Lekki', 'island'),
  ('Victoria Island', 'island'), ('Ajah', 'island'), ('Yaba', 'mainland');

-- Nigerian banks (for withdrawal bank selection)
CREATE TABLE nigerian_banks (
  bank_code   TEXT PRIMARY KEY,
  bank_name   TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE
);

INSERT INTO nigerian_banks (bank_code, bank_name) VALUES
  ('044', 'Access Bank'), ('063', 'Access Bank (Diamond)'), ('035A', 'ALAT by WEMA'),
  ('401', 'ASO Savings and Loans'), ('023', 'Citibank Nigeria'), ('050', 'EcoBank Nigeria'),
  ('562', 'Ekondo MFB'), ('040', 'Ecobank Nigeria'), ('084', 'Enterprise Bank'),
  ('070', 'Fidelity Bank'), ('011', 'First Bank of Nigeria'), ('214', 'First City Monument Bank'),
  ('058', 'GTBank'), ('030', 'Heritage Bank'), ('301', 'Jaiz Bank'),
  ('082', 'Keystone Bank'), ('526', 'Kudimoney MFB'), ('50211', 'Kuda Bank'),
  ('076', 'Polaris Bank'), ('101', 'Providus Bank'), ('221', 'Stanbic IBTC'),
  ('068', 'Standard Chartered'), ('232', 'Sterling Bank'), ('100', 'SunTrust Bank'),
  ('032', 'Union Bank'), ('033', 'United Bank for Africa'), ('215', 'Unity Bank'),
  ('035', 'Wema Bank'), ('057', 'Zenith Bank');

-- Price estimates seed (Lagos market rates, values in kobo)
INSERT INTO price_estimates (trade, job_type, complexity, price_budget, price_typical, price_premium) VALUES
  ('plumbing', 'Tap replacement',         'simple',   300000,   600000,  1200000),
  ('plumbing', 'Pipe repair (burst)',      'simple',   500000,  1000000,  2000000),
  ('plumbing', 'Drain unblocking',         'simple',   300000,   700000,  1500000),
  ('plumbing', 'Water heater installation','standard', 1500000, 2500000,  4000000),
  ('plumbing', 'Bathroom full installation','complex', 5000000,10000000, 20000000),
  ('plumbing', 'Toilet repair',            'simple',   400000,   800000,  1500000),
  ('plumbing', 'Overhead tank installation','standard',2000000, 4000000,  8000000),
  ('electrical','Light fixture installation','simple',  250000,   500000,  1000000),
  ('electrical','Socket/switch repair',    'simple',   200000,   400000,   800000),
  ('electrical','Full rewiring (3-bed)',   'complex',  8000000,15000000, 30000000),
  ('electrical','Generator connection',    'standard', 2000000, 4000000,  8000000),
  ('electrical','Inverter installation',   'standard', 3000000, 6000000, 12000000),
  ('electrical','DSTV/Cable installation', 'simple',   500000,  1000000,  2000000),
  ('carpentry', 'Door repair',             'simple',   500000,  1000000,  2000000),
  ('carpentry', 'Wardrobe installation',   'standard', 3000000, 6000000, 12000000),
  ('carpentry', 'Kitchen cabinet fitting', 'complex',  8000000,15000000, 30000000),
  ('carpentry', 'Window frame repair',     'simple',   600000,  1200000,  2500000),
  ('painting',  'Room painting (1 room)',  'simple',  1500000, 2500000,  5000000),
  ('painting',  'Full house (3-bed)',      'complex',  8000000,15000000, 25000000),
  ('painting',  'Exterior/fence painting', 'standard', 4000000, 8000000, 15000000),
  ('tiling',    'Bathroom tiling',         'standard', 4000000, 8000000, 15000000),
  ('tiling',    'Floor tiling (per m²)',   'simple',   200000,   400000,   800000),
  ('tiling',    'Kitchen backsplash',      'standard', 2000000, 4000000,  8000000),
  ('masonry',   'Wall crack repair',       'simple',   500000,  1000000,  2000000),
  ('masonry',   'Block fence construction','complex',  5000000,10000000, 20000000),
  ('ac_technician','AC installation',      'standard', 2500000, 5000000, 10000000),
  ('ac_technician','AC servicing/cleaning','simple',   500000,  1000000,  2000000),
  ('ac_technician','AC gas recharge',      'simple',   800000,  1500000,  3000000),
  ('appliance_repair','Washing machine repair','simple',1000000,2000000,  4000000),
  ('appliance_repair','Refrigerator repair','simple',  1500000, 3000000,  6000000),
  ('fumigation', 'Room fumigation (1 room)','simple',  5000000, 800000,  1500000),
  ('fumigation', 'Full house fumigation',  'standard', 1500000, 3000000,  6000000);

-- All amounts in kobo. ₦1 = 100 kobo.
COMMENT ON TABLE price_estimates IS
  'Lagos market rate seeds in kobo (₦1 = 100 kobo). Update quarterly from actual job data.';

COMMENT ON TABLE jobs IS
  'Core job table. total_amount = agreed_price + urgency_premium + platform_fee + materials_cost.';

COMMENT ON TABLE escrow_records IS
  'One escrow record per job. artisan_net = amount_held - platform_fee. Auto-released 24h after job.status = completed.';

COMMENT ON TABLE artisan_credit_profiles IS
  'Created automatically on artisan approval. nex_score (0-850) recalculated every Sunday.';
  