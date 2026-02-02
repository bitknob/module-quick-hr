-- ============================================
-- Auto-Create Departments Trigger
-- This trigger automatically creates default departments
-- whenever a new company is created
-- ============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_create_default_departments ON "Companies";
DROP FUNCTION IF EXISTS create_default_departments();

-- Create the trigger function
CREATE OR REPLACE FUNCTION create_default_departments()
RETURNS TRIGGER AS $$
DECLARE
  dept_names TEXT[] := ARRAY[
    'Engineering',
    'Human Resources',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'Customer Support',
    'Product Management',
    'Quality Assurance',
    'Research & Development',
    'Legal',
    'Administration',
    'IT Support',
    'Business Development',
    'Training & Development'
  ];
  dept_name TEXT;
BEGIN
  -- Loop through each department name and create it
  FOREACH dept_name IN ARRAY dept_names LOOP
    INSERT INTO "Departments" (
      id,
      "companyId",
      name,
      description,
      "hasSubDepartments",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      gen_random_uuid(),
      NEW.id,
      dept_name,
      dept_name || ' department for ' || NEW.name,
      false,
      NOW(),
      NOW()
    );
  END LOOP;
  
  -- Log the action
  RAISE NOTICE 'Created 15 default departments for company: %', NEW.name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_create_default_departments
  AFTER INSERT ON "Companies"
  FOR EACH ROW
  EXECUTE FUNCTION create_default_departments();

-- Add comment for documentation
COMMENT ON FUNCTION create_default_departments() IS 
'Automatically creates 15 default departments (Engineering, HR, Finance, Marketing, Sales, Operations, Customer Support, Product Management, QA, R&D, Legal, Administration, IT Support, Business Development, Training & Development) whenever a new company is created.';

COMMENT ON TRIGGER trigger_create_default_departments ON "Companies" IS 
'Triggers automatic creation of default departments after a new company is inserted.';

-- ============================================
-- Test the trigger (optional)
-- ============================================

\echo ''
\echo '============================================'
\echo 'Auto-Department Creation Trigger Installed!'
\echo '============================================'
\echo 'The following departments will be auto-created for new companies:'
\echo '  1. Engineering'
\echo '  2. Human Resources'
\echo '  3. Finance'
\echo '  4. Marketing'
\echo '  5. Sales'
\echo '  6. Operations'
\echo '  7. Customer Support'
\echo '  8. Product Management'
\echo '  9. Quality Assurance'
\echo ' 10. Research & Development'
\echo ' 11. Legal'
\echo ' 12. Administration'
\echo ' 13. IT Support'
\echo ' 14. Business Development'
\echo ' 15. Training & Development'
\echo ''
\echo 'Trigger is now active and will fire on every new company creation!'
\echo '============================================'
