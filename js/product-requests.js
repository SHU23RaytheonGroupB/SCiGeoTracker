//JobyToDo - look into redis for caching product metadata on first call.

const HOSTNAME = "https://hallam.sci-toolset.com";
const API_ORIGIN = `${HOSTNAME}/discover/api`;

const PAGINATION_ID = "";
const PRODUCT_ID = "";

const FILENAME = "";
const MIME_TYPE_OF_FILE = "";
const METADATA_JSON = "";

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
    const idsJSONArray = JSON.stringify(productIDs);
    const url = `${API_ORIGIN}/v1/products/getProducts`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: idsJSONArray,
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not fetch data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async searchProducts(keywords = "", page_size = 150) {
    const url = `${API_ORIGIN}/v1/products/search`;
    const payload = {
      keywords: keywords,
      size: page_size
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not fetch data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async getProduct(productID) {
    const url = `${API_ORIGIN}/v1/products/${productID}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Could not get product metadata");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = ProductService;
