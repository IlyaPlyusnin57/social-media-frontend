export default function removeMessageFromStorage(id) {
  const messages = JSON.parse(sessionStorage.getItem("messages"));

  if (!messages) return;

  const updatedMessages = messages.filter((message) => {
    return message._id !== id;
  });

  sessionStorage.setItem("messages", JSON.stringify(updatedMessages));
}
