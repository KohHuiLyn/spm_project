// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '../supabase/client';

// export default function ProfilePage() {
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data: { user } }) => {
//       setUser(user);
//     });
//   }, []);

//   return (
//     <div>
//       <h1>Profile Page</h1>
//       {user ? <p>Logged in as: {user.email}</p> : <p>Loading or not logged in.</p>}
//     </div>
//   );
// }
