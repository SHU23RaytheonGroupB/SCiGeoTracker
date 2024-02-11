//JobyToDo - Currently Headers & getToken specifics are tailored purely to SCI-discover API not generic grab token method
//JobyToDo - confirm implementation choice, all OOP as a tokenservice obj should have specific methods? how does this
//relate to sessionstorage as a potentially single list of variables, not variants that are tied to objects like properties
//JobyToDo  - secure storage needed for Uname,password,client credentials etc current setup is shoddy

export class TokenService {
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

  async getToken() {
    if (!TokenService.doesSessionExist()) {
      await this.generateAccessCredentials();
    } else if (!TokenService.isSessionValid()) {
      await this.refreshSession();
    }
    return sessionStorage.getItem("access_token");
  }

  async generateAccessCredentials() {
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: tokenExpiryTime,
    } = await this.getTokenData();

    const tokenExpiry = TokenService.convertExpiryTime(tokenExpiryTime);

    sessionStorage.setItem("access_token", accessToken);
    sessionStorage.setItem("refresh_token", refreshToken);
    sessionStorage.setItem("token_expiry", tokenExpiry);

    console.log(`refresh token is: ${sessionStorage.getItem("refresh_token")}`);
  }

  static isSessionValid() {
    const tokenExpiry = parseInt(sessionStorage.getItem("token_expiry"), 10);
    return tokenExpiry > Date.now();
  }

  static doesSessionExist() {
    return typeof sessionStorage.getItem("access_token") == "undefined";
  }

  static convertExpiryTime(tokenExpiryTime) {
    return Date.now() + tokenExpiryTime * 1000 - 10 * 1000; // converting to milliseconds and subtracting 10 seconds
  }

  async refreshSession() {
    const newTokenData = await this.refreshAccessToken(sessionStorage.getItem("refresh_token"));
    const { access_token: newAccessToken, expires_in: newTokenExpiryTime } = newTokenData;

    const newTokenExpiry = TokenService.convertExpiryTime(newTokenExpiryTime);

    sessionStorage.setItem("access_token", newAccessToken);
    sessionStorage.setItem("token_expiry", newTokenExpiry);
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await fetch(this.host + this.tokenPath, {
        method: "post",
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not fetch refresh token");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async getTokenData() {
    try {
      const response = await fetch(this.host + this.tokenPath, {
        method: "post",
        body: `grant_type=password&username=${this.username}&password=${encodeURIComponent(this.password)}`,
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not fetch access token");
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}
