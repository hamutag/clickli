import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl mb-6">🛒</div>
        <h1 className="text-4xl font-bold mb-3">404</h1>
        <p className="text-gray-500 mb-8 text-lg">הדף שחיפשת לא נמצא</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            לדף הבית
          </Link>
          <Link
            href="/deals"
            className="border-2 border-blue-200 text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            לכל הדילים
          </Link>
        </div>
      </div>
    </div>
  );
}
