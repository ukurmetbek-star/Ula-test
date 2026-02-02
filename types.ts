export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Comment {
  id: string;
  text: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  avatarColor: string;
}

export interface Task {
  id: string;
  projectId?: string; // Optional for personal tasks
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  comments: Comment[];
  isPersonal?: boolean;
}

export type ViewMode = 'board' | 'list';

export interface ColumnDefinition {
  id: TaskStatus;
  title: string;
  color: string;
}

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarColor: string;
  password?: string; // Added password
  email?: string;
  position?: string;
}

export type AppView = 'home' | 'my_tasks' | 'inbox' | 'reports' | 'project' | 'personal';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'assignment' | 'comment' | 'alert' | 'message';
  toUserId: string;
  fromUserName?: string;
}

// --- New Report Types ---

export enum ReportStatus {
  PENDING = 'pending',       // Assigned but not submitted
  SUBMITTED = 'submitted',   // Submitted by employee
  RETURNED = 'returned',     // Sent back for revision
  APPROVED = 'approved',     // Finalized
}

export interface ReportRequest {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdBy: string;
  assignedUserIds: string[];
  requiredFormat: 'any' | 'excel' | 'text';
}

// Excel Cell Data Structure
export interface TableCell {
  value: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    backgroundColor?: string;
  };
}

export interface ReportSubmission {
  id: string;
  requestId: string;
  userId: string;
  submittedAt?: string;
  status: ReportStatus;
  content?: string;         // Text commentary
  tableData?: TableCell[][];   // Enhanced Excel data
  files?: string[];         // Simulated file names
  feedback?: string;        // Admin feedback
}

export interface UserGroup {
  id: string;
  name: string;
  userIds: string[];
}