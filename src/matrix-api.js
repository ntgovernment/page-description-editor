window.PageDescriptionEditorApi = (() => {
  const matrixApiOptions = {
    key: "9772315187",
  };
  const mockValues = new Map();
  let matrixApiClient;

  function hasMatrixApiConstructor() {
    return typeof window.Squiz_Matrix_API !== "undefined";
  }

  function mockSave(assetId, field, value) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        mockValues.set(`${assetId}:${field}`, value);
        resolve(value);
      }, 250);
    });
  }

  function getMatrixApi() {
    if (matrixApiClient) {
      return matrixApiClient;
    }

    if (!hasMatrixApiConstructor()) {
      return null;
    }

    matrixApiClient = new window.Squiz_Matrix_API(matrixApiOptions);
    return matrixApiClient;
  }

  function callMatrix(method, options) {
    const api = getMatrixApi();
    if (!api || typeof api[method] !== "function") {
      return Promise.reject(new Error(`Squiz Matrix API method ${method} is unavailable.`));
    }

    return new Promise((resolve, reject) => {
      api[method]({
        ...options,
        dataCallback: resolve,
        errorCallback: () => reject(new Error("Squiz Matrix did not save this change.")),
      });
    });
  }

  function isLocalDevelopment() {
    return !hasMatrixApiConstructor();
  }

  function updateStatus(assetId, status) {
    if (isLocalDevelopment()) {
      return mockSave(assetId, "status", status);
    }

    return callMatrix("setAssetStatus", { asset_id: assetId, status, cascade: false });
  }

  function updateName(assetId, name) {
    if (isLocalDevelopment()) {
      return mockSave(assetId, "name", name);
    }

    return callMatrix("setAttribute", {
      asset_id: assetId,
      attr_name: "name",
      attr_val: name,
    });
  }

  function getWebPath(assetId, fallbackPath) {
    if (isLocalDevelopment()) {
      return Promise.resolve(mockValues.get(`${assetId}:web-path`) || fallbackPath);
    }

    return callMatrix("getWebPath", { asset_id: assetId });
  }

  function updateWebPath(assetId, webPath) {
    if (isLocalDevelopment()) {
      return mockSave(assetId, "web-path", webPath);
    }

    return Promise.reject(
      new Error(
        "Web-path saving is disabled until the Matrix DEV getWebPath and setWebPath payload contract is confirmed. This prevents alternate URLs from being removed.",
      ),
    );
  }

  function updateMetadata(assetId, fieldId, value) {
    if (isLocalDevelopment()) {
      return mockSave(assetId, `metadata:${fieldId}`, value);
    }

    return callMatrix("setMetadata", {
      asset_id: assetId,
      field_id: fieldId,
      field_val: value,
    });
  }

  return {
    getWebPath,
    isLocalDevelopment,
    updateMetadata,
    updateName,
    updateStatus,
    updateWebPath,
  };
})();