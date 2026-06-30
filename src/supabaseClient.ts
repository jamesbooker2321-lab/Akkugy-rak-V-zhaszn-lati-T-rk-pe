import { createClient } from '@supabase/supabase-js';
import { Complaint } from './types';
import { INITIAL_COMPLAINTS } from './data';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase keys are provided and aren't placeholders
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let detectedColumns: string[] | null = null;

/**
 * Maps Supabase row to our Complaint interface.
 * Handles both snake_case (standard Supabase) and camelCase columns gracefully.
 */
export function mapSupabaseToComplaint(row: any): Complaint {
  let datumVal = new Date().toISOString().split('T')[0];
  if (row.datum) {
    datumVal = row.datum;
  } else if (row.date) {
    datumVal = row.date;
  } else if (row.created_at) {
    datumVal = row.created_at.split('T')[0];
  }

  return {
    id: String(row.id),
    factoryId: row.factory_id || row.factoryId || '',
    factoryName: row.factory_name || row.factoryName || '',
    datum: datumVal,
    tipus: row.tipus,
    leiras: row.leiras || '',
    bekuldo_nev: row.bekuldo_nev || row.bekuldoName || '',
    bekuldo_email: row.bekuldo_email || row.bekuldoEmail || '',
    hitelesitett: typeof row.hitelesitett === 'boolean' ? row.hitelesitett : !!row.hitelesitett,
  };
}

/**
 * Prepares a Complaint for insertion into Supabase,
 * providing both camelCase and snake_case properties to ensure maximum compatibility.
 */
export function mapComplaintToSupabase(complaint: Omit<Complaint, 'id'>, columns: string[] | null) {
  const payload: any = {};

  if (columns) {
    if (columns.includes('factory_id')) payload['factory_id'] = complaint.factoryId;
    else if (columns.includes('factoryId')) payload['factoryId'] = complaint.factoryId;

    if (columns.includes('factory_name')) payload['factory_name'] = complaint.factoryName;
    else if (columns.includes('factoryName')) payload['factoryName'] = complaint.factoryName;

    if (columns.includes('datum')) payload['datum'] = complaint.datum;
    else if (columns.includes('date')) payload['date'] = complaint.datum;

    if (columns.includes('tipus')) payload['tipus'] = complaint.tipus;
    if (columns.includes('leiras')) payload['leiras'] = complaint.leiras;

    if (columns.includes('bekuldo_nev')) payload['bekuldo_nev'] = complaint.bekuldo_nev;
    else if (columns.includes('bekuldoName')) payload['bekuldoName'] = complaint.bekuldo_nev;

    if (columns.includes('bekuldo_email')) payload['bekuldo_email'] = complaint.bekuldo_email;
    else if (columns.includes('bekuldoEmail')) payload['bekuldoEmail'] = complaint.bekuldo_email;

    if (columns.includes('hitelesitett')) payload['hitelesitett'] = complaint.hitelesitett;
  } else {
    // Default layout when columns are not yet known
    payload['factory_id'] = complaint.factoryId;
    payload['factory_name'] = complaint.factoryName;
    payload['datum'] = complaint.datum;
    payload['tipus'] = complaint.tipus;
    payload['leiras'] = complaint.leiras;
    payload['bekuldo_nev'] = complaint.bekuldo_nev;
    payload['bekuldo_email'] = complaint.bekuldo_email;
    payload['hitelesitett'] = complaint.hitelesitett;
  }

  return payload;
}

/**
 * Fetches complaints from Supabase. Falls back to localStorage or INITIAL_COMPLAINTS.
 */
export async function getComplaints(): Promise<Complaint[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Falling back to local storage.');
    const saved = localStorage.getItem('akkugyar_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  }

  try {
    // No .order('datum') to prevent failures if datum column doesn't exist or is named differently
    const { data, error } = await supabase
      .from('bejelentések')
      .select('*');

    if (error) {
      // Try fallback to standard english name if 'bejelentések' table doesn't exist
      const { data: engData, error: engError } = await supabase
        .from('complaints')
        .select('*');

      if (engError) {
        throw new Error(error.message + ' / ' + engError.message);
      }

      if (engData) {
        if (engData.length > 0) {
          detectedColumns = Object.keys(engData[0]);
        }
        return engData
          .map(mapSupabaseToComplaint)
          .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
      }
    }

    if (data) {
      if (data.length > 0) {
        detectedColumns = Object.keys(data[0]);
        console.log('Successfully detected Supabase columns:', detectedColumns);
      }
      return data
        .map(mapSupabaseToComplaint)
        .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
    }
  } catch (err) {
    console.error('Failed to fetch from Supabase, returning local storage fallback:', err);
  }

  const saved = localStorage.getItem('akkugyar_complaints');
  return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
}

/**
 * Inserts a new complaint to Supabase. Also updates local storage as a backup.
 */
export async function insertComplaint(complaint: Omit<Complaint, 'id' | 'hitelesitett'>): Promise<Complaint> {
  const newComplaint: Complaint = {
    ...complaint,
    id: `c-${Date.now()}`,
    hitelesitett: false,
  };

  // Sync with local storage as a fallback / local cache
  const saved = localStorage.getItem('akkugyar_complaints');
  const existing: Complaint[] = saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  const updated = [newComplaint, ...existing];
  localStorage.setItem('akkugyar_complaints', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase is not configured. Saved complaint locally.');
    return newComplaint;
  }

  try {
    const dbPayload = mapComplaintToSupabase(newComplaint, detectedColumns);
    
    // Attempt inserting into Hungarian named table 'bejelentések' first
    let { data, error } = await supabase
      .from('bejelentések')
      .insert([dbPayload])
      .select();

    // If it failed because of datum column missing
    if (error && error.message.includes('datum') && error.message.includes('does not exist')) {
      console.warn('datum column doesn\'t exist. Trying with "date"...');
      const payloadCopy = { ...dbPayload };
      delete payloadCopy.datum;
      payloadCopy.date = newComplaint.datum;

      const retry1 = await supabase
        .from('bejelentések')
        .insert([payloadCopy])
        .select();

      if (retry1.error) {
        console.warn('date column also failed. Retrying without any datum/date fields...');
        const payloadCopy2 = { ...payloadCopy };
        delete payloadCopy2.date;

        const retry2 = await supabase
          .from('bejelentések')
          .insert([payloadCopy2])
          .select();

        if (retry2.error) {
          throw retry2.error;
        }
        data = retry2.data;
        error = null;
      } else {
        data = retry1.data;
        error = null;
      }
    }

    if (error) {
      // Try english table 'complaints' fallback
      let { data: engData, error: engError } = await supabase
        .from('complaints')
        .insert([dbPayload])
        .select();

      if (engError && engError.message.includes('datum') && engError.message.includes('does not exist')) {
        const payloadCopy = { ...dbPayload };
        delete payloadCopy.datum;
        payloadCopy.date = newComplaint.datum;

        const engRetry1 = await supabase
          .from('complaints')
          .insert([payloadCopy])
          .select();

        if (engRetry1.error) {
          const payloadCopy2 = { ...payloadCopy };
          delete payloadCopy2.date;

          const engRetry2 = await supabase
            .from('complaints')
            .insert([payloadCopy2])
            .select();

          if (engRetry2.error) {
            throw engRetry2.error;
          }
          engData = engRetry2.data;
          engError = null;
        } else {
          engData = engRetry1.data;
          engError = null;
        }
      }

      if (engError) {
        console.error('Error inserting to Supabase:', engError);
        throw engError;
      }
      if (engData && engData[0]) {
        return mapSupabaseToComplaint(engData[0]);
      }
    }

    if (data && data[0]) {
      return mapSupabaseToComplaint(data[0]);
    }
  } catch (err) {
    console.error('Failed to save to Supabase, saved to local storage fallback instead:', err);
  }

  return newComplaint;
}

/**
 * Subscribes to new inserts on Supabase table and triggers a callback.
 */
export function subscribeToComplaints(onNewComplaint: (complaint: Complaint) => void) {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  const handlePayload = (payload: any) => {
    if (payload.new) {
      const mapped = mapSupabaseToComplaint(payload.new);
      onNewComplaint(mapped);
    }
  };

  const channel1 = supabase
    .channel('bejelentések-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bejelentések' },
      handlePayload
    )
    .subscribe();

  const channel2 = supabase
    .channel('complaints-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'complaints' },
      handlePayload
    )
    .subscribe();

  // Return a cleanup function
  return () => {
    supabase.removeChannel(channel1);
    supabase.removeChannel(channel2);
  };
}
