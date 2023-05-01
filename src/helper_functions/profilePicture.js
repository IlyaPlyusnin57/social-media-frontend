export default function profilePicture(user) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const profile_picture = user?.profilePicture
    ? user?.profilePicture
    : PF + "img/no-avatar.jpg";
  return profile_picture;
}
