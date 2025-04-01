'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error  } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.log("Login error:", error);
    // Ignore email_not_confirmed error
    if (error.code !== "email_not_confirmed") {
      redirect("/error");
    }
  }

  const user = authData.user;
  if (!user) {
    console.error("No user returned from signIn");
    redirect("/error");
  }

  // Query the profile table
  const { data: profile, error: profileError } = await supabase
    .from("profiles") // Or whatever your table is named
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    redirect("/error");
  }

  // Check if profile is incomplete (adjust field checks as needed)
  if (!profile || !profile.size_recos || !profile.style_recos) {
    redirect("/profileSetup");
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}