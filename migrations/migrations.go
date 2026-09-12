// Package migrations embeds the SQL migration files applied at startup
// with golang-migrate (Flyway parity — schema is owned by migrations,
// never by GORM AutoMigrate).
package migrations

import "embed"

// FS contains the *.up.sql / *.down.sql migration files.
//
//go:embed *.sql
var FS embed.FS
