import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfileSetupPage() {
//   const supabase = createClient({ cookies });
    const supabase = await createClient();

  // 1. Get session
//   const supabase = await createClient();

const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
        redirect("/sign-in");
    }
    const userId = userData.user.id;

  // 2. Fetch profile
  const { data: profile, error: profileError  } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId) // Adjust column name if needed
    .single();

  // 3. If profile exists AND required fields are filled, redirect to /protected
  if (
    profile.size_recos &&     // Replace these checks with your actual logic
    profile.style_recos
  ) {
    redirect("/protected");
  }

  // 4. Otherwise, show profile setup form
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">Complete Your Profile</h1>
      {/* Your form goes here */}
    </div>
  );
}
