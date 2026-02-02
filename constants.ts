import { TaskStatus, TaskPriority, ColumnDefinition } from './types';
import { Circle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const COLUMNS: ColumnDefinition[] = [
  { id: TaskStatus.TODO, title: 'Сделать', color: 'bg-gray-200' },
  { id: TaskStatus.IN_PROGRESS, title: 'В работе', color: 'bg-blue-200' },
  { id: TaskStatus.REVIEW, title: 'На проверке', color: 'bg-yellow-200' },
  { id: TaskStatus.DONE, title: 'Готово', color: 'bg-green-200' },
];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Низкий',
  [TaskPriority.MEDIUM]: 'Средний',
  [TaskPriority.HIGH]: 'Высокий',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-green-100 text-green-800',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TaskPriority.HIGH]: 'bg-red-100 text-red-800',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'Сделать',
  [TaskStatus.IN_PROGRESS]: 'В работе',
  [TaskStatus.REVIEW]: 'На проверке',
  [TaskStatus.DONE]: 'Готово',
};
