"use client";

import { useState } from "react";

export default function ProductForm({
  initialValues = {
    title: "",
    price: "",
    category: "",
    stock: "",
    description: "",
  },
  onSubmit,
  submitLabel = "Save Product",
  loading = false,
}) {
  const [formData, setFormData] = useState(
    initialValues
  );

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    }

    if (
      formData.price === "" ||
      Number(formData.price) <= 0
    ) {
      newErrors.price =
        "Price must be greater than 0.";
    }

    if (!formData.category.trim()) {
      newErrors.category =
        "Category is required.";
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0
    ) {
      newErrors.stock =
        "Stock cannot be negative.";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Description is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      price: Number(formData.price),
      category: formData.category.trim(),
      stock: Number(formData.stock),
      description: formData.description.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-1 block font-medium">
          Title
        </label>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded border p-3"
          placeholder="Enter product title"
        />

        {errors.title && (
          <p className="mt-1 text-sm text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Price
        </label>

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="w-full rounded border p-3"
          placeholder="Enter price"
        />

        {errors.price && (
          <p className="mt-1 text-sm text-red-600">
            {errors.price}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Category
        </label>

        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full rounded border p-3"
          placeholder="Enter category"
        />

        {errors.category && (
          <p className="mt-1 text-sm text-red-600">
            {errors.category}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Stock
        </label>

        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          min="0"
          className="w-full rounded border p-3"
          placeholder="Enter stock quantity"
        />

        {errors.stock && (
          <p className="mt-1 text-sm text-red-600">
            {errors.stock}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Description
        </label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          className="w-full rounded border p-3"
          placeholder="Enter product description"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : submitLabel}
      </button>
    </form>
  );
}