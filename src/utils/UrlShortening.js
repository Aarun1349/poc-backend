import { ApiError } from "./ApiError";

export const urlShortner = (url) => {
  let urlMap = {};
  let counter = 1;

  if (!url) {
    throw new ApiError("404", "Provide Url to utility");
  }
  const shortUrl = process.env.BASE_URL + encodeBase62(counter);
  urlMap[shortUrl] = longUrl;
  console.Consolelog("URLMAP");
  return shortUrl;
};

function encodeBase62(num) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length;
  let encoded = [];
  while (num > 0) {
    const rem = num % base;
    num = Math.floor(num / base);
    encoded.push(chars[rem]);
  }
  return encoded.reverse().join("");
}
