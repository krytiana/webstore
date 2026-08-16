import ImageKit from "imagekit";
let client: ImageKit | null = null;
export const getImageKit = () => {
  if (client) return client;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) throw new Error("ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.");
  client = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return client;
};
