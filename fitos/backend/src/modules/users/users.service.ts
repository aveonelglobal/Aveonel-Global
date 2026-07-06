import { getSupabase } from "../../db/client";
import { UserProfile } from "../../types";

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as UserProfile | null;
}

/**
 * Creates the profile row on first login with the hard-coded defaults from
 * the FitOS spec (4'11", 62kg, Gujarati vegetarian fat-loss targets). Every
 * field remains editable afterward via updateUserProfile.
 */
export async function ensureUserProfile(userId: string, email: string): Promise<UserProfile> {
  const existing = await getUserProfile(userId);
  if (existing) return existing;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      email,
      height_cm: 150,
      weight_kg: 62,
      goal: "fat_loss",
      diet_type: "gujarati_vegetarian",
      excludes: ["egg", "meat", "fish"],
      calorie_target_min: 1300,
      calorie_target_max: 1500,
      protein_target_min: 70,
      protein_target_max: 90,
      water_target_ml: 2500,
      cycle_tracking_enabled: true,
      commute_minutes: 90,
    })
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export async function updateUserProfile(userId: string, patch: Partial<UserProfile>): Promise<UserProfile> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("users").update(patch).eq("id", userId).select().single();
  if (error) throw error;
  return data as UserProfile;
}
