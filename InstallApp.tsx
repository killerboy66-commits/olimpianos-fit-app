import { useEffect, useState } from "react";

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

 if (!deferredPrompt) return null;

return (
  <button
    onClick={installApp}
    style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      background: "linear-gradient(135deg, #C6A15B, #F5E1A4)",
      color: "#0A0A0A",
      padding: "14px 20px",
      borderRadius: "12px",
      fontWeight: "800",
      fontSize: "14px",
      letterSpacing: "1px",
      boxShadow: "0 10px 30px rgba(198, 161, 91, 0.3)",
      border: "none",
      cursor: "pointer",
      zIndex: 9999,
      transition: "all 0.3s ease",
    }}
  >
    📲 INSTALAR APP
  </button>
);
}