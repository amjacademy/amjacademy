import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();
  const MAIN = "https://amjacademy-working.onrender.com";
  const TEST= "http://localhost:5000";

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${MAIN}/api/admin/check-auth`, {
          method: "GET",
          credentials: "include", // 🧠 send cookies
        });

        const data = await res.json();
        console.log("Check-auth response:", data);

        if (res.ok && data.success) {
          setIsAuth(true);
        } else {
          navigate("/AdminLogin");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/AdminLogin");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return isAuth ? children : null;
}
