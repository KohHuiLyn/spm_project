'use client';

import { useState } from 'react';
import { supabase } from '../supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Login failed: ' + error.message);
    else alert('Logged in!');
  };

  return (
    <div>
      <h1>Log In</h1>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
}

// Log out function component
//<button onClick={() => supabase.auth.signOut()}>Log Out</button>
