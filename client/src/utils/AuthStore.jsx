let accessToken = null;

export const authStore = {
  getAccessToken() {
    return accessToken;
  },
  setAccessToken(token) {
    accessToken = token;
  },
  clear() {
    accessToken = null;
  }
};
