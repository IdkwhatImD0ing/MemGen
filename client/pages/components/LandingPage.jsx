import React from "react";
import Link from "next/link";

export default function LandingPage() {
  const handleRedirect = () => {
    window.location.href = "/homepage";
  };

  return (
    <div
      className="flex items-center min-h-screen gap-6 text-white px-20"
      style={{ overflowY: "hidden", height: "100vh" }}
    >
      <div>
        <div className="flex flex-col gap-4">
          <div className="font-bold text-8xl">Where Careers</div>
          <div className="font-bold text-8xl">Are Built</div>
        </div>

        <div className="text-2xl mt-4">
          Accurate and effective cover letter generation
        </div>
        <button
          onClick={handleRedirect}
          className="bg-white rounded-md px-9 py-3 text-black text-xl hover:scale-105 active:scale-95 font-bold mt-4"
        >
          Start Generating
        </button>
      </div>
    </div>
  );
}
