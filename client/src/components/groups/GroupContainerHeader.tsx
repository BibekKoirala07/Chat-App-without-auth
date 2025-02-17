const GroupContainerHeader = ({
  groupInfo,
  groupActiveMembers,
}: {
  groupInfo: any;
  groupActiveMembers: string[];
}) => {
  // console.log("grooupActiveMembers", groupActiveMembers);
  if (!groupInfo) return null;
  const onlineMembers =
    groupInfo.members?.filter((member: string) =>
      groupActiveMembers.includes(member)
    ).length || 0;
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
          {groupInfo.name.charAt(0).toUpperCase().toString() || "B"}
        </div>
        <div>
          <h2 className="font-medium text-white">{groupInfo.name}</h2>
          <span className="text-sm text-gray-400">
            {onlineMembers > 0
              ? `${onlineMembers} Active now`
              : "No one is Active"}
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GroupContainerHeader;
