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

  async getAllProducts() {
    const productIDs = await this.getAllProductIDs();
    let results = await this.getProducts(productIDs);
    return results.map((r) => r.product.result);
  }

  async getAllProductIDs() {
    const data = await this.searchProducts();
    // Extract the product IDs from the search results
    return data.results.searchresults.map((item) => item.id);
  }

  async searchProducts(keywords = "", page_size = 150) {
    try {
      const response = await fetch(`${API_ORIGIN}/v1/products/search`, {
        method: "POST",
        body: JSON.stringify({
          keywords: keywords,
          size: page_size,
        }),
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Error searching products");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async getProducts(productIDs) {
    try {
      const response = await fetch(`${API_ORIGIN}/v1/products/getProducts`, {
        method: "POST",
        body: JSON.stringify(productIDs),
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Error fetching products metadata");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async getProduct(productID) {
    try {
      const response = await fetch(`${API_ORIGIN}/v1/products/${productID}`, {
        method: "GET",
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Error fetching product metadata");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = ProductService;
