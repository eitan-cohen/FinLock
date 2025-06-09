
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { CATEGORIES, MOCK_BUDGETS } from '@/lib/constants';
import { 
  CreditCard, 
  Shield, 
  ShieldCheck, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HomeScreen() {
  const { 
    budgets, 
    setBudgets, 
    cardStatus, 
    setCardStatus, 
    setCurrentScreen, 
    isLoading, 
    setLoading 
  } = useAppStore();
  
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (budgets.length > 0) {
      const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
      const total = budgets.reduce((sum, budget) => sum + budget.limit, 0);
      setTotalSpent(spent);
      setTotalBudget(total);
    }
  }, [budgets]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load budgets
      const budgetResponse = await apiClient.getBudgets();
      if (budgetResponse.success && budgetResponse.data) {
        // Handle the API response structure {budgets: [], totalBudgets: 0}
        setBudgets(budgetResponse.data.budgets || []);
      } else {
        // Use mock data if API fails
        setBudgets(MOCK_BUDGETS);
      }

      // Load card status
      const cardResponse = await apiClient.getCardStatus();
      if (cardResponse.success && cardResponse.data) {
        setCardStatus(cardResponse.data);
      } else {
        // Default card status
        setCardStatus({ status: 'frozen' });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Use mock data on error
      setBudgets(MOCK_BUDGETS);
      setCardStatus({ status: 'frozen' });
    } finally {
      setLoading(false);
    }
  };

  const getBudgetProgress = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'safe';
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to FinLock
        </h1>
        <p className="text-muted-foreground">
          Your smart spending companion with freeze-by-default protection
        </p>
      </motion.div>

      {/* Card Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="fintech-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {cardStatus?.status === 'authorized' ? (
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                ) : (
                  <Shield className="h-8 w-8 text-blue-600" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    Card Status: {cardStatus?.status === 'authorized' ? 'Authorized' : 'Frozen'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cardStatus?.status === 'authorized' 
                      ? `Expires ${cardStatus.expiresAt ? new Date(cardStatus.expiresAt).toLocaleTimeString() : 'soon'}`
                      : 'Authorize a purchase to unlock temporarily'
                    }
                  </p>
                </div>
              </div>
              {cardStatus?.status === 'authorized' && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Authorized Amount</p>
                  <p className="font-semibold text-green-600">
                    ${cardStatus.authorizedAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="fintech-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Budget Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-blue-600 animate-count-up">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 animate-count-up">
                  ${totalBudget.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(totalSpent / totalBudget) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Budget Categories</h2>
        <div className="grid gap-4">
          {budgets.map((budget, index) => {
            const categoryInfo = getCategoryInfo(budget.category);
            const progress = getBudgetProgress(budget.spent, budget.limit);
            const status = getBudgetStatus(budget.spent, budget.limit);
            
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="fintech-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${categoryInfo.color} flex items-center justify-center text-white text-lg`}>
                          {categoryInfo.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{categoryInfo.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {status === 'danger' && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className={
                          status === 'danger' ? 'text-red-600' :
                          status === 'warning' ? 'text-orange-600' :
                          'text-green-600'
                        }>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className={`h-2 ${
                          status === 'danger' ? 'budget-progress danger' :
                          status === 'warning' ? 'budget-progress warning' :
                          'budget-progress'
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Main CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center pt-4"
      >
        <Button
          variant="fintech"
          size="xl"
          className="w-full max-w-md"
          onClick={() => setCurrentScreen('authorize')}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Authorize Purchase
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Temporarily unlock your card for a specific purchase
        </p>
      </motion.div>
    </div>
  );
}
