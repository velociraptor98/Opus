export const AddApplication = ({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <button
      onClick={() => setIsModalOpen(true)}
      title="Add Application"
      className="btn-glass w-full h-10 rounded-full flex items-center justify-center text-breath transition-all duration-200 active:scale-95 hover:scale-[1.03]"
      style={{
        background: "color-mix(in srgb, var(--clay) 12%, transparent)",
        boxShadow:
          "inset 0 0 0 1.5px color-mix(in srgb, var(--clay) 35%, transparent)",
      }}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
};
