import { MaterialIcon } from './MaterialIcon';
import { AccentureLogo } from '../assets/images/AccentureLogo';

export function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Accenture Logo */}
        <div className="flex justify-center mb-8">
          <AccentureLogo size="lg" />
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 border-4 border-[#A100FF]/20 border-t-[#A100FF] rounded-full animate-spin" />
        </div>

        {/* Loading text */}
        <p className="text-gray-500 text-sm font-medium">Loading dashboard...</p>

        {/* Subtle loading bar */}
        <div className="mt-6 w-48 mx-auto">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-[#A100FF] to-[#A100FF]/40 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        {/* Error icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <MaterialIcon icon="error" size={32} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>

        {/* Message */}
        <p className="text-gray-500 text-sm mb-8">
          {message}
        </p>

        {/* Retry button */}
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-[#A100FF] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#8A00DB] transition-colors"
        >
          <MaterialIcon icon="refresh" size={18} />
          Retry
        </button>
      </div>
    </div>
  );
}
