import React from "react";
import { X } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onShare: (platform: string) => void;
}

const platforms = [
  {
    name: "WhatsApp",
    icon: "/icons/whatsapp.svg",
    shareUrl: (url: string, text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: "Facebook",
    icon: "/icons/facebook.svg",
    shareUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Twitter",
    icon: "/icons/twitter.svg",
    shareUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Telegram",
    icon: "/icons/telegram.svg",
    shareUrl: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  url,
  onShare,
}) => {
  if (!isOpen) return null;

  const handleShare = async (platform: string) => {
    // Try native share API first
    if (navigator.share && platform === "native") {
      try {
        await navigator.share({
          title: "Check out this task",
          text: "I found this interesting task",
          url,
        });
        onShare("native");
        return;
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }

    // Platform-specific sharing
    const selectedPlatform = platforms.find((p) => p.name === platform);
    if (selectedPlatform) {
      window.open(
        selectedPlatform.shareUrl(url, "Check out this interesting task!"),
        "_blank"
      );
      onShare(platform);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Share via
        </h3>

        {/* Native share button for mobile */}
        {navigator.share&& (
          <button
            onClick={() => handleShare("native")}
            className="w-full mb-4 flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Share using device
          </button>
        )}

        <div className="grid grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => handleShare(platform.name)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <img
                src={platform.icon}
                alt={platform.name}
                className="w-8 h-8"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {platform.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
