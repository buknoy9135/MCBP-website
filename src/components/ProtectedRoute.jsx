import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setAuthenticated(true);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div style={{textAlign:'center', marginTop:100}}>Loading...</div>;

  if (!authenticated) {
    window.location.href = "/#/admin";
    return null;
  }

  return children;
}