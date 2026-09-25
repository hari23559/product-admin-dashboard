"use client";

import { useEffect, useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  getProductById,
  deleteProduct,
} from "../../../lib/productApi";

import {
  addDeletedProductId,
  isProductDeleted,
  getLocalProduct,
} from "../../../lib/productStorage";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------
  // Load product
  // --------------------------------

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!params.id) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        // Check locally deleted product
        if (
          isProductDeleted(params.id)
        ) {
          setError(
            "Product not found."
          );
          return;
        }

        // Get product from API
        const data =
          await getProductById(
            params.id
          );

        // Apply local edits
        const localProduct =
          getLocalProduct(data);

        setProduct(localProduct);
      } catch (error) {
        console.error(
          "Failed to load product:",
          error
        );

        setError(
          "Product not found."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id, router]);

  // --------------------------------
  // Delete product
  // --------------------------------

  const handleDelete = async () => {
    if (deleting) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      // Delete from DummyJSON
      await deleteProduct(
        product.id
      );

      // Also remember locally
      addDeletedProductId(
        product.id
      );

      alert(
        "Product deleted successfully!"
      );

      router.push("/products");
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );

      setError(
        "Failed to delete product. Please try again."
      );

      setDeleting(false);
    }
  };

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>
          Loading product...
        </p>
      </main>
    );
  }

  // --------------------------------
  // Not found
  // --------------------------------

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

        <div className="rounded-lg bg-white p-8 text-center shadow">

          <h1 className="mb-4 text-2xl font-bold">
            Product Not Found
          </h1>

          <p className="mb-6 text-gray-600">
            The product you are looking
            for does not exist.
          </p>

          <button
            onClick={() =>
              router.push(
                "/products"
              )
            }
            className="rounded bg-black px-4 py-2 text-white"
          >
            Back to Products
          </button>

        </div>

      </main>
    );
  }

  // --------------------------------
  // Product details
  // --------------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-5xl">

        {/* Buttons */}

        <div className="mb-6 flex flex-wrap gap-3">

          <button
            onClick={() =>
              router.push(
                "/products"
              )
            }
            className="rounded border bg-white px-4 py-2"
          >
            ← Back to Products
          </button>

          <button
            onClick={() =>
              router.push(
                `/products/${product.id}/edit`
              )
            }
            className="rounded bg-black px-4 py-2 text-white"
          >
            Edit Product
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete Product"}
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Product */}

        <div className="rounded-lg bg-white p-6 shadow">

          <div className="grid gap-8 md:grid-cols-2">

            {/* Images */}

            <div>

              <img
                src={
                  product.thumbnail
                }
                alt={
                  product.title
                }
                className="mb-4 h-80 w-full rounded-lg object-contain"
              />

              <div className="flex gap-3 overflow-x-auto">

                {product.images?.map(
                  (image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.title} ${
                        index + 1
                      }`}
                      className="h-20 w-20 rounded border object-cover"
                    />
                  )
                )}

              </div>

            </div>

            {/* Information */}

            <div>

              <h1 className="mb-4 text-3xl font-bold">
                {product.title}
              </h1>

              <p className="mb-4 text-gray-600">
                {
                  product.description
                }
              </p>

              <p className="mb-4 text-2xl font-bold">
                ${product.price}
              </p>

              <p className="mb-2">
                <strong>
                  Category:
                </strong>{" "}
                {
                  product.category
                }
              </p>

              <p className="mb-2">
                <strong>
                  Brand:
                </strong>{" "}
                {
                  product.brand ||
                  "N/A"
                }
              </p>

              <p className="mb-2">
                <strong>
                  Rating:
                </strong>{" "}
                {
                  product.rating ??
                  "N/A"
                }
              </p>

              <p className="mb-2">
                <strong>
                  Stock:
                </strong>{" "}
                {
                  product.stock
                }
              </p>

              <p className="mb-6">
                <strong>
                  SKU:
                </strong>{" "}
                {
                  product.sku ||
                  "N/A"
                }
              </p>

              {/* Reviews */}

              <h2 className="mb-4 text-xl font-bold">
                Reviews
              </h2>

              {product.reviews &&
              product.reviews.length >
                0 ? (
                <div className="space-y-4">

                  {product.reviews.map(
                    (
                      review,
                      index
                    ) => (
                      <div
                        key={index}
                        className="rounded border p-4"
                      >

                        <p className="font-medium">
                          {
                            review.reviewerName
                          }
                        </p>

                        <p className="mb-2 text-sm">
                          Rating:{" "}
                          {
                            review.rating
                          }
                          /5
                        </p>

                        <p className="text-gray-600">
                          {
                            review.comment
                          }
                        </p>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="text-gray-500">
                  No reviews available.
                </p>
              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}