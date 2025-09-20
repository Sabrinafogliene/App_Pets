import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, title, value, color, bgColor, delay = 0, path }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        className={cn('overflow-hidden transition-all duration-200 hover:shadow-md relative', path ? 'cursor-pointer hover:scale-105' : '')}
        onClick={handleClick}
      >
        <CardContent className="p-6 relative">
          <div className={cn('absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-20', bgColor)}></div>
          <div className="relative z-10">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', bgColor, 'bg-opacity-80')}>
              <Icon className={cn('w-6 h-6', color)} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-card-foreground">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;