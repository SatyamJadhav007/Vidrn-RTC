/**
 * Converts a profile picture number to the corresponding image URL path.
 * @param {number} profilePicNum - The profile picture number (1-8)
 * @returns {string} The URL path to the profile picture image
 */
export const getProfilePicUrl = (profilePicNum) => {
  const num = profilePicNum || 1;
  return `/${num}.png`;
};
