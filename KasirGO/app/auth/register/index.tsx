import React, { useEffect } from "react";
import { useRouter } from "expo-router";

const RegisterIndex = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to registration type selection page
    router.replace("/auth/registerSelectType");
  }, [router]);

  return null;
};

export default RegisterIndex;