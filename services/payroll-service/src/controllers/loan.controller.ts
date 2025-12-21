import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { LoanService } from '../services/loan.service';
import { z } from 'zod';

const createLoanSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  loanType: z.enum(['personal_loan', 'advance_salary', 'home_loan', 'vehicle_loan', 'education_loan', 'medical_loan', 'other']),
  loanName: z.string().optional(),
  principalAmount: z.number().min(0, 'Principal amount must be positive'),
  interestRate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  tenureMonths: z.number().int().min(1, 'Tenure must be at least 1 month'),
  startDate: z.string().datetime(),
  deductionStartMonth: z.number().int().min(1).max(12),
  deductionStartYear: z.number().int().min(2000).max(3000),
  loanTerms: z.any().optional(),
});

export const createLoan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create loan'));
    }

    const validatedData = createLoanSchema.parse(req.body);
    const loan = await LoanService.createLoan({
      ...validatedData,
      startDate: new Date(validatedData.startDate),
    });
    const loanData = loan.toJSON ? loan.toJSON() : loan;

    ResponseFormatter.success(res, loanData, 'Loan created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getLoan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const loan = await LoanService.getLoanById(id);
    const loanData = loan.toJSON ? loan.toJSON() : loan;

    ResponseFormatter.success(res, loanData, 'Loan retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getActiveLoansByEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const loans = await LoanService.getActiveLoansByEmployee(employeeId);
    const loansData = loans.map((l) => (l.toJSON ? l.toJSON() : l));

    ResponseFormatter.success(res, loansData, 'Active loans retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const calculateEMI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { principalAmount, interestRate, tenureMonths } = req.query;

    if (!principalAmount || !interestRate || !tenureMonths) {
      return next(new ValidationError('Principal amount, interest rate, and tenure months are required'));
    }

    const principal = parseFloat(principalAmount as string);
    const rate = parseFloat(interestRate as string);
    const tenure = parseInt(tenureMonths as string);

    const emi = LoanService.calculateEMI(principal, rate, tenure);
    const schedule = LoanService.generateRepaymentSchedule(principal, rate, tenure, new Date());

    ResponseFormatter.success(
      res,
      {
        emiAmount: emi,
        totalAmount: emi * tenure,
        totalInterest: emi * tenure - principal,
        repaymentSchedule: schedule,
      },
      'EMI calculated successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const closeLoan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to close loan'));
    }

    const loan = await LoanService.closeLoan(id);
    const loanData = loan.toJSON ? loan.toJSON() : loan;

    ResponseFormatter.success(res, loanData, 'Loan closed successfully');
  } catch (error) {
    next(error);
  }
};

