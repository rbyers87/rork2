# Police Department Shift Scheduler

A React Native app built with Expo for managing police department shift scheduling with Supabase backend.

## Features

- **Shift Management**: Create, edit, and delete shifts with recurring patterns
- **Officer Management**: Manage officer profiles and assignments with PTO tracking
- **Daily Roster**: View and edit daily shift assignments with beat and car assignments
- **Time Off Management**: Convert shifts to time off (vacation, holiday, sick) and track PTO balances
- **Calendar View**: Visual calendar interface for shift scheduling
- **Authentication**: Secure login with Supabase Auth
- **Real-time Updates**: Live data synchronization across devices

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new Supabase project
   - Copy `.env.example` to `.env` and fill in your Supabase credentials
   - Run the database migrations (see Database Schema section)

4. Start the development server:
   ```bash
   npm start
   ```

### Database Schema

Create the following tables in your Supabase database:

```sql
-- Officers table (updated with PTO balances)
CREATE TABLE officers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  badge TEXT NOT NULL UNIQUE,
  rank TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar TEXT,
  is_supervisor BOOLEAN DEFAULT false,
  vacation_balance INTEGER DEFAULT 0,
  holiday_balance INTEGER DEFAULT 0,
  sick_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts table
CREATE TABLE shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('morning', 'afternoon', 'night', 'custom')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  notes TEXT,
  color TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  recurrence_interval INTEGER,
  recurrence_days_of_week INTEGER[],
  recurrence_ends_on TIMESTAMP WITH TIME ZONE,
  recurrence_exceptions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES officers(id)
);

-- Shift assignments table
CREATE TABLE shift_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  officer_id UUID REFERENCES officers(id) ON DELETE CASCADE,
  beat_id UUID REFERENCES beats(id),
  car_id UUID REFERENCES patrol_cars(id),
  notes TEXT,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'requested', 'confirmed', 'declined')),
  assigned_by UUID REFERENCES officers(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shift_id, officer_id)
);

-- Time off requests table (NEW)
CREATE TABLE time_off_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  officer_id UUID REFERENCES officers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'holiday', 'sick')),
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES officers(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beats table
CREATE TABLE beats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patrol cars table
CREATE TABLE patrol_cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'assigned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swap requests table
CREATE TABLE swap_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID REFERENCES officers(id) ON DELETE CASCADE,
  requested_to UUID REFERENCES officers(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  offered_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
CREATE POLICY "Officers can view all officers" ON officers FOR SELECT USING (true);
CREATE POLICY "Officers can view all shifts" ON shifts FOR SELECT USING (true);
CREATE POLICY "Officers can view all assignments" ON shift_assignments FOR SELECT USING (true);
CREATE POLICY "Officers can view all time off requests" ON time_off_requests FOR SELECT USING (true);
CREATE POLICY "Officers can view all beats" ON beats FOR SELECT USING (true);
CREATE POLICY "Officers can view all patrol cars" ON patrol_cars FOR SELECT USING (true);

-- Supervisors can manage shifts, assignments, and time off
CREATE POLICY "Supervisors can manage shifts" ON shifts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM officers 
    WHERE officers.id = auth.uid() 
    AND officers.is_supervisor = true
  )
);

CREATE POLICY "Supervisors can manage time off" ON time_off_requests FOR ALL USING (
  EXISTS (
    SELECT 1 FROM officers 
    WHERE officers.id = auth.uid() 
    AND officers.is_supervisor = true
  )
);

-- Officers can manage their own time off requests
CREATE POLICY "Officers can manage own time off" ON time_off_requests FOR ALL USING (
  officer_id = auth.uid()
);

-- Function to automatically update PTO balances when time off is approved
CREATE OR REPLACE FUNCTION update_pto_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update balance when status changes to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Deduct 8 hours (standard shift) from appropriate balance
    CASE NEW.type
      WHEN 'vacation' THEN
        UPDATE officers 
        SET vacation_balance = GREATEST(0, vacation_balance - 8)
        WHERE id = NEW.officer_id;
      WHEN 'holiday' THEN
        UPDATE officers 
        SET holiday_balance = GREATEST(0, holiday_balance - 8)
        WHERE id = NEW.officer_id;
      WHEN 'sick' THEN
        UPDATE officers 
        SET sick_balance = GREATEST(0, sick_balance - 8)
        WHERE id = NEW.officer_id;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for PTO balance updates
CREATE TRIGGER update_pto_balance_trigger
  AFTER UPDATE ON time_off_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_pto_balance();
```

### Environment Variables

Create a `.env` file with:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

1. **Login**: Use your officer email and password to log in
2. **View Schedule**: Browse shifts by date using the calendar view
3. **Create Shifts**: Add new shifts with officer assignments
4. **Manage Roster**: Edit daily rosters with beat and car assignments
5. **Time Off Management**: 
   - Click on an officer in a shift to convert their assignment to time off
   - View PTO balances on officer profiles
   - Track time off usage in the roster view
6. **Officer Management**: View officer profiles with PTO balances and schedules

## Time Off Features

- **PTO Balances**: Each officer has vacation, holiday, and sick time balances
- **Shift Conversion**: Convert scheduled shifts to time off with automatic balance deduction
- **Roster Integration**: Time off appears at the bottom of daily rosters by category
- **Balance Tracking**: Real-time PTO balance updates when time off is used

## Architecture

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
