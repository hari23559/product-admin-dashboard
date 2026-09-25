"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProductForm from "../../../components/ProductForm";

import { addProduct } from "../../../lib/productApi";

import {
  addCreatedProduct,
} from "../../../lib/productStorage";

export default function AddProductPage() {
  const router = useRouter();

  const [authorized, setAuthorized] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

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
  // Submit
  // --------------------------------

  const handleSubmit = async (
    product
  ) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Send product to DummyJSON
      const createdProduct =
        await addProduct(product);

      console.log(
        "Created product:",
        createdProduct
      );

      // --------------------------------
      // DummyJSON does not permanently
      // save the created product.
      //
      // Save it locally so our app can
      // continue displaying it.
      // --------------------------------

      addCreatedProduct(
        createdProduct
      );

      setSuccess(
        "Product created successfully!"
      );

    } catch (error) {
      console.error(
        "Failed to create product:",
        error
      );

      setError(
        "Failed to create product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Authentication loading
  // --------------------------------

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>
          Checking authentication...
        </p>
      </main>
    );
  }

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
              "/products"
            )
          }
          className="mb-6 rounded border bg-white px-4 py-2"
        >
          ← Back to Products
        </button>

        {/* Form container */}

        <div className="rounded-lg bg-white p-6 shadow">

          <h1 className="mb-6 text-3xl font-bold">
            Add Product
          </h1>

          {/* Success */}

          {success && (
            <div className="mb-6 rounded bg-green-100 p-4 text-green-700">
              {success}

              <button
                onClick={() =>
                  router.push(
                    "/products"
                  )
                }
                className="ml-4 font-semibold underline"
              >
                View Products
              </button>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="mb-6 rounded bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Product form */}

          <ProductForm
            onSubmit={handleSubmit}
            submitLabel="Add Product"
            loading={loading}
          />

        </div>

      </div>

    </main>
  );
}