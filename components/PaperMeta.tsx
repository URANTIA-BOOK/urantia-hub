import { formatPaperLabel, formatPartHeading, useUiCopy } from "@/libs/uiCopy";

type PaperMetaProps = {
  paperId: string;
  partId?: string;
};

const PaperMeta = ({ paperId, partId }: PaperMetaProps) => {
  const copy = useUiCopy();

  if (paperId === "0") {
    return <span>{copy.forewordLabel}</span>;
  }

  return (
    <>
      <span>{formatPaperLabel(copy, paperId)}</span>
      {partId ? <span>{formatPartHeading(copy, partId)}</span> : null}
    </>
  );
};

export default PaperMeta;
