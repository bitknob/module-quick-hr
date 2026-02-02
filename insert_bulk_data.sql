-- ============================================
-- Bulk Data Insert Script for Quick HR System
-- PostgreSQL Database - INDIAN DATA VERSION
-- This script inserts 100+ records with Indian context
-- ============================================

-- ============================================
-- 1. INSERT COMPANIES (15 Indian companies)
-- ============================================

DO $$
DECLARE
  company_data RECORD;
  companies_to_insert CURSOR FOR
    SELECT * FROM (VALUES
      ('Tata Consultancy Services', 'TCS001', 'IT Services and Consulting', 'active'::text, 'active'::text),
      ('Infosys Technologies', 'INFY002', 'Software Development and IT Services', 'active'::text, 'active'::text),
      ('Wipro Limited', 'WIPR003', 'Technology and Consulting Services', 'active'::text, 'active'::text),
      ('HCL Technologies', 'HCL004', 'IT Services and Products', 'active'::text, 'active'::text),
      ('Tech Mahindra', 'TECH005', 'Digital Transformation Services', 'active'::text, 'trial'::text),
      ('Reliance Industries', 'RIL006', 'Conglomerate - Energy and Retail', 'active'::text, 'active'::text),
      ('HDFC Bank', 'HDFC007', 'Banking and Financial Services', 'active'::text, 'active'::text),
      ('ICICI Bank', 'ICICI008', 'Banking and Insurance', 'active'::text, 'active'::text),
      ('Bharti Airtel', 'AIRTEL009', 'Telecommunications', 'active'::text, 'trial'::text),
      ('Flipkart India', 'FLIP010', 'E-commerce Platform', 'active'::text, 'active'::text),
      ('Zomato Limited', 'ZOMATO011', 'Food Delivery and Restaurant Discovery', 'active'::text, 'active'::text),
      ('Paytm', 'PAYTM012', 'Digital Payments and Financial Services', 'active'::text, 'trial'::text),
      ('Swiggy', 'SWIGGY013', 'Food Delivery Platform', 'active'::text, 'active'::text),
      ('Ola Cabs', 'OLA014', 'Ride-hailing and Mobility', 'active'::text, 'active'::text),
      ('Byju''s', 'BYJUS015', 'EdTech and Online Learning', 'active'::text, 'trial'::text)
    ) AS t(name, code, description, status, subscription_status);
  company_exists BOOLEAN;
  counter INT := 0;
BEGIN
  FOR company_data IN companies_to_insert LOOP
    SELECT EXISTS(SELECT 1 FROM "Companies" WHERE code = company_data.code) INTO company_exists;
    
    IF NOT company_exists THEN
      counter := counter + 1;
      INSERT INTO "Companies" (id, name, code, description, status, "subscriptionStatus", "subscriptionEndsAt", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        company_data.name,
        company_data.code,
        company_data.description,
        company_data.status::character varying,
        company_data.subscription_status::character varying,
        CASE 
          WHEN company_data.subscription_status = 'trial' THEN NOW() + INTERVAL '14 days'
          ELSE NOW() + INTERVAL '365 days'
        END,
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Inserted % new Indian companies', counter;
END $$;

-- ============================================
-- 2. INSERT DEPARTMENTS (100+ departments)
-- ============================================

DO $$
DECLARE
  company_record RECORD;
  dept_names TEXT[] := ARRAY[
    'Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 
    'Operations', 'Customer Support', 'Product Management', 'Quality Assurance', 
    'Research & Development', 'Legal', 'Administration', 'IT Support', 
    'Business Development', 'Training & Development'
  ];
  dept_name TEXT;
  counter INT := 0;
  dept_exists BOOLEAN;
BEGIN
  FOR company_record IN SELECT id, name FROM "Companies" ORDER BY "createdAt" LIMIT 15 LOOP
    FOREACH dept_name IN ARRAY dept_names LOOP
      SELECT EXISTS(
        SELECT 1 FROM "Departments" 
        WHERE "companyId" = company_record.id AND name = dept_name
      ) INTO dept_exists;
      
      IF NOT dept_exists THEN
        counter := counter + 1;
        INSERT INTO "Departments" (id, "companyId", name, description, "hasSubDepartments", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          company_record.id,
          dept_name,
          dept_name || ' department for ' || company_record.name,
          false,
          NOW(),
          NOW()
        );
      END IF;
      
      IF counter >= 150 THEN
        EXIT;
      END IF;
    END LOOP;
    
    IF counter >= 150 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Inserted % new departments', counter;
END $$;

-- ============================================
-- 3. INSERT EMPLOYEES (150+ Indian employees)
-- ============================================

DO $$
DECLARE
  company_record RECORD;
  dept_record RECORD;
  first_names TEXT[] := ARRAY[
    'Rahul', 'Priya', 'Amit', 'Sneha', 'Rajesh', 'Anjali', 'Vikram', 'Pooja', 
    'Arjun', 'Divya', 'Karan', 'Neha', 'Sanjay', 'Kavita', 'Rohan', 'Meera',
    'Aditya', 'Ritu', 'Manish', 'Swati', 'Suresh', 'Deepa', 'Nikhil', 'Preeti',
    'Akash', 'Shreya', 'Vishal', 'Nisha', 'Gaurav', 'Anita'
  ];
  last_names TEXT[] := ARRAY[
    'Sharma', 'Verma', 'Singh', 'Kumar', 'Patel', 'Gupta', 'Reddy', 'Nair',
    'Iyer', 'Joshi', 'Desai', 'Mehta', 'Shah', 'Rao', 'Pillai', 'Menon',
    'Agarwal', 'Bansal', 'Chopra', 'Malhotra', 'Kapoor', 'Khanna', 'Bhatia', 'Sethi'
  ];
  job_titles TEXT[] := ARRAY[
    'Software Engineer', 'Senior Developer', 'Tech Lead', 'Project Manager', 
    'Business Analyst', 'HR Manager', 'Marketing Manager', 'Sales Executive', 
    'Operations Manager', 'QA Engineer', 'Product Owner', 'Scrum Master',
    'Data Analyst', 'DevOps Engineer', 'UI/UX Designer'
  ];
  counter INT := 0;
  emp_id TEXT;
  first_name TEXT;
  last_name TEXT;
  job_title TEXT;
  dept_name TEXT;
  user_email TEXT;
  user_comp_email TEXT;
  emp_exists BOOLEAN;
BEGIN
  FOR company_record IN SELECT id, code FROM "Companies" ORDER BY "createdAt" LIMIT 15 LOOP
    FOR i IN 1..10 LOOP
      counter := counter + 1;
      
      SELECT id, name INTO dept_record FROM "Departments" WHERE "companyId" = company_record.id ORDER BY RANDOM() LIMIT 1;
      
      first_name := first_names[1 + floor(random() * array_length(first_names, 1))];
      last_name := last_names[1 + floor(random() * array_length(last_names, 1))];
      job_title := job_titles[1 + floor(random() * array_length(job_titles, 1))];
      emp_id := company_record.code || '-' || LPAD(counter::TEXT, 4, '0');
      dept_name := COALESCE(dept_record.name, 'General');
      user_email := lower(first_name || '.' || last_name || '.' || counter || '@example.com');
      user_comp_email := lower(first_name || '.' || last_name || counter || '@' || replace(lower(company_record.code), '_', '') || '.in');
      
      SELECT EXISTS(
        SELECT 1 FROM "Employees" 
        WHERE "companyId" = company_record.id AND "employeeId" = emp_id
      ) INTO emp_exists;
      
      IF NOT emp_exists THEN
        INSERT INTO "Employees" (
          id, "userEmail", "companyId", "employeeId", "firstName", "lastName", 
          "userCompEmail", "phoneNumber", "jobTitle", department, 
          "hireDate", salary, status, "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          user_email,
          company_record.id,
          emp_id,
          first_name,
          last_name,
          user_comp_email,
          '+91' || LPAD(floor(random() * 10000000000)::TEXT, 10, '0'),
          job_title,
          dept_name,
          NOW() - (floor(random() * 1095) || ' days')::INTERVAL, -- Up to 3 years
          300000 + floor(random() * 2000000), -- ₹3L to ₹23L per annum
          'active',
          NOW(),
          NOW()
        );
      END IF;
      
      IF counter >= 150 THEN
        EXIT;
      END IF;
    END LOOP;
    
    IF counter >= 150 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Processed % Indian employees', counter;
END $$;

-- ============================================
-- 4. INSERT ATTENDANCE RECORDS (1000+ records)
-- ============================================

DO $$
DECLARE
  emp_record RECORD;
  attendance_date DATE;
  counter INT := 0;
  statuses TEXT[] := ARRAY['present', 'present', 'present', 'present', 'present', 'late', 'half_day'];
  status_val TEXT;
  att_exists BOOLEAN;
BEGIN
  FOR emp_record IN SELECT id, "companyId", "hireDate" FROM "Employees" WHERE status = 'active' LIMIT 100 LOOP
    FOR i IN 1..15 LOOP -- Last 15 working days
      attendance_date := CURRENT_DATE - i;
      
      -- Skip weekends (Saturday=6, Sunday=0)
      IF EXTRACT(DOW FROM attendance_date) NOT IN (0, 6) THEN
        SELECT EXISTS(
          SELECT 1 FROM "Attendance" 
          WHERE "employeeId" = emp_record.id AND date = attendance_date
        ) INTO att_exists;
        
        IF NOT att_exists THEN
          counter := counter + 1;
          status_val := statuses[1 + floor(random() * array_length(statuses, 1))];
          
          INSERT INTO "Attendance" (
            id, "employeeId", "companyId", date, 
            "checkIn", "checkOut", status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(),
            emp_record.id,
            emp_record."companyId",
            attendance_date,
            attendance_date + TIME '09:30:00' + (floor(random() * 90) || ' minutes')::INTERVAL, -- IST office hours
            attendance_date + TIME '18:30:00' + (floor(random() * 90) || ' minutes')::INTERVAL,
            status_val,
            NOW(),
            NOW()
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Inserted % attendance records', counter;
END $$;

-- ============================================
-- 5. INSERT LEAVE REQUESTS (150+ records)
-- ============================================

DO $$
DECLARE
  emp_record RECORD;
  leave_types TEXT[] := ARRAY['annual', 'sick', 'casual', 'annual', 'casual']; -- More casual/annual leaves
  leave_statuses TEXT[] := ARRAY['approved', 'approved', 'approved', 'pending', 'rejected'];
  counter INT := 0;
  start_date DATE;
  end_date DATE;
BEGIN
  FOR emp_record IN SELECT id, "companyId" FROM "Employees" WHERE status = 'active' LIMIT 150 LOOP
    counter := counter + 1;
    start_date := CURRENT_DATE + (floor(random() * 90) - 30)::INT;
    end_date := start_date + (1 + floor(random() * 5))::INT;
    
    INSERT INTO "LeaveRequests" (
      id, "employeeId", "companyId", "leaveType", 
      "startDate", "endDate", reason, status, 
      "createdAt", "updatedAt"
    )
    VALUES (
      gen_random_uuid(),
      emp_record.id,
      emp_record."companyId",
      leave_types[1 + floor(random() * array_length(leave_types, 1))],
      start_date,
      end_date,
      CASE floor(random() * 5)
        WHEN 0 THEN 'Personal work'
        WHEN 1 THEN 'Family function'
        WHEN 2 THEN 'Medical appointment'
        WHEN 3 THEN 'Festival celebration'
        ELSE 'Vacation'
      END,
      leave_statuses[1 + floor(random() * array_length(leave_statuses, 1))],
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Inserted % leave requests', counter;
END $$;

-- ============================================
-- 6. INSERT PAYROLL RECORDS (150+ records)
-- ============================================

DO $$
DECLARE
  emp_record RECORD;
  counter INT := 0;
  base_salary NUMERIC;
  hra NUMERIC;
  special_allowance NUMERIC;
  pf_deduction NUMERIC;
  tds_deduction NUMERIC;
  net_salary NUMERIC;
  payroll_exists BOOLEAN;
BEGIN
  FOR emp_record IN SELECT id, "companyId", salary FROM "Employees" WHERE status = 'active' AND salary IS NOT NULL LIMIT 150 LOOP
    SELECT EXISTS(
      SELECT 1 FROM "Payroll" 
      WHERE "employeeId" = emp_record.id 
      AND month = EXTRACT(MONTH FROM CURRENT_DATE)::INT
      AND year = EXTRACT(YEAR FROM CURRENT_DATE)::INT
    ) INTO payroll_exists;
    
    IF NOT payroll_exists THEN
      counter := counter + 1;
      base_salary := emp_record.salary / 12; -- Monthly from annual
      hra := base_salary * 0.40; -- 40% HRA
      special_allowance := base_salary * 0.20; -- 20% Special allowance
      pf_deduction := base_salary * 0.12; -- 12% PF
      tds_deduction := CASE 
        WHEN emp_record.salary > 1000000 THEN base_salary * 0.10
        WHEN emp_record.salary > 500000 THEN base_salary * 0.05
        ELSE 0
      END;
      net_salary := base_salary + hra + special_allowance - pf_deduction - tds_deduction;
      
      INSERT INTO "Payroll" (
        id, "employeeId", "companyId", month, year,
        "baseSalary", allowances, deductions, bonuses, "netSalary",
        status, "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        emp_record.id,
        emp_record."companyId",
        EXTRACT(MONTH FROM CURRENT_DATE)::INT,
        EXTRACT(YEAR FROM CURRENT_DATE)::INT,
        base_salary,
        hra + special_allowance,
        pf_deduction + tds_deduction,
        floor(random() * 10000), -- Performance bonus
        net_salary,
        'processed',
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Inserted % payroll records', counter;
END $$;

-- ============================================
-- 7. INSERT EMPLOYEE DETAILS (150+ records)
-- ============================================

DO $$
DECLARE
  emp_record RECORD;
  counter INT := 0;
  detail_exists BOOLEAN;
  blood_groups TEXT[] := ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  marital_statuses TEXT[] := ARRAY['single', 'married', 'divorced'];
  indian_names TEXT[] := ARRAY['Ramesh', 'Sunita', 'Prakash', 'Lakshmi', 'Vijay', 'Radha'];
BEGIN
  FOR emp_record IN SELECT id, "companyId" FROM "Employees" WHERE status = 'active' LIMIT 150 LOOP
    SELECT EXISTS(
      SELECT 1 FROM "EmployeeDetails" WHERE "employeeId" = emp_record.id
    ) INTO detail_exists;
    
    IF NOT detail_exists THEN
      counter := counter + 1;
      
      INSERT INTO "EmployeeDetails" (
        id, "employeeId", "companyId", "bloodGroup", "maritalStatus",
        "emergencyContactName", "emergencyContactPhone", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        emp_record.id,
        emp_record."companyId",
        blood_groups[1 + floor(random() * array_length(blood_groups, 1))],
        marital_statuses[1 + floor(random() * array_length(marital_statuses, 1))],
        indian_names[1 + floor(random() * array_length(indian_names, 1))] || ' (Emergency)',
        '+91' || LPAD(floor(random() * 10000000000)::TEXT, 10, '0'),
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Inserted % employee details', counter;
END $$;

-- ============================================
-- 8. INSERT PERFORMANCE REVIEWS (100+ records)
-- ============================================

DO $$
DECLARE
  emp_record RECORD;
  counter INT := 0;
  review_exists BOOLEAN;
  ratings INTEGER[] := ARRAY[3, 4, 4, 5, 3, 4, 5];
  reviewer_id UUID;
BEGIN
  FOR emp_record IN SELECT id, "companyId" FROM "Employees" WHERE status = 'active' LIMIT 100 LOOP
    SELECT EXISTS(
      SELECT 1 FROM "PerformanceReviews" 
      WHERE "employeeId" = emp_record.id 
      AND "reviewPeriod" = 'Q4-2025'
    ) INTO review_exists;
    
    -- Get a reviewer from the same company
    SELECT id INTO reviewer_id FROM "Employees" 
    WHERE "companyId" = emp_record."companyId" AND status = 'active' AND id != emp_record.id 
    ORDER BY RANDOM() LIMIT 1;
    
    IF NOT review_exists AND reviewer_id IS NOT NULL THEN
      counter := counter + 1;
      
      INSERT INTO "PerformanceReviews" (
        id, "employeeId", "companyId", "reviewerId", "reviewPeriod",
        goals, achievements, feedback, rating, "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        emp_record.id,
        emp_record."companyId",
        reviewer_id,
        'Q4-2025',
        '["Complete project deliverables", "Improve code quality", "Mentor junior developers"]'::jsonb,
        '["Successfully delivered 3 projects", "Reduced bugs by 30%", "Mentored 2 team members"]'::jsonb,
        'Excellent performance throughout the quarter. Shows great leadership potential and technical skills.',
        ratings[1 + floor(random() * array_length(ratings, 1))],
        NOW(),
        NOW()
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Inserted % performance reviews', counter;
END $$;

-- ============================================
-- SUMMARY
-- ============================================

\echo ''
\echo '============================================'
\echo 'FINAL RECORD COUNTS - INDIAN DATA'
\echo '============================================'

SELECT 
  'Companies' as table_name, COUNT(*) as record_count FROM "Companies"
UNION ALL
SELECT 'Departments', COUNT(*) FROM "Departments"
UNION ALL
SELECT 'Employees', COUNT(*) FROM "Employees"
UNION ALL
SELECT 'Attendance', COUNT(*) FROM "Attendance"
UNION ALL
SELECT 'LeaveRequests', COUNT(*) FROM "LeaveRequests"
UNION ALL
SELECT 'Payroll', COUNT(*) FROM "Payroll"
UNION ALL
SELECT 'EmployeeDetails', COUNT(*) FROM "EmployeeDetails"
UNION ALL
SELECT 'PerformanceReviews', COUNT(*) FROM "PerformanceReviews"
ORDER BY table_name;

\echo ''
\echo '============================================'
\echo 'BULK DATA INSERTION COMPLETED SUCCESSFULLY!'
\echo 'Indian companies, names, phone numbers, and salaries in INR'
\echo '============================================'

-- ============================================
-- END OF SCRIPT
-- ============================================
