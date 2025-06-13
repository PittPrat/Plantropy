// /apps/web/lib/userUtils.ts
import { supabase } from '@/lib/supabase/client'; // Ensure this path is correct

// Interface for the profile data fetched from Supabase
export interface ProfileData {
  id: string;
  display_name: string;
}

// Fetches display names from the 'profiles' table
export const fetchDisplayNamesFromProfiles = async (userIds: string[]): Promise<Record<string, string>> => {
  const uniqueUserIds = Array.from(new Set(userIds));
  if (uniqueUserIds.length === 0) return {};

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', uniqueUserIds)
      .returns<ProfileData[]>();

    if (error) {
      console.error('Error fetching profiles:', error);
      // Return a map with fallback names for all requested IDs in case of error
      return uniqueUserIds.reduce((acc, id) => {
        acc[id] = `User ${id.substring(0, 6)}`;
        return acc;
      }, {} as Record<string, string>);
    }

    const displayNamesMap: Record<string, string> = {};
    if (data) {
      data.forEach((profile: ProfileData) => {
        displayNamesMap[profile.id] = profile.display_name;
      });
    }

    // Ensure all requested userIds have a fallback if not found in profiles
    uniqueUserIds.forEach(id => {
      if (!displayNamesMap[id]) {
        displayNamesMap[id] = `User ${id.substring(0, 6)}`; // Fallback for missing profiles
      }
    });

    return displayNamesMap;
  } catch (err) {
    console.error('Unexpected error in fetchDisplayNamesFromProfiles:', err);
    return uniqueUserIds.reduce((acc, id) => {
      acc[id] = `User ${id.substring(0, 6)}`;
      return acc;
    }, {} as Record<string, string>);
  }
};
