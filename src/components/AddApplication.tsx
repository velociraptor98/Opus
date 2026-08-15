import { ApplicationKind, KIND_LABELS } from "@/constants/kind";

/** The one primary action on the list screen — and the only coral button. */
export const AddApplication = ({
  setIsModalOpen,
  kind,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  kind: ApplicationKind;
}) => {
  return (
    <button
      onClick={() => setIsModalOpen(true)}
      title={KIND_LABELS[kind].addAction}
      className="btn btn-primary whitespace-nowrap"
      style={{ letterSpacing: "0.08em" }}
    >
      + NEW APPLICATION
    </button>
  );
};
