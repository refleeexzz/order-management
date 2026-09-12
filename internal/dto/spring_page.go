package dto

// SpringPage mirrors Spring Data's Page<T> JSON serialization (used by
// GET /api/customers, the only endpoint that returns a raw Page instead of
// the project's PageResponse wrapper).
type SpringPage[T any] struct {
	Content          []T          `json:"content"`
	Pageable         PageableInfo `json:"pageable"`
	TotalElements    int64        `json:"totalElements"`
	TotalPages       int          `json:"totalPages"`
	Last             bool         `json:"last"`
	Size             int          `json:"size"`
	Number           int          `json:"number"`
	Sort             SortInfo     `json:"sort"`
	NumberOfElements int          `json:"numberOfElements"`
	First            bool         `json:"first"`
	Empty            bool         `json:"empty"`
}

// PageableInfo mirrors the `pageable` object inside Spring's Page JSON.
type PageableInfo struct {
	PageNumber int      `json:"pageNumber"`
	PageSize   int      `json:"pageSize"`
	Sort       SortInfo `json:"sort"`
	Offset     int64    `json:"offset"`
	Paged      bool     `json:"paged"`
	Unpaged    bool     `json:"unpaged"`
}

// SortInfo mirrors Spring's Sort JSON ({empty, sorted, unsorted}).
type SortInfo struct {
	Empty    bool `json:"empty"`
	Sorted   bool `json:"sorted"`
	Unsorted bool `json:"unsorted"`
}

// NewSpringPage builds the Page<T> JSON for a 0-based page. sorted=true
// marks the Sort metadata as sorted (GET /api/customers sorts id DESC).
// first = page == 0, last = no next page, empty = no elements in this page,
// exactly like Spring's PageImpl.
func NewSpringPage[T any](content []T, page, size int, totalElements int64, sorted bool) SpringPage[T] {
	if content == nil {
		content = []T{}
	}
	totalPages := 0
	if size > 0 {
		totalPages = int((totalElements + int64(size) - 1) / int64(size))
	}
	sortInfo := SortInfo{Empty: !sorted, Sorted: sorted, Unsorted: !sorted}
	return SpringPage[T]{
		Content: content,
		Pageable: PageableInfo{
			PageNumber: page,
			PageSize:   size,
			Sort:       sortInfo,
			Offset:     int64(page) * int64(size),
			Paged:      true,
			Unpaged:    false,
		},
		TotalElements:    totalElements,
		TotalPages:       totalPages,
		Last:             page+1 >= totalPages,
		Size:             size,
		Number:           page,
		Sort:             sortInfo,
		NumberOfElements: len(content),
		First:            page == 0,
		Empty:            len(content) == 0,
	}
}
