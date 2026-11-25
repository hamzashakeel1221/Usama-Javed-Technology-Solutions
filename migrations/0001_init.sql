-- UJ website database (Cloudflare D1 / SQLite)

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  location TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'cabling',   -- cabling | villa | cctv
  status TEXT NOT NULL DEFAULT 'Completed',   -- Completed | Ongoing
  year INTEGER,
  partner TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_projects_order ON projects (is_published, is_featured, sort_order, created_at);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',     -- Pending | Approved | Rejected
  created_at TEXT NOT NULL
);
CREATE INDEX idx_reviews_status ON reviews (status, created_at);

CREATE TABLE inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  property_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'New',         -- New | Contacted | Quoted | Won | Lost
  notes TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_inquiries_created ON inquiries (created_at);

CREATE TABLE site_content (
  key TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Project photos uploaded from the admin portal (served at /uploads/<name>)
CREATE TABLE uploads (
  name TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  data BLOB NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
