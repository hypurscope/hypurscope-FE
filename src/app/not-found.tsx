import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-12 font-geist-sans">
      <div className="text-center flex flex-col items-center space-y-6 max-w-md">

        {/* Error Code */}
        <div>
          <h1 className="text-7xl md:text-8xl font-bold text-black">404</h1>
          <p className="text-tertiary text-sm md:text-base mt-2">
            Page Not Found
          </p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-black">
            Oops! This page doesn't exist
          </h2>
          <p className="text-tertiary text-sm md:text-base">
            The page you're looking for might have been moved or doesn't exist.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-black bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Go to Homepage
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
