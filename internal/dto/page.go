package dto

// PageResponse mirrors dto/common/PageResponse<T> — used by the products,
// orders and search list endpoints.
type PageResponse[T any] struct {
	Content       []T   `json:"content"`
	Page          int   `json:"page"`
	Size          int   `json:"size"`
	TotalElements int64 `json:"totalElements"`
	TotalPages    int   `json:"totalPages"`
	First         bool  `json:"first"`
	Last          bool  `json:"last"`
}

// NewPageResponse mirrors PageResponse.from(Page<T>): page is 0-based,
// first = page == 0, last = no next page. A nil content slice is normalized
// to an empty JSON array ([]), like Spring serializes an empty page.
func NewPageResponse[T any](content []T, page, size int, totalElements int64) PageResponse[T] {
	if content == nil {
		content = []T{}
	}
	totalPages := 0
	if size > 0 {
		totalPages = int((totalElements + int64(size) - 1) / int64(size))
	}
	return PageResponse[T]{
		Content:       content,
		Page:          page,
		Size:          size,
		TotalElements: totalElements,
		TotalPages:    totalPages,
		First:         page == 0,
		Last:          page+1 >= totalPages,
	}
}
