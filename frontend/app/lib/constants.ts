
export const CATEGORIES = [
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: 'bg-green-500' },
  { id: 'dining', name: 'Dining', icon: '🍽️', color: 'bg-orange-500' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'bg-purple-500' },
  { id: 'gas', name: 'Gas', icon: '⛽', color: 'bg-blue-500' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'bg-pink-500' },
] as const;

export const TIMER_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
] as const;

export const MOCK_BUDGETS = [
  { id: '1', category: 'groceries', limit: 500, spent: 320, period: 'monthly' },
  { id: '2', category: 'dining', limit: 300, spent: 180, period: 'monthly' },
  { id: '3', category: 'entertainment', limit: 200, spent: 45, period: 'monthly' },
  { id: '4', category: 'gas', limit: 150, spent: 90, period: 'monthly' },
  { id: '5', category: 'shopping', limit: 400, spent: 250, period: 'monthly' },
];

export const MOCK_TRANSACTIONS = [
  {
    id: '1',
    amount: 25.50,
    category: 'groceries',
    description: 'Whole Foods Market',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    amount: 45.00,
    category: 'dining',
    description: 'Pizza Palace',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    amount: 12.99,
    category: 'entertainment',
    description: 'Netflix Subscription',
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];
