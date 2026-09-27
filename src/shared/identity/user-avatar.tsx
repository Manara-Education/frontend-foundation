import { initialsOf } from "./initials";

interface UserAvatarProps {
  fullName?: string | null;
  avatarUrl?: string | null;
  size: number;
  fontSize?: number;
  ring?: string;
}

/**
 * The account's photo when it has one, its initials otherwise. Decorative: the name is always
 * written next to it, so it carries no alternative text of its own.
 */
export function UserAvatar({ fullName, avatarUrl, size, fontSize, ring }: UserAvatarProps) {
  return (
    <span
      aria-hidden
      className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #3A4880 0%, #6B7AB8 100%)",
        color: "#fff",
        fontWeight: 700,
        fontSize: fontSize ?? Math.round(size / 2.6),
        border: ring,
        boxShadow: "0 2px 10px rgba(78,91,146,0.22)",
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : (
        initialsOf(fullName)
      )}
    </span>
  );
}
