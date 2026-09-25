-- =============================================================================
-- Migration 002: Government Reference Datasets & Provenance Schema (Phase 10)
-- Stores authoritative reference datasets from NSSTA / MoSPI and derived mappings.
-- =============================================================================

-- 1. Reference Competencies (Official SIH26101 / MoSPI Competency Taxonomy)
CREATE TABLE IF NOT EXISTS reference_competencies (
  id          text PRIMARY KEY, -- e.g. 'C01', 'C02'
  domain      text NOT NULL,     -- 'Statistical', 'Technical', 'Digital Governance', 'Behavioural/Managerial'
  competency  text NOT NULL UNIQUE,
  source_type text NOT NULL,
  source      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Reference NSSTA Training Catalogue
CREATE TABLE IF NOT EXISTS reference_training_catalogue (
  id                text PRIMARY KEY, -- e.g. 'NSSTA-01'
  topic             text NOT NULL,
  programme_context text NOT NULL,
  topic_detail      text NOT NULL,
  source_type       text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 3. Reference NSSTA Training Calendar (FY2025-26 Indexed)
CREATE TABLE IF NOT EXISTS reference_training_calendar (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week               text NOT NULL,
  programme          text NOT NULL,
  duration_days      integer NOT NULL DEFAULT 5,
  topic              text NOT NULL,
  batch_size         integer NOT NULL DEFAULT 30,
  venue_or_institute text NOT NULL,
  source_type        text NOT NULL,
  coverage_note      text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week, programme, topic)
);

-- 4. Reference MoSPI Dataset Catalogue (eSankhyiki Families)
CREATE TABLE IF NOT EXISTS reference_dataset_catalogue (
  product_code       text PRIMARY KEY, -- e.g. 'PLFS', 'CPI', 'IIP'
  dataset_family     text NOT NULL,
  competency_area    text NOT NULL,
  source_note        text NOT NULL,
  official_catalogue text NOT NULL,
  download_status    text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- 5. Reference Official Source Registry (Provenance Traceability)
CREATE TABLE IF NOT EXISTS reference_source_registry (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area      text NOT NULL,
  resource  text NOT NULL,
  purpose   text NOT NULL,
  authority text NOT NULL,
  url       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Derived Training to Competency Mappings (Curated Prototype Inferences)
CREATE TABLE IF NOT EXISTS derived_training_mappings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_or_course  text NOT NULL UNIQUE,
  mapped_competencies text NOT NULL,
  mapping_status      text NOT NULL DEFAULT 'derived/curated',
  warning             text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for Reference Tables
ALTER TABLE reference_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_training_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_training_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_dataset_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_source_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE derived_training_mappings ENABLE ROW LEVEL SECURITY;

-- Allow Public/Learner Read Access to Official Reference Frameworks
CREATE POLICY "Public read reference competencies" ON reference_competencies FOR SELECT USING (true);
CREATE POLICY "Public read reference training catalogue" ON reference_training_catalogue FOR SELECT USING (true);
CREATE POLICY "Public read reference training calendar" ON reference_training_calendar FOR SELECT USING (true);
CREATE POLICY "Public read reference dataset catalogue" ON reference_dataset_catalogue FOR SELECT USING (true);
CREATE POLICY "Public read reference source registry" ON reference_source_registry FOR SELECT USING (true);
CREATE POLICY "Public read derived training mappings" ON derived_training_mappings FOR SELECT USING (true);
