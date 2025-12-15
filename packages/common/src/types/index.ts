export enum UserRole {
  // Provider Level (Highest Access)
  SUPER_ADMIN = 'super_admin',
  PROVIDER_ADMIN = 'provider_admin',
  PROVIDER_HR_STAFF = 'provider_hr_staff',
  
  // Client Level
  HRBP = 'hrbp',
  COMPANY_ADMIN = 'company_admin',
  DEPARTMENT_HEAD = 'department_head',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  CASUAL = 'casual',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  UNPAID = 'unpaid',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
}

export enum ApprovalRequestType {
  LEAVE = 'leave',
  EMPLOYEE_CREATE = 'employee_create',
  EMPLOYEE_UPDATE = 'employee_update',
  EMPLOYEE_TRANSFER = 'employee_transfer',
  EMPLOYEE_PROMOTION = 'employee_promotion',
  SALARY_CHANGE = 'salary_change',
  DEPARTMENT_CHANGE = 'department_change',
  OTHER = 'other',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum ApprovalPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ApproverType {
  SPECIFIC_USER = 'specific_user',
  ROLE_BASED = 'role_based',
  MANAGER = 'manager',
  DEPARTMENT_HEAD = 'department_head',
  HRBP = 'hrbp',
  COMPANY_ADMIN = 'company_admin',
}

export enum ApprovalAction {
  CREATED = 'created',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  DELEGATED = 'delegated',
  COMMENTED = 'commented',
}

export enum ApprovalStepStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
}

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  firebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  description?: string;
  hrbpId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  userId: string;
  companyId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  jobTitle: string;
  department: string;
  managerId?: string;
  hireDate: Date;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  companyId: string;
  reviewerId: string;
  reviewPeriod: string;
  goals?: string[];
  achievements?: string[];
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payroll {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  bonuses?: number;
  netSalary: number;
  status: 'draft' | 'processed' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface HierarchyNode {
  employeeId: string;
  managerId?: string;
  level: number;
  path: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export enum DeviceType {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
  OTHER = 'other',
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceType: DeviceType;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  fcmToken?: string;
  apnsToken?: string;
  isActive: boolean;
  lastActiveAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRequest {
  id: string;
  companyId: string;
  requestType: ApprovalRequestType;
  entityType: string;
  entityId?: string;
  requestedBy: string;
  requestedFor?: string;
  requestData: Record<string, any>;
  currentStep: number;
  totalSteps: number;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  expiresAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  approvalRequestId: string;
  stepNumber: number;
  approverId?: string;
  approverRole?: string;
  approverType: ApproverType;
  status: ApprovalStepStatus;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  comments?: string;
  isRequired: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalHistory {
  id: string;
  approvalRequestId: string;
  approvalStepId?: string;
  action: ApprovalAction;
  performedBy: string;
  performedByRole?: string;
  comments?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

