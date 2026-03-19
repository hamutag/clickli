import type { Metadata } from "next";
import DealRequestForm from "@/components/DealRequestForm";
import DealRequestsList from "@/components/DealRequestsList";

export const metadata: Metadata = {
  title: "בקשות דילים | קליקלי",
  description:
    "מחפשים מוצר ספציפי? ספרו לנו מה אתם רוצים ונמצא לכם את הדיל הכי שווה.",
  alternates: {
    canonical: "/requests",
  },
};

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900/30 via-gray-950 to-gray-950" />
        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-10 md:pt-24 md:pb-14 text-center">
          <div className="text-5xl mb-5">&#128269;</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            מה אתם מחפשים?
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            ספרו לנו מה אתם רוצים ונחפש לכם את הדיל הכי שווה.
            <br />
            אחרים יכולים להצביע לבקשות שלכם כדי שנתעדף אותן.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-4xl mx-auto px-4 pb-10">
        <h2 className="text-xl font-bold mb-4">שלחו בקשה חדשה</h2>
        <DealRequestForm />
      </section>

      {/* Requests List */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-bold mb-6">בקשות פתוחות</h2>
        <DealRequestsList />
      </section>
    </div>
  );
}
