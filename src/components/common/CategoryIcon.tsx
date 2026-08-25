import React from 'react';
import {
  Wallet,
  TrendingUp,
  Gift,
  Utensils,
  ShoppingBag,
  Car,
  ShoppingCart,
  Zap,
  Film,
  Home,
  HeartPulse,
  BookOpen,
  Tag,
  Coffee,
  Plane,
  Music,
  Shield,
  Smartphone,
  Landmark,
  Award,
  PiggyBank,
  Sparkles,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps {
  icon?: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Wallet,
  TrendingUp,
  Gift,
  Utensils,
  ShoppingBag,
  Car,
  ShoppingCart,
  Zap,
  Film,
  Home,
  HeartPulse,
  BookOpen,
  Tag,
  Coffee,
  Plane,
  Music,
  Shield,
  Smartphone,
  Landmark,
  Award,
  PiggyBank,
  Sparkles,
};

// Check if string contains or is mostly emoji
const isEmoji = (str: string): boolean => {
  if (!str) return false;
  // Common emoji range test
  return /\p{Extended_Pictographic}/u.test(str);
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon = 'Tag',
  className = 'w-3.5 h-3.5',
  size,
}) => {
  if (!icon) {
    return <Tag className={className} size={size} />;
  }

  // If the icon is already an emoji, return it wrapped in span
  if (isEmoji(icon)) {
    return (
      <span className="inline-flex items-center justify-center leading-none text-xs" style={{ fontSize: size ? `${size}px` : undefined }}>
        {icon}
      </span>
    );
  }

  // Look up Lucide icon component
  const MatchedComponent = ICON_MAP[icon];
  if (MatchedComponent) {
    return <MatchedComponent className={className} size={size} />;
  }

  // Fallback
  return <Tag className={className} size={size} />;
};
