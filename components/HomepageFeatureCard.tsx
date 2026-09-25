import Link from "next/link";
import { useUiCopy } from "@/libs/uiCopy";
import {
  Smartphone,
  Target,
  Search,
  BarChart2,
  Bookmark,
  PenTool,
  Headphones,
  Brain,
  Palette,
} from "lucide-react";

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  iconColor,
}: {
  icon: typeof Smartphone;
  title: string;
  description: React.ReactNode;
  iconColor: string;
}) => (
  <div className="group relative">
    <div
      className="relative h-full bg-slate-800 backdrop-blur-sm p-8 rounded-xl transition-all duration-300
      hover:shadow-xl hover:scale-105 hover:-translate-y-1 transform"
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl flex-shrink-0`}
          style={{ backgroundColor: iconColor }}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold text-slate-200">{title}</h3>
      </div>
      <p className="relative text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

export function useModernFeatures() {
  const copy = useUiCopy();
  return [
    {
      icon: Smartphone,
      title: copy.featureReadAnywhere,
      description: copy.featureReadAnywhereBody,
      iconColor: "#007bff",
    },
    {
      icon: Target,
      title: copy.featureResume,
      description: copy.featureResumeBody,
      iconColor: "#dc3545",
    },
    {
      icon: Search,
      title: copy.featureSearch,
      description: copy.featureSearchBody,
      iconColor: "#ffc107",
    },
    {
      icon: BarChart2,
      title: copy.featureProgress,
      description: copy.featureProgressBody,
      iconColor: "#ff9800",
    },
    {
      icon: Bookmark,
      title: copy.featureBookmarks,
      description: copy.featureBookmarksBody,
      iconColor: "#28a745",
    },
    {
      icon: PenTool,
      title: copy.featureNotes,
      description: copy.featureNotesBody,
      iconColor: "#00bcd4",
    },
    {
      icon: Headphones,
      title: copy.featureAudio,
      description: (
        <>
          {copy.featureAudioLead}{" "}
          <Link
            href="https://open.spotify.com/show/7IDP6RsZbKtUjfEwLLHtuw?si=1fec0631594d45fb"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {copy.featureSpotify}
          </Link>
          {copy.featureAudioTrail}
        </>
      ),
      iconColor: "#007bff",
    },
    {
      icon: Brain,
      title: copy.featureAi,
      description: copy.featureAiBody,
      iconColor: "#6610f2",
    },
    {
      icon: Palette,
      title: copy.featureCustomize,
      description: copy.featureCustomizeBody,
      iconColor: "#ff9800",
    },
  ];
}
export default FeatureCard;
