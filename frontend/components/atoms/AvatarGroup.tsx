type User = {
  id: string;
  username: string;
  avatarUrl: string;
  onClick: () => void;
}

type AvatarGroupProps = {
  users: User[];
  maxDisplay?: number;
}

const AvatarGroup = ({users, maxDisplay = 3}: AvatarGroupProps) => {
  if (users.length === 0) {
    return null;
  }

  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;
  const allUsernames = users.map(u => u.username).join("\n");

  return (
    <div className="avatar-group -space-x-3 rtl:space-x-reverse" title={allUsernames}>
      {displayUsers.map((user) => (
        <div key={user.id} className="avatar" title={user.username}>
          <div className="w-6 h-6 rounded-full ring ring-base-100">
            <img src={user.avatarUrl} alt={user.username} onClick={user.onClick} className={"hover:cursor-pointer"}/>
          </div>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="avatar placeholder" title={allUsernames}>
          <div className="w-6 h-6 bg-neutral text-neutral-content rounded-full ring ring-base-100">
            <span className="text-xs">+{remainingCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
