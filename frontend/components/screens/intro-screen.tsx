'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { HelpCircle, CreditCard, Shield, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export function IntroScreen() {
  const { setIntroCompleted, setCurrentScreen } = useAppStore();

  const handleStart = () => {
    setIntroCompleted(true);
    setCurrentScreen('home');
  };

  const steps = [
    {
      icon: Shield,
      title: 'Virtual card created',
      text: 'FinLock automatically provisions and freezes your card when you sign up.'
    },
    {
      icon: CreditCard,
      title: 'Authorize before you pay',
      text: 'Unlock the card from the Authorize tab by choosing an amount and category.'
    },
    {
      icon: DollarSign,
      title: 'Tap or copy card details',
      text: 'Use the virtual card for checkout then it re-freezes when done.'
    },
    {
      icon: HelpCircle,
      title: 'Review anytime',
      text: 'Visit this guide from the menu whenever you need a refresher.'
    }
  ];

  return (
    <div className="space-y-6 p-4 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="fintech-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Getting Started</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
        <Button variant="fintech" size="lg" className="w-full max-w-sm" onClick={handleStart}>
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}

