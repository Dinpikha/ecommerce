import { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import { extractCategories } from '../utils/categories'

let categoriesCache = null
let productsCache = null
let cachePromise = null

async function loadCatalog() {
  if (categoriesCache && productsCache) {
    return { categories: categoriesCache, products: productsCache }
  }

  if (!cachePromise) {
    cachePromise = productService.list({ limit: 100 }).then((data) => {
      productsCache = data.products || []
      categoriesCache = extractCategories(productsCache)
      return { categories: categoriesCache, products: productsCache }
    })
  }

  return cachePromise
}

export function useCategories() {
  const [categories, setCategories] = useState(categoriesCache || [])
  const [products, setProducts] = useState(productsCache || [])
  const [loading, setLoading] = useState(!categoriesCache)

  useEffect(() => {
    let active = true

    loadCatalog()
      .then((data) => {
        if (!active) return
        setCategories(data.categories)
        setProducts(data.products)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { categories, products, loading }
}
