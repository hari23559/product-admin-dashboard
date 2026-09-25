"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
} from "../../lib/productApi";

import { useDebounce } from "../../hooks/useDebounce";

import {
  getDeletedProductIds,
  getCreatedProducts,
  getUpdatedProducts,
} from "../../lib/productStorage";

const PAGE_SIZES = [10, 20, 50];

const SORT_OPTIONS = [
  {
    value: "",
    label: "Default",
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
  },
  {
    value: "rating-desc",
    label: "Rating: High to Low",
  },
  {
    value: "rating-asc",
    label: "Rating: Low to High",
  },
  {
    value: "title-asc",
    label: "Title: A to Z",
  },
  {
    value: "title-desc",
    label: "Title: Z to A",
  },
];

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --------------------------------
  // URL parameters
  // --------------------------------

  const urlSearch =
    searchParams.get("search") || "";

  const urlCategory =
    searchParams.get("category") || "";

  const urlSort =
    searchParams.get("sort") || "";

  const urlPage =
    Number(searchParams.get("page")) || 1;

  const urlPageSize =
    Number(searchParams.get("pageSize")) || 10;

  // --------------------------------
  // State
  // --------------------------------

  const [authorized, setAuthorized] =
    useState(false);

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [searchInput, setSearchInput] =
    useState(urlSearch);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(urlPage);

  const [pageSize, setPageSize] =
    useState(
      PAGE_SIZES.includes(urlPageSize)
        ? urlPageSize
        : 10
    );

  const [category, setCategory] =
    useState(urlCategory);

  const [sort, setSort] =
    useState(urlSort);

  const [total, setTotal] =
    useState(0);

  const [retryCount, setRetryCount] =
    useState(0);

  // --------------------------------
  // Debounced search
  // --------------------------------

  const debouncedSearch =
    useDebounce(searchInput, 500);

  // --------------------------------
  // Authentication
  // --------------------------------

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
  }, [router]);

  // --------------------------------
  // Keep state synced with URL
  // --------------------------------

  useEffect(() => {
    setSearchInput(urlSearch);
    setCategory(urlCategory);
    setSort(urlSort);

    setPage(
      urlPage > 0 ? urlPage : 1
    );

    setPageSize(
      PAGE_SIZES.includes(urlPageSize)
        ? urlPageSize
        : 10
    );
  }, [
    urlSearch,
    urlCategory,
    urlSort,
    urlPage,
    urlPageSize,
  ]);

  // --------------------------------
  // Load categories
  // --------------------------------

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const controller =
      new AbortController();

    const loadCategories =
      async () => {
        try {
          const data =
            await getCategories(
              controller.signal
            );

          setCategories(data);
        } catch (error) {
          if (
            error.name ===
              "CanceledError" ||
            error.code ===
              "ERR_CANCELED"
          ) {
            return;
          }

          console.error(
            "Failed to load categories:",
            error
          );
        }
      };

    loadCategories();

    return () => {
      controller.abort();
    };
  }, [authorized]);

  // --------------------------------
  // Update URL
  // --------------------------------

  const updateUrl = (
    values = {}
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (
      values.search !== undefined
    ) {
      if (values.search) {
        params.set(
          "search",
          values.search
        );
      } else {
        params.delete("search");
      }
    }

    if (
      values.category !== undefined
    ) {
      if (values.category) {
        params.set(
          "category",
          values.category
        );
      } else {
        params.delete("category");
      }
    }

    if (
      values.sort !== undefined
    ) {
      if (values.sort) {
        params.set(
          "sort",
          values.sort
        );
      } else {
        params.delete("sort");
      }
    }

    if (
      values.page !== undefined
    ) {
      params.set(
        "page",
        String(values.page)
      );
    }

    if (
      values.pageSize !== undefined
    ) {
      params.set(
        "pageSize",
        String(values.pageSize)
      );
    }

    router.push(
      `/products?${params.toString()}`
    );
  };

  // --------------------------------
  // Search changes
  // --------------------------------

  useEffect(() => {
    if (!authorized) {
      return;
    }

    if (
      debouncedSearch === urlSearch
    ) {
      return;
    }

    updateUrl({
      search: debouncedSearch,
      page: 1,
    });
  }, [
    debouncedSearch,
    authorized,
  ]);

  // --------------------------------
  // Load products
  // --------------------------------

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const controller =
      new AbortController();

    const loadProducts =
      async () => {
        try {
          setLoading(true);
          setError("");

          const skip =
            (page - 1) * pageSize;

          let data;

          // Search
          if (debouncedSearch) {
            data =
              await searchProducts(
                debouncedSearch,
                pageSize,
                skip,
                "",
                "",
                controller.signal
              );
          }

          // Category
          else if (category) {
            data =
              await getProductsByCategory(
                category,
                pageSize,
                skip,
                "",
                "",
                controller.signal
              );
          }

          // Normal products
          else {
            data =
              await getProducts(
                pageSize,
                skip,
                "",
                "",
                controller.signal
              );
          }

          if (controller.signal.aborted) {
            return;
          }

          let fetchedProducts =
            data.products || [];

          // --------------------------------
          // Local updated products
          // --------------------------------

          const updatedProducts =
            getUpdatedProducts();

          fetchedProducts =
            fetchedProducts.map(
              (product) => {
                const updated =
                  updatedProducts[
                    product.id
                  ];

                if (updated) {
                  return {
                    ...product,
                    ...updated,
                  };
                }

                return product;
              }
            );

          // --------------------------------
          // Remove locally deleted products
          // --------------------------------

          const deletedIds =
            getDeletedProductIds();

          fetchedProducts =
            fetchedProducts.filter(
              (product) =>
                !deletedIds.includes(
                  Number(product.id)
                )
            );

          // --------------------------------
          // Created products
          // --------------------------------

          const createdProducts =
            getCreatedProducts();

          let visibleCreatedProducts =
            createdProducts;

          // Search created products
          if (debouncedSearch) {
            visibleCreatedProducts =
              visibleCreatedProducts.filter(
                (product) =>
                  product.title
                    ?.toLowerCase()
                    .includes(
                      debouncedSearch.toLowerCase()
                    )
              );
          }

          // Category created products
          if (category) {
            visibleCreatedProducts =
              visibleCreatedProducts.filter(
                (product) =>
                  product.category ===
                  category
              );
          }

          // Remove deleted created products
          visibleCreatedProducts =
            visibleCreatedProducts.filter(
              (product) =>
                !deletedIds.includes(
                  Number(product.id)
                )
            );

          // --------------------------------
          // Combine products
          // --------------------------------

          let combinedProducts = [
            ...visibleCreatedProducts,
            ...fetchedProducts,
          ];

          // --------------------------------
          // Remove duplicate IDs
          // --------------------------------

          const productMap =
            new Map();

          combinedProducts.forEach(
            (product) => {
              productMap.set(
                product.id,
                product
              );
            }
          );

          combinedProducts =
            Array.from(
              productMap.values()
            );

          // --------------------------------
          // Local sorting
          // --------------------------------

          if (sort) {
            const [
              sortBy,
              order,
            ] = sort.split("-");

            combinedProducts.sort(
              (a, b) => {
                let first =
                  a[sortBy];

                let second =
                  b[sortBy];

                if (
                  sortBy ===
                  "title"
                ) {
                  first =
                    String(
                      first || ""
                    ).toLowerCase();

                  second =
                    String(
                      second || ""
                    ).toLowerCase();

                  if (
                    first <
                    second
                  ) {
                    return order ===
                      "asc"
                      ? -1
                      : 1;
                  }

                  if (
                    first >
                    second
                  ) {
                    return order ===
                      "asc"
                      ? 1
                      : -1;
                  }

                  return 0;
                }

                first =
                  Number(
                    first || 0
                  );

                second =
                  Number(
                    second || 0
                  );

                return order ===
                  "asc"
                  ? first - second
                  : second - first;
              }
            );
          }

          setProducts(
            combinedProducts
          );

          // --------------------------------
          // Total count
          // --------------------------------

          let calculatedTotal =
            data.total || 0;

          calculatedTotal =
            calculatedTotal -
            deletedIds.filter(
              (id) =>
                fetchedProducts.some(
                  (product) =>
                    product.id === id
                )
            ).length;

          calculatedTotal +=
            visibleCreatedProducts.length;

          setTotal(
            Math.max(
              calculatedTotal,
              combinedProducts.length
            )
          );
        } catch (error) {
          if (
            error.name ===
              "CanceledError" ||
            error.code ===
              "ERR_CANCELED"
          ) {
            return;
          }

          console.error(
            "Failed to load products:",
            error
          );

          setError(
            "Failed to load products. Please try again."
          );
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setLoading(false);
          }
        }
      };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [
    authorized,
    page,
    pageSize,
    debouncedSearch,
    category,
    sort,
    retryCount,
  ]);

  // --------------------------------
  // Handlers
  // --------------------------------

  const handleCategoryChange = (
    event
  ) => {
    const value =
      event.target.value;

    setCategory(value);

    updateUrl({
      category: value,
      page: 1,
    });
  };

  const handleSortChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSort(value);

    updateUrl({
      sort: value,
      page: 1,
    });
  };

  const handlePageSizeChange = (
    event
  ) => {
    const value =
      Number(event.target.value);

    setPageSize(value);

    updateUrl({
      pageSize: value,
      page: 1,
    });
  };

  const handlePageChange = (
    newPage
  ) => {
    if (newPage < 1) {
      return;
    }

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total / pageSize
        )
      );

    if (
      newPage > totalPages
    ) {
      return;
    }

    setPage(newPage);

    updateUrl({
      page: newPage,
    });
  };

  const handleRetry = () => {
    setRetryCount(
      (previous) =>
        previous + 1
    );
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    router.push("/login");
  };

  // --------------------------------
  // Pagination values
  // --------------------------------

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / pageSize
      )
    );

  const startItem =
    total === 0
      ? 0
      : (page - 1) *
          pageSize +
        1;

  const endItem =
    Math.min(
      page * pageSize,
      total
    );

  // --------------------------------
  // Authorization loading
  // --------------------------------

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>
          Checking authentication...
        </p>
      </main>
    );
  }

  // --------------------------------
  // Main UI
  // --------------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Product Admin Dashboard
            </h1>

            <p className="mt-1 text-gray-600">
              Manage your products
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() =>
                router.push(
                  "/products/add"
                )
              }
              className="rounded bg-black px-4 py-2 text-white"
            >
              + Add Product
            </button>

            <button
              onClick={handleLogout}
              className="rounded border bg-white px-4 py-2"
            >
              Logout
            </button>

          </div>

        </div>

        {/* Filters */}

        <div className="mb-6 rounded-lg bg-white p-4 shadow">

          <div className="grid gap-4 md:grid-cols-4">

            {/* Search */}

            <div className="md:col-span-2">

              <label className="mb-1 block text-sm font-medium">
                Search
              </label>

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full rounded border p-2"
              />

            </div>

            {/* Category */}

            <div>

              <label className="mb-1 block text-sm font-medium">
                Category
              </label>

              <select
                value={category}
                onChange={
                  handleCategoryChange
                }
                className="w-full rounded border p-2"
              >
                <option value="">
                  All Categories
                </option>

                {categories.map(
                  (item) => {
                    const categoryValue =
                      typeof item ===
                      "string"
                        ? item
                        : item.slug;

                    const categoryName =
                      typeof item ===
                      "string"
                        ? item
                        : item.name ||
                          item.slug;

                    return (
                      <option
                        key={
                          categoryValue
                        }
                        value={
                          categoryValue
                        }
                      >
                        {categoryName}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

            {/* Sort */}

            <div>

              <label className="mb-1 block text-sm font-medium">
                Sort
              </label>

              <select
                value={sort}
                onChange={
                  handleSortChange
                }
                className="w-full rounded border p-2"
              >

                {SORT_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* Page size */}

          <div className="mt-4 flex flex-wrap items-center gap-3">

            <label className="text-sm font-medium">
              Products per page:
            </label>

            <select
              value={pageSize}
              onChange={
                handlePageSizeChange
              }
              className="rounded border p-2"
            >

              {PAGE_SIZES.map(
                (size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4">

            <p className="mb-3 text-red-700">
              {error}
            </p>

            <button
              onClick={
                handleRetry
              }
              className="rounded bg-red-600 px-4 py-2 text-white"
            >
              Retry
            </button>

          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="rounded-lg bg-white p-10 text-center shadow">
            <p className="text-gray-600">
              Loading products...
            </p>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          products.length ===
            0 && (
            <div className="rounded-lg bg-white p-10 text-center shadow">

              <h2 className="mb-2 text-xl font-semibold">
                No products found
              </h2>

              <p className="text-gray-500">
                Try changing your search
                or filter.
              </p>

            </div>
          )}

        {/* Desktop table */}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div className="hidden overflow-hidden rounded-lg bg-white shadow md:block">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-100">

                    <tr>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Image
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Title
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Category
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Price
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Rating
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Stock
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {products.map(
                      (product) => (
                        <tr
                          key={
                            product.id
                          }
                          className="border-t"
                        >

                          <td className="px-4 py-3">

                            <img
                              src={
                                product.thumbnail
                              }
                              alt={
                                product.title
                              }
                              className="h-16 w-16 rounded object-cover"
                            />

                          </td>

                          <td className="px-4 py-3 font-medium">
                            {
                              product.title
                            }
                          </td>

                          <td className="px-4 py-3">
                            {
                              product.category
                            }
                          </td>

                          <td className="px-4 py-3">
                            $
                            {
                              product.price
                            }
                          </td>

                          <td className="px-4 py-3">
                            {
                              product.rating ??
                              "N/A"
                            }
                          </td>

                          <td className="px-4 py-3">
                            {
                              product.stock
                            }
                          </td>

                          <td className="px-4 py-3">

                            <button
                              onClick={() =>
                                router.push(
                                  `/products/${product.id}`
                                )
                              }
                              className="rounded bg-black px-3 py-2 text-sm text-white"
                            >
                              View
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        {/* Mobile cards */}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div className="space-y-4 md:hidden">

              {products.map(
                (product) => (
                  <div
                    key={
                      product.id
                    }
                    className="rounded-lg bg-white p-4 shadow"
                  >

                    <div className="flex gap-4">

                      <img
                        src={
                          product.thumbnail
                        }
                        alt={
                          product.title
                        }
                        className="h-24 w-24 rounded object-cover"
                      />

                      <div className="min-w-0 flex-1">

                        <h2 className="font-semibold">
                          {
                            product.title
                          }
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            product.category
                          }
                        </p>

                        <p className="mt-2 font-semibold">
                          $
                          {
                            product.price
                          }
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">

                      <div className="rounded bg-gray-100 p-2">
                        <span className="font-medium">
                          Rating:
                        </span>{" "}
                        {
                          product.rating ??
                          "N/A"
                        }
                      </div>

                      <div className="rounded bg-gray-100 p-2">
                        <span className="font-medium">
                          Stock:
                        </span>{" "}
                        {
                          product.stock
                        }
                      </div>

                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/products/${product.id}`
                        )
                      }
                      className="mt-4 w-full rounded bg-black px-4 py-2 text-white"
                    >
                      View Product
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        {/* Pagination */}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div className="mt-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-gray-600">
                Showing{" "}
                <strong>
                  {startItem}
                </strong>{" "}
                –{" "}
                <strong>
                  {endItem}
                </strong>{" "}
                of{" "}
                <strong>
                  {total}
                </strong>
              </p>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    handlePageChange(
                      page - 1
                    )
                  }
                  disabled={
                    page === 1
                  }
                  className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="px-3 py-2 text-sm">
                  Page {page} of{" "}
                  {totalPages}
                </span>

                <button
                  onClick={() =>
                    handlePageChange(
                      page + 1
                    )
                  }
                  disabled={
                    page >=
                    totalPages
                  }
                  className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>

              </div>

            </div>
          )}

      </div>

    </main>
  );
}