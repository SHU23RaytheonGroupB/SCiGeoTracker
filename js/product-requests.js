//JobyToDo - look into redis for caching product metadata on first call.

const HOSTNAME = "https://hallam.sci-toolset.com";
const API_ORIGIN = `${HOSTNAME}/discover/api`;


class ProductService {
  constructor(accessToken) {
    this.token = accessToken;
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      Accept: "*/*",
    };
  }

  //Functions------------------------------------------------------------------------------------------------------
  async getAllProducts() {
    const productIDs = await this.getAllProductIDs();
    let allProductMetaData = [];
    let results = await this.getProducts(productIDs);
    results.forEach((r) => allProductMetaData.push(r.product.result));
    return allProductMetaData;
  }

  async getAllProductIDs() {
    console.log("getAllproducts called");
    const data = await this.searchProducts();
    // Extract the product IDs from the search results
    return data.results.searchresults.map((item) => item.id);
  }

  async getProducts(productIDs) {
    try {
      const response = await fetch(
        `${API_ORIGIN}/v1/products/getProducts`, {
          method: "POST",
          body: JSON.stringify(productIDs),
          headers: this.headers,
        });
      if (!response.ok) {
        throw new Error("Could not fetch data");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async searchProducts(keywords = "", page_size = 150) {
    try {
      const response = await fetch(
        `${API_ORIGIN}/v1/products/search`, {
        method: "POST",
        body: JSON.stringify({
          keywords: keywords,
          size: page_size
        }),
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not fetch data");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async getProduct(productID) {
    try {
      const response = await fetch(
        `${API_ORIGIN}/v1/products/${productID}`, {
        method: "GET",
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not get product metadata");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = ProductService;
