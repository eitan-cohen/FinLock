'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export function CardScreen() {
  const { cardDetails, setCardDetails, setCurrentScreen } = useAppStore();

  useEffect(() => {
    const loadDetails = async () => {
      const response = await apiClient.getCardDetails();
      if (response.success && response.data) {
        setCardDetails(response.data.card);
      }
    };

    if (!cardDetails) {
      loadDetails();
    }
  }, [cardDetails, setCardDetails]);

  if (!cardDetails) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading card information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <Button variant="ghost" size="icon" onClick={() => setCurrentScreen('home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">My Card</h1>
          <p className="text-sm text-muted-foreground">View your card details</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="fintech-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Card Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-mono tracking-widest">
                {cardDetails.maskedNumber || '****-****-****-****'}
              </p>
              <p className="text-muted-foreground text-sm">
                Expires {cardDetails.expiryMonth}/{cardDetails.expiryYear}
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status</span>
              <span className="font-medium capitalize">{cardDetails.status}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
