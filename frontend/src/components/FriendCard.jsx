import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { useAuthStore } from "../store/useAuthStore";
import { getProfilePicUrl } from "../lib/profilePic";

const FriendCard = ({ friend }) => {
  //Display the online status of the friend if he is online or offline(It happens by checking if the user is present in the socket map or not on the server side)
  const { isUserOnline } = useAuthStore();
  const isOnline = isUserOnline(friend._id);

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="avatar size-12">
              <img
                src={getProfilePicUrl(friend.profilePic)}
                alt={friend.fullName}
              />
            </div>
            {/* Online indicator */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success border-2 border-base-200" />
            )}
          </div>
          <div>
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            <p
              className={`text-xs ${isOnline ? "text-success" : "text-base-content/50"}`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
