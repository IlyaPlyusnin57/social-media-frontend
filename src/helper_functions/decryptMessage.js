import CryptoJS from "crypto-js";

export default function decryptMessage(message) {
  return CryptoJS.AES.decrypt(
    message,
    process.env.REACT_APP_MESSAGE_SECRET
  ).toString(CryptoJS.enc.Utf8);
}
