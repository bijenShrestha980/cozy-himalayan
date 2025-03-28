"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || [],
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number.parseInt(searchParams.get("minPrice") || "0"),
    Number.parseInt(searchParams.get("maxPrice") || "1000"),
  ])
  const [rating, setRating] = useState(searchParams.get("rating") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")
  const [maxPrice, setMaxPrice] = useState(1000)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategoriesAndProducts()
  }, [searchParams])

  const fetchCategoriesAndProducts = async () => {
    try {
      setError(null)

      // Fetch categories first - this is a simple query that shouldn't trigger RLS issues
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true })

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError)
        toast({
          title: "Error",
          description: "Failed to load categories. Using default filters.",
          variant: "destructive",
        })
        // Continue with empty categories
      } else {
        setCategories(categoriesData || [])
      }

      // Then fetch products separately
      await fetchProducts()
    } catch (error) {
      console.error("Error in fetchCategoriesAndProducts:", error)
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      // Use a simpler query to avoid potential RLS issues
      let query = supabase.from("products").select("*")

      // Apply search filter
      const search = searchParams.get("q")
      if (search) {
        query = query.ilike("name", `%${search}%`)
      }

      // Apply category filter
      const categoryFilter = searchParams.get("categories")
      if (categoryFilter) {
        const categoryIds = categoryFilter.split(",").filter(Boolean)
        if (categoryIds.length > 0) {
          query = query.in("category_id", categoryIds)
        }
      }

      // Apply price filter
      const minPrice = searchParams.get("minPrice")
      const maxPrice = searchParams.get("maxPrice")
      if (minPrice) {
        query = query.gte("price", minPrice)
      }
      if (maxPrice) {
        query = query.lte("price", maxPrice)
      }

      // Apply rating filter (assuming products have a rating field)
      const ratingFilter = searchParams.get("rating")
      if (ratingFilter && ratingFilter !== "all") {
        const ratingValue = Number.parseInt(ratingFilter)
        if (!isNaN(ratingValue)) {
          query = query.gte("rating", ratingValue)
        }
      }

      // Apply sorting
      const sortParam = searchParams.get("sort")
      if (sortParam) {
        switch (sortParam) {
          case "price-low":
            query = query.order("price", { ascending: true })
            break
          case "price-high":
            query = query.order("price", { ascending: false })
            break
          case "name-asc":
            query = query.order("name", { ascending: true })
            break
          case "name-desc":
            query = query.order("name", { ascending: false })
            break
          case "newest":
          default:
            query = query.order("created_at", { ascending: false })
            break
        }
      } else {
        // Default sorting
        query = query.order("created_at", { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      // Find max price for slider
      if (data && data.length > 0) {
        const highestPrice = Math.max(...data.map((p) => p.price))
        setMaxPrice(Math.max(1000, Math.ceil(highestPrice / 100) * 100))

        // Process products to include category information
        const productsWithCategories = await addCategoryInfoToProducts(data)
        setProducts(productsWithCategories)
      } else {
        setProducts([])
      }
    } catch (error: any) {
      console.error("Error fetching products:", error)
      setError(error.message || "Failed to load products")
      toast({
        title: "Error",
        description: "Failed to load products. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to add category info to products
  const addCategoryInfoToProducts = async (products: any[]) => {
    try {
      // Get unique category IDs from products
      const categoryIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))]

      if (categoryIds.length === 0) {
        return products
      }

      // Create a map of category names from our already fetched categories
      const categoryMap: Record<string, string> = {}
      categories.forEach((cat) => {
        if (cat.id) categoryMap[cat.id] = cat.name
      })

      // If we don't have all categories, try to fetch the missing ones
      const missingCategoryIds = categoryIds.filter((id) => !categoryMap[id])

      if (missingCategoryIds.length > 0) {
        try {
          const { data: missingCategories } = await supabase
            .from("categories")
            .select("id, name")
            .in("id", missingCategoryIds)

          if (missingCategories) {
            missingCategories.forEach((cat) => {
              categoryMap[cat.id] = cat.name
            })
          }
        } catch (error) {
          console.error("Error fetching missing categories:", error)
          // Continue with what we have
        }
      }

      // Add category names to products
      return products.map((product) => ({
        ...product,
        category: {
          id: product.category_id,
          name: categoryMap[product.category_id] || "Unknown",
        },
      }))
    } catch (error) {
      console.error("Error adding category info to products:", error)
      return products // Return original products if there's an error
    }
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (searchQuery) {
      params.set("q", searchQuery)
    }

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","))
    }

    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    if (rating !== "all") {
      params.set("rating", rating)
    }

    if (sortBy !== "newest") {
      params.set("sort", sortBy)
    }

    router.push(`/products?${params.toString()}`)
    setFiltersOpen(false)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, maxPrice])
    setRating("all")
    setSortBy("newest")
    router.push("/products")
    setFiltersOpen(false)
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  // Function to render star rating
  const renderStars = (count: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden w-full mb-4">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="py-4 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-mobile-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                        />
                        <label
                          htmlFor={`category-mobile-${category.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={maxPrice}
                    step={10}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mt-2"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">${priceRange[0]}</span>
                    <span className="text-sm">${priceRange[1]}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Rating</h3>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="1">1+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Sort By</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <Button onClick={applyFilters}>Apply Filters</Button>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block w-64 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-medium mb-4 mt-6">Price Range</h3>
              <Slider
                value={priceRange}
                min={0}
                max={maxPrice}
                step={10}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="mt-2"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">${priceRange[0]}</span>
                <span className="text-sm">${priceRange[1]}</span>
              </div>

              <h3 className="text-lg font-medium mb-4 mt-6">Rating</h3>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4">
                    <div className="flex items-center">
                      {renderStars(4)} <span className="ml-2">& Up</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center">
                      {renderStars(3)} <span className="ml-2">& Up</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center">
                      {renderStars(2)} <span className="ml-2">& Up</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1">
                    <div className="flex items-center">
                      {renderStars(1)} <span className="ml-2">& Up</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <h3 className="text-lg font-medium mb-4 mt-6">Sort By</h3>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex flex-col gap-2 mt-6">
                <Button onClick={applyFilters}>Apply Filters</Button>
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="absolute right-0 top-0 rounded-l-none">
                Search
              </Button>
            </div>
          </form>

          {/* Active Filters */}
          {(searchParams.get("q") ||
            selectedCategories.length > 0 ||
            priceRange[0] > 0 ||
            priceRange[1] < maxPrice ||
            rating !== "all" ||
            sortBy !== "newest") && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm font-medium">Active Filters:</span>

              {searchParams.get("q") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setSearchQuery("")
                    applyFilters()
                  }}
                >
                  Search: {searchParams.get("q")}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}

              {selectedCategories.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId)
                return category ? (
                  <Button
                    key={categoryId}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
                      applyFilters()
                    }}
                  >
                    {category.name}
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                ) : null
              })}

              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setPriceRange([0, maxPrice])
                    applyFilters()
                  }}
                >
                  Price: ${priceRange[0]} - ${priceRange[1]}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}

              {rating !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setRating("all")
                    applyFilters()
                  }}
                >
                  Rating: {rating}+ Stars
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}

              {sortBy !== "newest" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setSortBy("newest")
                    applyFilters()
                  }}
                >
                  Sort: {sortBy.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}

              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                Clear All
              </Button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Error loading products</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchProducts()}>Try Again</Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

