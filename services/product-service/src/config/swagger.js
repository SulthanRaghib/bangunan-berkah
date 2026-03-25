const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "Product Service API",
        version: "1.0.0",
        description: "Product, category, and inventory management APIs",
    },
    servers: [
        {
            url: "/",
            description: "API Gateway",
        },
    ],
    paths: {
        "/api/products": {
            get: { summary: "List products" },
            post: { summary: "Create product" },
        },
        "/api/products/{id}": {
            get: { summary: "Get product by id" },
            put: { summary: "Update product" },
            delete: { summary: "Delete product" },
        },
        "/api/categories": {
            get: { summary: "List categories" },
            post: { summary: "Create category" },
        },
        "/api/inventory": {
            get: { summary: "List inventory" },
        },
        "/health": {
            get: { summary: "Health check" },
        },
    },
};

module.exports = swaggerSpec;
