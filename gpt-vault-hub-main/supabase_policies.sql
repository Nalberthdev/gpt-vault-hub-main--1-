-- SQL setup for Supabase RLS and tables
-- Add created_by field if not exists
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();

ALTER TABLE public.available_slots
ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Appointment policies
CREATE POLICY "Allow insert for authenticated users"
ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Select own appointments"
ON public.appointments
FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Update/delete own appointments"
ON public.appointments
FOR UPDATE USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Available slot policies for admins only
CREATE POLICY "Admin manage available slots"
ON public.available_slots
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = TRUE))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- Profile policies
CREATE POLICY "Select own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Admin update profiles"
ON public.profiles
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = TRUE))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = TRUE));
