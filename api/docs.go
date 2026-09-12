// Package api embeds the OpenAPI specification served by the backend.
package api

import _ "embed"

// OpenAPISpec is the OpenAPI 3.0 document (api/openapi.json) describing the
// whole HTTP API. It is embedded at build time so the binary stays
// self-contained (same approach as the SQL migrations).
//
//go:embed openapi.json
var OpenAPISpec []byte
