CREATE INDEX role_company ON contact_company_role(workspace_id,company_id) WHERE active;
CREATE INDEX role_contact ON contact_company_role(workspace_id,contact_id) WHERE active;
CREATE INDEX association_company ON endpoint_association(workspace_id,company_id) WHERE active;
CREATE INDEX audit_workspace ON audit_event(workspace_id,id DESC);
CREATE INDEX consent_endpoint ON consent_event(workspace_id,endpoint_id,purpose,created_at DESC);
CREATE INDEX import_effect_batch ON import_effect(batch_id);
CREATE INDEX import_batch_workspace ON import_batch(workspace_id,created_at DESC);
