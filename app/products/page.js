import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

function ProductsLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <p>Loading products...</p>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient />
    </Suspense>
  );
}