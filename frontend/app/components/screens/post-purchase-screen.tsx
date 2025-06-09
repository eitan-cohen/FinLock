
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/constants';
import { 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Star,
  Home,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export function PostPurchaseScreen() {
  const { cardStatus, budgets, setBudgets, setCurrentScreen, setCardStatus } = useAppStore();
  const [actualAmount] = useState(cardStatus?.authorizedAmount || 0);
  const [feedback, setFeedback] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Simulate transaction completion and budget update
    if (cardStatus?.authorizedCategory && actualAmount > 0) {
      const updatedBudgets = budgets.map(budget => {
        if (budget.category === cardStatus.authorizedCategory) {
          return {
            ...budget,
            spent: budget.spent + actualAmount
          };
        }
        return budget;
      });
      setBudgets(updatedBudgets);
      
      // Reset card status to frozen
      setCardStatus({ status: 'frozen' });
    }
  }, []);

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
  };

  const categoryInfo = getCategoryInfo(cardStatus?.authorizedCategory || 'groceries');
  const categoryBudget = budgets.find(b => b.category === cardStatus?.authorizedCategory);
  
  const budgetProgress = categoryBudget 
    ? Math.min((categoryBudget.spent / categoryBudget.limit) * 100, 100)
    : 0;

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'safe';
  };

  const budgetStatus = categoryBudget 
    ? getBudgetStatus(categoryBudget.spent, categoryBudget.limit)
    : 'safe';

  const handleFeedback = (rating: number) => {
    setFeedback(rating);
    setShowFeedback(true);
    // In a real app, this would send feedback to the backend
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 p-4 max-w-md mx-auto">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Purchase Complete!
        </h1>
        <p className="text-muted-foreground">
          Your card has been automatically frozen again
        </p>
      </motion.div>

      {/* Transaction Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="fintech-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Transaction Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount */}
            <div className="text-center py-4 border-b">
              <p className="text-sm text-muted-foreground">Amount Charged</p>
              <p className="text-3xl font-bold text-gray-900">
                ${actualAmount.toFixed(2)}
              </p>
            </div>

            {/* Category and Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${categoryInfo.color} flex items-center justify-center text-white text-lg`}>
                  {categoryInfo.icon}
                </div>
                <div>
                  <p className="font-medium">{categoryInfo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Updated Budget */}
      {categoryBudget && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="fintech-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Updated Budget</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{categoryInfo.name} Budget</p>
                  <p className="text-sm text-muted-foreground">
                    ${categoryBudget.spent.toFixed(2)} of ${categoryBudget.limit.toFixed(2)}
                  </p>
                </div>
                {budgetStatus === 'danger' && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className={
                    budgetStatus === 'danger' ? 'text-red-600' :
                    budgetStatus === 'warning' ? 'text-orange-600' :
                    'text-green-600'
                  }>
                    {budgetProgress.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={budgetProgress} 
                  className={`h-3 ${
                    budgetStatus === 'danger' ? 'budget-progress danger' :
                    budgetStatus === 'warning' ? 'budget-progress warning' :
                    'budget-progress'
                  }`}
                />
              </div>

              {budgetStatus === 'danger' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">
                    ⚠️ You've exceeded 90% of your {categoryInfo.name.toLowerCase()} budget this month.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="fintech-card">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="font-medium">How was your experience?</h3>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFeedback(rating)}
                    className={`p-2 rounded-full transition-colors ${
                      feedback === rating
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'hover:bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Star 
                      className={`h-6 w-6 ${
                        feedback === rating ? 'fill-current' : ''
                      }`} 
                    />
                  </button>
                ))}
              </div>
              
              {showFeedback && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-green-600"
                >
                  Thank you for your feedback!
                </motion.p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        <Button
          variant="fintech"
          size="lg"
          className="w-full"
          onClick={() => setCurrentScreen('home')}
        >
          <Home className="mr-2 h-5 w-5" />
          Return to Dashboard
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setCurrentScreen('authorize')}
        >
          Make Another Purchase
        </Button>
      </motion.div>
    </div>
  );
}
