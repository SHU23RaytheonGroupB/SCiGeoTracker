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

  async searchProducts(keywords = "scene", page_size = 150) {
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

  async getAllFrameProductIDs(missionID) {
    let result = [];
    const selectedMissionInfo = await this.getMissionInfo(missionID);
    const { scenes } = selectedMissionInfo;
    for (let scene of scenes) {
      result.push(await this.getFrameData(missionID, scene.id));
    }

    return result.flatMap((r) =>
      r.scenes.flatMap((scene) => scene.bands.flatMap((band) => band.frames.map((frame) => frame.productId)))
    );
  }

  async getAllFrameProducts(missionID) {
    const frameIDs = await this.getAllFrameProductIDs(missionID);
    let results = [];
    results = await this.getProducts(frameIDs);
    return results.map((r) => r.product.result);
  }

  async getFrameData(missionId, sceneId) {
    try {
      const response = await fetch(`${API_ORIGIN}/v1/missionfeed/missions/${missionId}/scene/${sceneId}/frames`, {
        method: "GET",
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Error fetching scene frames");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async getMissionInfo(missionID) {
    try {
      const response = await fetch(`${API_ORIGIN}/v1/missionfeed/missions/${missionID}`, {
        method: "GET",
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Error fetching mission info");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }
  async getMissionFootprint(missionID) {
    try {
      const response = await fetch(`${API_ORIGIN}/v1/missionfeed/missions/${missionID}/footprint`, {
        method: "GET",
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error("Error fetching mission footprint");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = ProductService;
