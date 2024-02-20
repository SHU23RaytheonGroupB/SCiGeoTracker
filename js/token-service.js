//JobyToDo  - secure storage needed for Uname,password,client credentials etc current setup is shoddy

class TokenService {
  constructor(host, tokenPath, username, password, clientID, clientSecret) {
    this.host = host;
    this.tokenPath = tokenPath;
    this.username = username;
    this.password = password;
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      // Basic Authentication: base64 encode client_id and client_secret
      Authorization: "Basic " + btoa(this.clientID + ":" + this.clientSecret),
      Accept: "*/*",
      Host: this.host,
    };
  }

  static isSessionValid(token) {
    const tokenExpiry = parseInt(token.expires_in, 10);
    return tokenExpiry > Date.now();
  }

  static convertExpiryTime(token) {
    return Date.now() + token.expires_in * 1000 - 10 * 1000; // converting to milliseconds and subtracting 10 seconds
  }

  async refreshAccessToken(token) {
    try {
      const response = await fetch(this.host + this.tokenPath, {
        method: "post",
        body: `grant_type=refresh_token&refresh_token=${token.refresh_token}`,
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not fetch refresh token");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async generateToken() {
    try {
      const response = await fetch(this.host + this.tokenPath, {
        method: "post",
        body: `grant_type=password&username=${this.username}&password=${encodeURIComponent(this.password)}`,
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not fetch access token");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = TokenService;
