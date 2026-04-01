import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="max-w-2xl px-4 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal-50 dark:bg-teal-900/30 mb-6">
          <span className="material-symbols-outlined text-5xl text-primary">search_off</span>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>

        <h2 className="text-2xl font-normal mb-4 text-gray-800 dark:text-gray-200">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let us help you find the right path.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-teal-700 transition"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            <span className="material-symbols-outlined text-sm">mail</span>
            Contact Us
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-400 mb-4">Helpful links:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/" className="text-sm text-primary hover:underline">Home</Link>
            <span className="text-gray-300 dark:text-gray-600">&bull;</span>
            <Link href="/resources" className="text-sm text-primary hover:underline">Resources</Link>
            <span className="text-gray-300 dark:text-gray-600">&bull;</span>
            <Link href="/email-lists" className="text-sm text-primary hover:underline">Email Lists</Link>
            <span className="text-gray-300 dark:text-gray-600">&bull;</span>
            <Link href="/contact" className="text-sm text-primary hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
