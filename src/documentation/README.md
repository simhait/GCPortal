# K12 Nutrition Dashboard Documentation

## Architecture Overview

The application follows a component-based architecture with clear separation of concerns:

### Core Concepts
- **Components**: Reusable UI building blocks
- **Hooks**: Custom logic and state management
- **Services**: API and data handling
- **Types**: TypeScript interfaces and types
- **Store**: Global state management with Zustand

### Directory Structure
```
src/
├── components/
│   ├── common/         # Shared UI components
│   ├── dashboard/      # Dashboard-specific components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/               # API and utility functions
├── pages/             # Page components
├── store/             # Global state management
├── types/             # TypeScript types
└── documentation/     # Project documentation
```

## Component Documentation

### Common Components

#### LoadingSpinner
A reusable loading indicator component.

Props:
- `size`: 'sm' | 'md' | 'lg'
- `className`: Optional CSS classes

#### EmptyState
A consistent empty state component.

Props:
- `title`: string
- `message`: string
- `icon`: Optional React component

#### Card
A reusable card container component.

Props:
- `children`: React.ReactNode
- `className`: Optional CSS classes

### Dashboard Components

#### TimeframeSelector
Time range selection component for dashboard metrics.

Features:
- Prior Day
- Today
- This Week
- This Month
- Year to Date

#### KPICard
Display component for key performance indicators.

Props:
- `kpi`: KPI object
- `value`: number
- `trend`: number

#### PerformanceTrends
Chart component for visualizing KPI trends.

Props:
- `kpis`: KPI[]
- `kpiValues`: KPIValue[]
- `selectedSchool`: string
- `dateRange`: { start: Date; end: Date }

## Data Flow

1. User Authentication
   - Login via Supabase
   - User profile management

2. Dashboard Data
   - KPI fetching and aggregation
   - School metrics calculation
   - Performance trend analysis

3. State Management
   - Global state via Zustand
   - Component-level state where appropriate
   - Memoized calculations for performance

## Best Practices

1. Component Design
   - Single responsibility principle
   - Proper prop typing
   - Consistent error handling
   - Loading states

2. Performance
   - Memoization of expensive calculations
   - Proper dependency arrays in hooks
   - Lazy loading where appropriate

3. Styling
   - Consistent dark mode support
   - Responsive design
   - Accessible color schemes

4. Error Handling
   - Graceful error states
   - User-friendly error messages
   - Proper error boundaries

## Type Definitions

Key interfaces and types used throughout the application:

```typescript
interface KPI {
  id: string;
  name: string;
  description: string;
  unit: string;
  benchmark: number;
  goal: number;
}

interface KPIValue {
  id: string;
  kpi_id: string;
  value: number;
  date: string;
}

interface SchoolMetrics {
  id: string;
  school_id: string;
  school_name: string;
  date: string;
  program_access_rate: number;
  breakfast_participation_rate: number;
  lunch_participation_rate: number;
  reimbursement_amount: number;
  alc_revenue: number;
  meal_equivalents: number;
  mplh: number;
  eod_tasks_completed: boolean;
}
```