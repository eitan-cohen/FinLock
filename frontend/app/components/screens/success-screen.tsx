
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/constants';
import { 
  CheckCircle, 
  Wallet, 
  Clock, 
  Shield,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export function SuccessScreen() {
  const { cardStatus, setCurrentScreen } = useAppStore();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (cardStatus?.expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(cardStatus.expiresAt!).getTime();
        const difference = expiry - now;

        if (difference > 0) {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining('Expired');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [cardStatus?.expiresAt]);

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0];
  };

  const categoryInfo = getCategoryInfo(cardStatus?.authorizedCategory || 'groceries');

  const handleOpenWallet = () => {
    // In a real app, this would open the device's wallet app
    // For demo purposes, we'll simulate a transaction completion
    setTimeout(() => {
      setCurrentScreen('post-purchase');
    }, 2000);
  };

  return (
    <div className="space-y-6 p-4 max-w-md mx-auto">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Card Authorized!
        </h1>
        <p className="text-muted-foreground">
          Your card is temporarily unlocked for this purchase
        </p>
      </motion.div>

      {/* Authorization Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="fintech-card">
          <CardContent className="p-6 space-y-4">
            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Authorized Amount</p>
              <p className="text-3xl font-bold text-green-600">
                ${cardStatus?.authorizedAmount?.toFixed(2) || '0.00'}
              </p>
            </div>

            {/* Category */}
            <div className="flex items-center justify-center space-x-3 py-4 border-t border-b">
              <div className={`w-10 h-10 rounded-full ${categoryInfo.color} flex items-center justify-center text-white text-lg`}>
                {categoryInfo.icon}
              </div>
              <div>
                <p className="font-medium">{categoryInfo.name}</p>
                <p className="text-sm text-muted-foreground">Category</p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">
                  {timeRemaining}
                </p>
                <p className="text-sm text-muted-foreground">Time remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <Button
          variant="success"
          size="lg"
          className="w-full"
          onClick={handleOpenWallet}
        >
          <Wallet className="mr-2 h-5 w-5" />
          Open Wallet to Tap & Pay
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setCurrentScreen('home')}
        >
          Return to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>

      {/* Security Reminder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Security Reminder</p>
                <p className="text-blue-700">
                  Your card will automatically freeze again when the timer expires or after your purchase is complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
