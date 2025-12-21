export { SalaryStructure } from './SalaryStructure.model';
export { PayrollComponent } from './PayrollComponent.model';
export { EmployeeSalaryStructure } from './EmployeeSalaryStructure.model';
export { TaxConfiguration } from './TaxConfiguration.model';
export { PayrollRun } from './PayrollRun.model';
export { Payslip } from './Payslip.model';
export { PayrollVariablePay } from './PayrollVariablePay.model';
export { PayrollArrears } from './PayrollArrears.model';
export { PayrollLoan } from './PayrollLoan.model';
export { PayrollLoanDeduction } from './PayrollLoanDeduction.model';
export { PayrollReimbursement } from './PayrollReimbursement.model';
export { EmployeeTaxDeclaration } from './EmployeeTaxDeclaration.model';
export { PayslipTemplate } from './PayslipTemplate.model';
export { PayslipGenerationSchedule } from './PayslipGenerationSchedule.model';
export { PayslipGenerationLog } from './PayslipGenerationLog.model';
export { RequestLogModel } from './RequestLog.model';

// Import models for associations (after exports to avoid circular deps)
import { SalaryStructure } from './SalaryStructure.model';
import { PayrollComponent } from './PayrollComponent.model';
import { EmployeeSalaryStructure } from './EmployeeSalaryStructure.model';
import { Payslip } from './Payslip.model';
import { PayrollRun } from './PayrollRun.model';
import { PayrollLoan } from './PayrollLoan.model';
import { PayrollLoanDeduction } from './PayrollLoanDeduction.model';

// Define associations after all models are loaded
EmployeeSalaryStructure.belongsTo(SalaryStructure, {
  foreignKey: 'salaryStructureId',
  as: 'salaryStructure',
});

SalaryStructure.hasMany(EmployeeSalaryStructure, {
  foreignKey: 'salaryStructureId',
  as: 'employeeStructures',
});

PayrollComponent.belongsTo(SalaryStructure, {
  foreignKey: 'salaryStructureId',
  as: 'salaryStructure',
});

SalaryStructure.hasMany(PayrollComponent, {
  foreignKey: 'salaryStructureId',
  as: 'components',
});

Payslip.belongsTo(PayrollRun, {
  foreignKey: 'payrollRunId',
  as: 'payrollRun',
});

PayrollRun.hasMany(Payslip, {
  foreignKey: 'payrollRunId',
  as: 'payslips',
});

Payslip.hasMany(PayrollLoanDeduction, {
  foreignKey: 'payslipId',
  as: 'loanDeductions',
});

PayrollLoanDeduction.belongsTo(Payslip, {
  foreignKey: 'payslipId',
  as: 'payslip',
});

PayrollLoanDeduction.belongsTo(PayrollLoan, {
  foreignKey: 'loanId',
  as: 'loan',
});

PayrollLoan.hasMany(PayrollLoanDeduction, {
  foreignKey: 'loanId',
  as: 'deductions',
});

import { PayslipTemplate } from './PayslipTemplate.model';
import { PayslipGenerationSchedule } from './PayslipGenerationSchedule.model';
import { PayslipGenerationLog } from './PayslipGenerationLog.model';

Payslip.belongsTo(PayslipTemplate, {
  foreignKey: 'templateId',
  as: 'template',
});

PayslipTemplate.hasMany(Payslip, {
  foreignKey: 'templateId',
  as: 'payslips',
});

PayslipGenerationLog.belongsTo(PayslipGenerationSchedule, {
  foreignKey: 'scheduleId',
  as: 'schedule',
});

PayslipGenerationSchedule.hasMany(PayslipGenerationLog, {
  foreignKey: 'scheduleId',
  as: 'generationLogs',
});

PayslipGenerationLog.belongsTo(PayslipTemplate, {
  foreignKey: 'templateId',
  as: 'template',
});

PayslipTemplate.hasMany(PayslipGenerationLog, {
  foreignKey: 'templateId',
  as: 'generationLogs',
});
