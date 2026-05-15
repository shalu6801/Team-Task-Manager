export const statusLabels = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Overdue: 'Overdue'
};

export const statusOptions = Object.keys(statusLabels);
export const priorityOptions = ['Low', 'Medium', 'High'];

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));

export const initials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const isPastDue = (task) =>
  task.status !== 'Completed' && new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

export const apiError = (error) => error.response?.data?.message || 'Something went wrong';
