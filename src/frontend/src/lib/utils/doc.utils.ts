function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function generateUniqueDocID() {
  const timestamp = Date.now().toString(36); // Convert current timestamp to a base36 string
  const randomString = generateRandomString(10); // You can change the length as needed
  const uniqueID = timestamp + randomString;

  return uniqueID;
}