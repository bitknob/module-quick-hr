export { Employee } from './Employee.model';
export { Department } from './Department.model';
export { Company } from './Company.model';
export { ApprovalRequest } from './ApprovalRequest.model';
export { ApprovalStep } from './ApprovalStep.model';
export { ApprovalHistory } from './ApprovalHistory.model';
export { Attendance } from './Attendance.model';
export { LeaveRequest } from './LeaveRequest.model';

// Import models for associations (after exports to avoid circular deps)
import { Employee } from './Employee.model';
import { ApprovalRequest } from './ApprovalRequest.model';
import { ApprovalStep } from './ApprovalStep.model';
import { ApprovalHistory } from './ApprovalHistory.model';
import { Attendance } from './Attendance.model';
import { LeaveRequest } from './LeaveRequest.model';

// Define associations after all models are loaded
// ApprovalRequest associations
ApprovalRequest.belongsTo(Employee, {
  foreignKey: 'requestedBy',
  as: 'requestedByEmployee',
});

ApprovalRequest.belongsTo(Employee, {
  foreignKey: 'requestedFor',
  as: 'requestedForEmployee',
});

ApprovalRequest.hasMany(ApprovalStep, {
  foreignKey: 'approvalRequestId',
  as: 'steps',
});

ApprovalRequest.hasMany(ApprovalHistory, {
  foreignKey: 'approvalRequestId',
  as: 'history',
});

// ApprovalStep associations
ApprovalStep.belongsTo(ApprovalRequest, {
  foreignKey: 'approvalRequestId',
  as: 'approvalRequest',
});

ApprovalStep.belongsTo(Employee, {
  foreignKey: 'approverId',
  as: 'approver',
});
