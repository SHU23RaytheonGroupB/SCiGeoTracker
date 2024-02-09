import { TokenService } from "./token-service.js";

const HOSTNAME = "https://hallam.sci-toolset.com/";
const TOKEN_PATH = "api/v1/token";
const PRODUCT_SEARCH_PATH = "discover/api/v1/products/search";
const PRODUCT_PATH = "discover/api/v1/products/";
const GET_PRODUCTS_PATH = "discover/api/v1/products/getProducts";
const USERNAME = "hallam1";
const PASSWORD = "!H%j50H2";
const CLIENT_ID = "sci-toolset";
const CLIENT_SECRET = "st";

const PAGINATION_ID = "";
const PRODUCT_ID = "";

const FILENAME = "";
const MIME_TYPE_OF_FILE = "";
const METADATA_JSON = "";

const tokenService = new TokenService(HOSTNAME, TOKEN_PATH, USERNAME, PASSWORD, CLIENT_ID, CLIENT_SECRET);

const initialSearchParams = '{"size":1, "keywords":""}';

//Functions------------------------------------------------------------------------------------------------------

const productIDs = await getAllProductIDs();

let allProductMetaData = [];
for (let i = 0; i < productIDs.length; i += 50) {
  allProductMetaData.push(await getAllProductsMetadata(productIDs.slice(i, i + 50)));
}

console.log("PMD:");
console.log(allProductMetaData);

async function getAllProductIDs() {
  const initialQuery = await searchForProducts(initialSearchParams);
  const data = await searchForProducts(`{"size":${initialQuery.totalHits}, "keywords":""}`);
  // Extract the product IDs from the search results
  return data.results.searchresults.map((item) => item.id);
}

async function getAllProductsMetadata(productIDs) {
  const accessToken = await tokenService.getToken();
  const idsJSONArray = JSON.stringify(productIDs);

  const url = `${HOSTNAME}${GET_PRODUCTS_PATH}`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
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
    console.log("searched products data: ");
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function searchForProducts(searchParams) {
  const accessToken = await tokenService.getToken();

  const url = `${HOSTNAME}${PRODUCT_SEARCH_PATH}`;

  const payload = searchParams;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
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
    console.log("searched products data: ");
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function getProductMetadata(PRODUCT_ID) {
  const accessToken = await tokenService.getToken();

  const url = `${HOSTNAME}${PRODUCT_PATH}${PRODUCT_ID}`;

  const payload = searchParams;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
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
    console.log("metadata for product ID blah: ");
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}
