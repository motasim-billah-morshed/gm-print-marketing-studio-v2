-- Collection time is known; the person's employment start date may not be.
-- Never manufacture an employment date from today's date.
ALTER TABLE contact_company_role ALTER COLUMN valid_from DROP DEFAULT;
ALTER TABLE contact_company_role ALTER COLUMN valid_from DROP NOT NULL;
