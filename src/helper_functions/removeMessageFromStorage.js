export default function removeMessageFromStorage(id) {
  const messages = JSON.parse(sessionStorage.getItem("messages"));

  const updatedMessages = messages.filter((message) => {
    return message._id !== id;
  });

  sessionStorage.setItem("messages", JSON.stringify(updatedMessages));
}
