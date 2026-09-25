# Product Admin Dashboard

A responsive Product Admin Dashboard built with Next.js, React, Tailwind CSS, Axios, and DummyJSON.

## Tech Stack

- Next.js
- React
- JavaScript
- Tailwind CSS
- Axios
- DummyJSON API
- LocalStorage

## Features

### Authentication

- Login using DummyJSON authentication API
- Test username: `emilys`
- Test password: `emilyspass`
- Access token stored in LocalStorage
- Protected product pages
- Logout functionality
- Prevents multiple login requests

### Product Management

- Product list
- Product details
- Add product
- Edit product
- Delete product
- Delete confirmation
- Form validation
- Loading states
- Error states
- Empty states
- Retry functionality

### Search

- Product search using DummyJSON search API
- 500ms debounce
- Search resets pagination to page 1
- Search state stored in URL
- Previous search requests are cancelled to prevent stale results

### Filtering

- Category filter
- Categories loaded from DummyJSON
- Search and category filter are handled separately because the DummyJSON API does not provide a reliable combined search + category endpoint

### Sorting

Available sorting options:

- Price: Low to High
- Price: High to Low
- Rating: High to Low
- Rating: Low to High
- Title: A to Z
- Title: Z to A

### Pagination

- Previous / Next buttons
- Page numbers
- Page sizes:
  - 10
  - 20
  - 50
- Current page stored in URL
- Page size stored in URL

Example:

`/products?page=2&limit=20`

### Responsive Design

Desktop:

- Product table

Mobile:

- Product cards

### Product Details

Product details include:

- Images
- Title
- Description
- Price
- Category
- Brand
- Rating
- Stock
- SKU
- Reviews

### CRUD Persistence

DummyJSON simulates POST, PUT and DELETE operations rather than permanently changing the remote dataset.

To provide a consistent user experience, the application also stores local CRUD changes in LocalStorage.

LocalStorage keeps track of:

- Created products
- Updated products
- Deleted product IDs

This allows changes to remain visible after refreshing the browser.

## Project Structure

```text
product-admin-dashboard/
│
├── app/
│   ├── login/
│   │   └── page.js
│   │
│   ├── products/
│   │   ├── add/
│   │   │   └── page.js
│   │   │
│   │   ├── [id]/
│   │   │   ├── edit/
│   │   │   │   └── page.js
│   │   │   │
│   │   │   └── page.js
│   │   │
│   │   └── page.js
│   │
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── components/
│   └── ProductForm.js
│
├── hooks/
│   └── useDebounce.js
│
├── lib/
│   ├── axios.js
│   ├── authApi.js
│   ├── productApi.js
│   └── productStorage.js
│
├── public/
│
├── package.json
└── README.md

## Deployment

The application is deployed on Vercel and available here:

https://product-admin-dashboard-seven-umber.vercel.app/

## Final Status

- Production build verified successfully
- GitHub repository configured
- Vercel deployment completed
- Responsive product management dashboard implemented