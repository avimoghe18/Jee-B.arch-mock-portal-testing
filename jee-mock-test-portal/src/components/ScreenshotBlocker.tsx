import { Shield, Maximize } from 'lucide-react';

interface ScreenshotBlockerProps {
  onEnterFullscreen: () => void;
}

export default function ScreenshotBlocker({ onEnterFullscreen }: ScreenshotBlockerProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <Shield className="text-red-500 mx-auto animate-pulse" size={80} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Screenshot Detected!</h1>
        <p className="text-gray-300 mb-8 text-lg">
          Taking screenshots during the test is not allowed. This violation has been recorded.
        </p>
        <p className="text-gray-400 mb-8">
          To continue your test, please enter fullscreen mode.
        </p>
        <button
          onClick={onEnterFullscreen}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105 flex items-center gap-3 mx-auto"
        >
          <Maximize size={24} />
          Enter Fullscreen to Continue
        </button>
        <p className="text-gray-500 mt-6 text-sm">
          Warning: Multiple violations may result in automatic test submission.
        </p>
      </div>
    </div>
  );
}
