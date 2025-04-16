
-- Create schema for CRM application
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'Lead' CHECK (status IN ('Lead', 'Prospect', 'Customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_email_per_user UNIQUE (user_id, email)
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Call', 'Meeting', 'Email', 'Note')),
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  
  CONSTRAINT unique_tag_name_per_user UNIQUE (user_id, name)
);

-- Contact Tags Junction Table
CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

-- Row Level Security Policies
-- Contacts: users can only access their own contacts
CREATE POLICY "Users can CRUD their own contacts" ON contacts
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Activities: users can only access activities for their own contacts
CREATE POLICY "Users can CRUD activities for their contacts" ON activities
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Tags: users can only access their own tags
CREATE POLICY "Users can CRUD their own tags" ON tags
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Contact Tags: users can only access tags for their own contacts
CREATE POLICY "Users can CRUD tags for their contacts" ON contact_tags
  USING (EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = contact_tags.contact_id
    AND contacts.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = contact_tags.contact_id
    AND contacts.user_id = auth.uid()
  ));

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

-- Create default tags for new users
CREATE OR REPLACE FUNCTION create_default_tags()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tags (user_id, name, color)
  VALUES 
    (NEW.id, 'Lead', '#3B82F6'),
    (NEW.id, 'Prospect', '#10B981'),
    (NEW.id, 'Customer', '#8B5CF6'),
    (NEW.id, 'Important', '#EF4444');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_default_tags();