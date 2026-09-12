package handler

import (
	"net/http"

	"github.com/refleeexzz/order-management/api"
)

// OpenAPI serves the embedded OpenAPI 3.0 specification as JSON. It is a
// PUBLIC route (spec §6): GET /api-docs and GET /v3/api-docs.
func OpenAPI(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(api.OpenAPISpec)
}

// swaggerUIPage is a minimal Swagger UI shell that loads swagger-ui-dist
// from the unpkg CDN and points it at /api-docs (mirrors springdoc's
// swagger-ui at /swagger-ui.html).
const swaggerUIPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Management API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: "/api-docs",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
`

// SwaggerUI serves the Swagger UI HTML page. PUBLIC route (spec §6):
// GET /swagger-ui.html and GET /swagger-ui/*.
func SwaggerUI(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(swaggerUIPage))
}
