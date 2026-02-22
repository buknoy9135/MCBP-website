import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {

  useEffect(() => {

    const finishLogin = async () => {
      // This reads the #access_token from the URL
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error.message);
        window.location.href = "/admin/login";
        return;
      }

      // If session exists, user is logged in
      if (data.session) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/admin/login";
      }
    };

    finishLogin();

  }, []);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "18px"
    }}>
      Signing you in...
    </div>
  );
}