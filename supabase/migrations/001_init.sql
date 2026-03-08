CREATE TABLE proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  title TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  business_name TEXT,
  business_email TEXT,
  accent_color TEXT DEFAULT '#16a34a',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','declined','expired')),
  notes TEXT,
  valid_days INT DEFAULT 30,
  view_count INT NOT NULL DEFAULT 0,
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner proposals" ON proposals USING (auth.uid() = user_id);
CREATE POLICY "public read by token" ON proposals FOR SELECT USING (true);
CREATE POLICY "public update status" ON proposals FOR UPDATE USING (true) WITH CHECK (true);

CREATE TABLE line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'job',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner line_items" ON line_items USING (
  EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid())
);
CREATE POLICY "public read line_items" ON line_items FOR SELECT USING (true);

CREATE TABLE view_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner view events" ON view_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid())
);
CREATE POLICY "public insert view events" ON view_events FOR INSERT WITH CHECK (true);

CREATE INDEX idx_proposals_token ON proposals(token);
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_line_items_proposal_id ON line_items(proposal_id);
CREATE INDEX idx_view_events_proposal_id ON view_events(proposal_id);
