const DELETED_PRODUCTS_KEY =
  "deletedProductIds";

const CREATED_PRODUCTS_KEY =
  "createdProducts";

const UPDATED_PRODUCTS_KEY =
  "updatedProducts";

// --------------------------------
// Deleted products
// --------------------------------

export const getDeletedProductIds = () => {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(
    DELETED_PRODUCTS_KEY
  );

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const addDeletedProductId = (
  id
) => {
  const deletedIds =
    getDeletedProductIds();

  const numericId = Number(id);

  if (!deletedIds.includes(numericId)) {
    deletedIds.push(numericId);
  }

  localStorage.setItem(
    DELETED_PRODUCTS_KEY,
    JSON.stringify(deletedIds)
  );
};

export const isProductDeleted = (
  id
) => {
  const deletedIds =
    getDeletedProductIds();

  return deletedIds.includes(
    Number(id)
  );
};

// --------------------------------
// Created products
// --------------------------------

export const getCreatedProducts = () => {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(
    CREATED_PRODUCTS_KEY
  );

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const addCreatedProduct = (
  product
) => {
  const products =
    getCreatedProducts();

  products.push(product);

  localStorage.setItem(
    CREATED_PRODUCTS_KEY,
    JSON.stringify(products)
  );
};

// --------------------------------
// Updated products
// --------------------------------

export const getUpdatedProducts = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = localStorage.getItem(
    UPDATED_PRODUCTS_KEY
  );

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

export const saveUpdatedProduct = (
  product
) => {
  const products =
    getUpdatedProducts();

  products[product.id] = product;

  localStorage.setItem(
    UPDATED_PRODUCTS_KEY,
    JSON.stringify(products)
  );
};

// --------------------------------
// Get locally modified product
// --------------------------------

export const getLocalProduct = (
  product
) => {
  const updatedProducts =
    getUpdatedProducts();

  const updatedProduct =
    updatedProducts[product.id];

  if (updatedProduct) {
    return {
      ...product,
      ...updatedProduct,
    };
  }

  return product;
};