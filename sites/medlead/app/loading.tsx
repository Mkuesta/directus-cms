export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-teal-100 dark:border-teal-900" />
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Loading...
        </p>
      </div>
    </div>
  );
}
