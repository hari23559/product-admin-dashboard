import api from "./axios";

export const getProducts = async (
  limit = 10,
  skip = 0,
  sortBy = "",
  order = "",
  signal
) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
      ...(sortBy && { sortBy }),
      ...(order && { order }),
    },
    signal,
  });

  return response.data;
};

export const searchProducts = async (
  query,
  limit = 10,
  skip = 0,
  sortBy = "",
  order = "",
  signal
) => {
  const response = await api.get("/products/search", {
    params: {
      q: query,
      limit,
      skip,
      ...(sortBy && { sortBy }),
      ...(order && { order }),
    },
    signal,
  });

  return response.data;
};

export const getCategories = async (signal) => {
  const response = await api.get("/products/categories", {
    signal,
  });

  return response.data;
};

export const getProductsByCategory = async (
  category,
  limit = 10,
  skip = 0,
  sortBy = "",
  order = "",
  signal
) => {
  const response = await api.get(
    `/products/category/${encodeURIComponent(category)}`,
    {
      params: {
        limit,
        skip,
        ...(sortBy && { sortBy }),
        ...(order && { order }),
      },
      signal,
    }
  );

  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(
    `/products/${id}`
  );

  return response.data;
};

export const addProduct = async (product) => {
  const response = await api.post(
    "/products/add",
    product
  );

  return response.data;
};

export const updateProduct = async (
  id,
  product
) => {
  const response = await api.put(
    `/products/${id}`,
    product
  );

  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(
    `/products/${id}`
  );

  return response.data;
};