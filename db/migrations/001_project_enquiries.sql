-- Apply with the server database owner on a direct Neon connection.
-- No policies expose enquiry data through browser-facing database roles.
CREATE TABLE IF NOT EXISTS public.project_enquiries (
  reference uuid PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now(),
  name varchar(120) NOT NULL CHECK (length(name) > 0),
  email varchar(254) NOT NULL CHECK (length(email) > 0),
  idea text NOT NULL CHECK (length(idea) BETWEEN 1 AND 5000),
  project_type varchar(120) NOT NULL DEFAULT '',
  application varchar(120) NOT NULL DEFAULT '',
  location varchar(200) NOT NULL DEFAULT '',
  dimensions varchar(160) NOT NULL DEFAULT '',
  company varchar(160) NOT NULL DEFAULT '',
  phone varchar(50) NOT NULL DEFAULT '',
  desired_date date,
  inspiration_bucket text,
  inspiration_key text,
  inspiration_original_name varchar(160),
  inspiration_mime text CHECK (
    inspiration_mime IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
  ),
  inspiration_bytes integer CHECK (inspiration_bytes BETWEEN 1 AND 5242880),
  CONSTRAINT project_enquiries_complete_inspiration CHECK (
    num_nonnulls(
      inspiration_bucket, inspiration_key, inspiration_original_name,
      inspiration_mime, inspiration_bytes
    ) IN (0, 5)
  )
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS project_enquiries_received_at_idx
  ON public.project_enquiries (received_at DESC);
--> statement-breakpoint
ALTER TABLE public.project_enquiries ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE public.project_enquiries FROM PUBLIC;
