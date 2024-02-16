//JobyToDo - look into redis for caching product metadata on first call.

const HOSTNAME = "https://hallam.sci-toolset.com/";
const PRODUCT_SEARCH_PATH = "discover/api/v1/products/search";
const PRODUCT_PATH = "discover/api/v1/products/";
const GET_PRODUCTS_PATH = "discover/api/v1/products/getProducts";

const PAGINATION_ID = "";
const PRODUCT_ID = "";

const FILENAME = "";
const MIME_TYPE_OF_FILE = "";
const METADATA_JSON = "";

const initialSearchParams = '{"size":150, "keywords":""}';

class ProductService {
  constructor() {
    this.token = null;
  }
  //Functions------------------------------------------------------------------------------------------------------
  async getProducts(accessToken) {
    this.token = accessToken;
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

    const url = `${HOSTNAME}${GET_PRODUCTS_PATH}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      Accept: "*/*",
      Host: HOSTNAME,
    };

    try {
      const response = await fetch(url, {
        method: "post",
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
    const url = `${HOSTNAME}${PRODUCT_SEARCH_PATH}`;

    const payload = searchParams;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      Accept: "*/*",
      Host: HOSTNAME,
    };

    try {
      const response = await fetch(url, {
        method: "post",
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

  async getSingleProductMetadata(PRODUCT_ID) {
    const url = `${HOSTNAME}${PRODUCT_PATH}${PRODUCT_ID}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      Accept: "*/*",
      Host: HOSTNAME,
    };

    try {
      const response = await fetch(url, {
        method: "get",
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
