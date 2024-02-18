//JobyToDo - look into redis for caching product metadata on first call.

const HOSTNAME = "https://hallam.sci-toolset.com";
const API_ORIGIN = `${HOSTNAME}/discover/api`;

const PAGINATION_ID = "";
const PRODUCT_ID = "";

const FILENAME = "";
const MIME_TYPE_OF_FILE = "";
const METADATA_JSON = "";

const initialSearchParams = '{"size":150, "keywords":""}';

class ProductService {
  constructor(accessToken) {
    this.token = accessToken;
  }

  //Functions------------------------------------------------------------------------------------------------------
  async getAllProducts() {
    const productIDs = await this.getAllProductIDs();

    let allProductMetaData = [];
    let results = await this.getAllProductsMetadata(productIDs);
    results.forEach((r) => allProductMetaData.push(r.product.result));
    return allProductMetaData;
  }

  async getAllProductIDs() {
    console.log("getAllproducts called");
    const data = await this.searchForProducts(initialSearchParams);
    // Extract the product IDs from the search results
    return data.results.searchresults.map((item) => item.id);
  }

  async getAllProductsMetadata(productIDs) {
    const idsJSONArray = JSON.stringify(productIDs);
    const url = `${API_ORIGIN}/v1/products/getProducts`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      Accept: "*/*",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        body: idsJSONArray,
        headers: headers,
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

  async searchForProducts(searchParams) {
    const url = `${API_ORIGIN}/v1/products/search`;
    const payload = searchParams;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      Accept: "*/*",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        body: payload,
        headers: headers,
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

  async getSingleProductMetadata(productID) {
    const url = `${API_ORIGIN}/v1/products/${productID}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      Accept: "*/*",
    };

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
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
