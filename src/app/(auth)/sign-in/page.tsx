
import { Suspense } from "react";
import SignInForm from "../SignInForm";


export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#090d16] text-slate-100">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}