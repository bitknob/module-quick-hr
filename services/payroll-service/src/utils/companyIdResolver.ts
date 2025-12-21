import { ValidationError, UserRole, AccessControl } from '@hrm/common';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

export async function resolveCompanyId(
  companyId: string | undefined,
  userId: string | undefined,
  userRole: UserRole
): Promise<string | null> {
  if (!companyId || companyId === 'placeholder') {
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }
    
    // If user can access all companies and placeholder is sent, return null to indicate no specific company
    if (AccessControl.canAccessAllCompanies(userRole) && companyId === 'placeholder') {
      return null;
    }
    
    const employee = await sequelize.query(
      `SELECT "companyId" FROM "Employees" WHERE "userId" = :userId AND status = 'active' LIMIT 1`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    ) as Array<{ companyId: string }>;
    
    if (employee.length === 0) {
      if (AccessControl.canAccessAllCompanies(userRole)) {
        throw new ValidationError('Company ID is required for this operation');
      }
      throw new ValidationError('No company found for user');
    }
    
    return employee[0].companyId;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(companyId)) {
    throw new ValidationError('Invalid company ID format');
  }
  
  return companyId;
}

export async function checkCompanyAccess(
  resolvedCompanyId: string | null,
  userId: string | undefined,
  userRole: UserRole
): Promise<void> {
  // If resolvedCompanyId is null, it means placeholder was sent for a user who can access all companies
  // Allow access in this case
  if (resolvedCompanyId === null || AccessControl.canAccessAllCompanies(userRole)) {
    return;
  }
  
  if (!userId) {
    throw new ValidationError('User not authenticated');
  }
  
  const employee = await sequelize.query(
    `SELECT "companyId" FROM "Employees" WHERE "userId" = :userId AND status = 'active' LIMIT 1`,
    {
      replacements: { userId },
      type: QueryTypes.SELECT,
    }
  ) as Array<{ companyId: string }>;
  
  if (employee.length > 0 && employee[0].companyId !== resolvedCompanyId) {
    throw new ValidationError('Access denied: Cannot access different company');
  }
}

