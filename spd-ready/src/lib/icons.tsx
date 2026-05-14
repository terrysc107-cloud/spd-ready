// Lucide icon barrel — import from here, never from "lucide-react" directly
import type { LucideProps, LucideIcon } from 'lucide-react'

export {
  // Domain icons
  Wrench,
  Droplets,
  Package,
  FlaskConical,
  ShieldCheck,
  Warehouse,
  ShieldAlert,
  Brain,
  BookOpen,
  TestTube,
  // Gamification
  Flame,
  Zap,
  Trophy,
  // Actions / navigation
  Building2,
  GraduationCap,
  ClipboardList,
  Target,
  TrendingUp,
  RefreshCw,
  FolderOpen,
  Pencil,
  FileText,
  Pin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  // Status / feedback
  CheckCircle2,
  XCircle,
  CheckCheck,
  AlertCircle,
  // Data / scoring
  BarChart3,
  User,
  // Confidence tap
  HelpCircle,
  Smile,
  Dumbbell,
  // Misc
  Sparkles,
  Star,
} from 'lucide-react'

import {
  Wrench,
  Droplets,
  Package,
  FlaskConical,
  ShieldCheck,
  Warehouse,
  ShieldAlert,
  Brain,
  BookOpen,
  TestTube,
  HelpCircle,
} from 'lucide-react'

const DOMAIN_ICON_MAP: Record<string, LucideIcon> = {
  Wrench,
  Droplets,
  Package,
  FlaskConical,
  ShieldCheck,
  Warehouse,
  ShieldAlert,
  Brain,
  BookOpen,
  TestTube,
}

export function DomainIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = DOMAIN_ICON_MAP[name] ?? HelpCircle
  return <Icon {...props} />
}
