
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { CATEGORIES, MOCK_TRANSACTIONS } from '@/lib/constants';
import { 
  ArrowLeft, 
  History, 
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HistoryScreen() {
  const { 
    transactions, 
    setTransactions, 
    setCurrentScreen, 
    isLoading, 
    setLoading 
  } = useAppStore();
  
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    
    try {
      const response = await apiClient.getTransactions();
      if (response.success && response.data) {
        // Handle API response that may wrap transactions in an object
        const txs = Array.isArray(response.data)
          ? response.data
          : (response.data as any).transactions;
        setTransactions(txs || []);
      } else {
        // Use mock data if API fails
        setTransactions(MOCK_TRANSACTIONS);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Use mock data on error
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.category === filter);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.createdAt);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentScreen('home')}
          className="md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            View your spending activity and patterns
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="fintech-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold text-blue-600">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fintech-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-green-600">
                  {thisMonthTransactions.length} transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fintech-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                <p className="text-xl font-bold text-purple-600">
                  ${transactions.length > 0 ? (totalSpent / transactions.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="fintech-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              {CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={filter === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(category.id)}
                  className="flex items-center space-x-1"
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        
        {filteredTransactions.length === 0 ? (
          <Card className="fintech-card">
            <CardContent className="p-8 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "You haven't made any transactions yet."
                  : `No transactions found for ${getCategoryInfo(filter).name}.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => {
              const categoryInfo = getCategoryInfo(transaction.category);
              const transactionDate = new Date(transaction.createdAt);
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className="fintech-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${categoryInfo.color} flex items-center justify-center text-white text-lg`}>
                            {categoryInfo.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {transaction.description || categoryInfo.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {transactionDate.toLocaleDateString()} at {transactionDate.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ${transaction.amount.toFixed(2)}
                          </p>
                          <p className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-700'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
