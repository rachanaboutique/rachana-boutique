import { Outlet } from "react-router-dom";
import { useEffect } from "react";

function AuthLayout() {
  // Ensure proper cleanup and interaction on auth pages
  useEffect(() => {
    // Force cleanup of any lingering mobile sheet effects
    document.body.classList.remove('sheet-open');
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = 'unset';

    // Ensure all form elements are interactive
    const formElements = document.querySelectorAll('input, textarea, select, button, a');
    formElements.forEach(element => {
      element.style.pointerEvents = 'auto';
    });
  }, []);

  return (
    <div className="auth-layout flex min-h-screen w-full">
      <div className="hidden lg:flex items-center justify-center w-1/2 px-12 bg-auth-bg bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black bg-opacity-35"></div>
        <div className="z-10 max-w-md space-y-6 text-center text-primary-foreground">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to Rachana Boutique
          </h1>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;