-- A submission and its notification job commit together. Historical inquiries
-- are deliberately not backfilled (deploying must not email old leads).
ALTER TABLE public.project_enquiries ADD COLUMN IF NOT EXISTS request_hash text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS public.enquiry_notifications (
  reference uuid PRIMARY KEY REFERENCES public.project_enquiries(reference) ON DELETE CASCADE,
  record jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'failed', 'sent', 'needs_review')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  first_attempt_at timestamptz,
  lease_token uuid,
  lease_expires_at timestamptz,
  payload jsonb,
  provider_id text,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS enquiry_notifications_retry_idx
  ON public.enquiry_notifications(next_attempt_at)
  WHERE status IN ('pending', 'failed', 'sending');
--> statement-breakpoint
ALTER TABLE public.enquiry_notifications ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE public.enquiry_notifications FROM PUBLIC;
