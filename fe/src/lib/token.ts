let accessToken: string | null = null;

// Lấy token
export const getAccessToken = (): string | null => {
  return accessToken;
};

// Set token
export const setAccessToken = (token: string) => {
  accessToken = token;
};

// Xoá token (logout)
export const clearAccessToken = () => {
  accessToken = null;
};

// Kiểm tra có token hay không
export const hasAccessToken = () => {
  return !!accessToken;
};