"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import ProductForm from "../../../../components/ProductForm";

import {
  getProductById,
  updateProduct,
} from "../../../../lib/productApi";

import {
  getLocalProduct,
  saveUpdatedProduct,
  isProductDeleted,
} from "../../../../lib/productStorage";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [authorized, setAuthorized] =
    useState(false);

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // --------------------------------
  // Check authentication
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
  // Load product
  // --------------------------------

  useEffect(() => {
    if (!authorized || !params.id) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        // Check if product was deleted locally
        if (
          isProductDeleted(params.id)
        ) {
          setError(
            "Product not found."
          );
          return;
        }

        const data =
          await getProductById(
            params.id
          );

        // Apply locally saved edits
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
  }, [authorized, params.id]);

  // --------------------------------
  // Save product
  // --------------------------------

  const handleSubmit = async (
    updatedProduct
  ) => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Send update to DummyJSON
      const data =
        await updateProduct(
          params.id,
          updatedProduct
        );

      /*
        DummyJSON simulates updates.

        Therefore we also save the
        updated product locally.
      */

      const productToSave = {
        ...product,
        ...data,
        ...updatedProduct,
        id: Number(params.id),
      };

      saveUpdatedProduct(
        productToSave
      );

      setProduct(
        productToSave
      );

      setSuccess(
        "Product updated successfully!"
      );
    } catch (error) {
      console.error(
        "Failed to update product:",
        error
      );

      setError(
        "Failed to update product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // Loading
  // --------------------------------

  if (!authorized || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>
          Loading product...
        </p>
      </main>
    );
  }

  // --------------------------------
  // Product not found
  // --------------------------------

  if (error && !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

        <div className="rounded-lg bg-white p-8 text-center shadow">

          <h1 className="mb-4 text-2xl font-bold">
            Product Not Found
          </h1>

          <p className="mb-6 text-gray-600">
            The product you are trying to
            edit does not exist.
          </p>

          <button
            onClick={() =>
              router.push("/products")
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
  // Form values
  // --------------------------------

  const initialValues = {
    title:
      product?.title || "",

    price:
      product?.price ?? "",

    category:
      product?.category || "",

    stock:
      product?.stock ?? "",

    description:
      product?.description || "",
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-2xl">

        {/* Back button */}

        <button
          onClick={() =>
            router.push(
              `/products/${product.id}`
            )
          }
          className="mb-6 rounded border bg-white px-4 py-2"
        >
          ← Back to Product
        </button>

        <div className="rounded-lg bg-white p-6 shadow">

          <h1 className="mb-6 text-3xl font-bold">
            Edit Product
          </h1>

          {/* Success */}

          {success && (
            <div className="mb-6 rounded bg-green-100 p-4 text-green-700">

              {success}

              <button
                onClick={() =>
                  router.push(
                    `/products/${product.id}`
                  )
                }
                className="ml-4 font-semibold underline"
              >
                View Product
              </button>

            </div>
          )}

          {/* Error */}

          {error && (
            <div className="mb-6 rounded bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Form */}

          <ProductForm
            initialValues={
              initialValues
            }
            onSubmit={handleSubmit}
            submitLabel="Update Product"
            loading={saving}
          />

        </div>

      </div>

    </main>
  );
}