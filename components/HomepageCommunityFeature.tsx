export type CommunityFeature = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  linkUrl?: string;
};

export const CommunityFeature = ({
  comingSoon,
  comingSoonLabel,
  icon: Icon,
  title,
  description,
}: any) => (
  <div
    className="group relative bg-white p-8 rounded-2xl transition-all duration-300
    hover:shadow-xl hover:-translate-y-1 border border-slate-200"
  >
    {comingSoon && (
      <div
        className="absolute top-2 md:top-3 -right-5 md:right-3 px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full
      shadow-lg shadow-emerald-500/20 rotate-12 md:rotate-0"
      >
        {comingSoonLabel}
      </div>
    )}

    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600">
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      </div>

      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default CommunityFeature;
