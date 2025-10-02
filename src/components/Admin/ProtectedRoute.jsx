import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/check-auth", {
          credentials: "include", // send cookie
        });
        const data = await res.json();

        if (data.success) {
          setIsAuth(true);
        } else {
          navigate("/AdminLogin");
        }
      } catch (err) {
        console.error(err);
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
