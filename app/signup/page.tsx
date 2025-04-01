// 'use client';

// import { useState } from 'react';
// import { supabase } from '../supabase/client';

// export default function SignUpPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSignUp = async () => {
//     const { error } = await supabase.auth.signUp({ email, password });
//     if (error) alert('Signup failed: ' + error.message);
//     else alert('Check your email to confirm your account!');
//   };

//   return (
//     <div>
//       <h1>Sign Up</h1>
//       <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
//       <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
//       <button onClick={handleSignUp}>Sign Up</button>
//     </div>
//   );
// }
