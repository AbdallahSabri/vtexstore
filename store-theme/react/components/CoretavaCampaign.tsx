import React from 'react'
import axios from 'axios'
import { useQuery } from 'react-apollo'
import { ProductSummaryCustom } from 'vtex.product-summary'
import { ProductSummaryTypes } from 'vtex.product-summary-context'
import { ExtensionPoint, NoSSR } from 'vtex.render-runtime'

import PRODUCT_QUERY from '../graphql/productsByIdentifier.gql'
import '../pages/campaign/styles.css'

const CoretavaCampaign: React.FC = () => {
  const [productIds, setProductIds] = React.useState<string[]>([])

  const urlParams = new URLSearchParams(window.location.search)
  const campaignId = urlParams.get('campaignId')
const gamiphy_app_id = urlParams.get('gamiphy_app_id')

  const apiUrl = 'https://api.staging.coretava.com'

  React.useEffect(() => {
    const fetchProductIds = async () => {
      const response = await axios.get(
        `${apiUrl}/v2/ecommerce/campaigns/campaign-products/${campaignId}`,
        {
          headers: {
            'gamix-app-id': gamiphy_app_id,
            'Content-Type': 'application/json',
          },
        }
      )
      setProductIds(response.data.ids.length > 0 ? response.data.ids : [])
    }
    fetchProductIds()
  }, [campaignId, gamiphy_app_id, apiUrl])

  const { data, loading, error } = useQuery<{
    productsByIdentifier: ProductSummaryTypes.Product[]
  }>(PRODUCT_QUERY, {
    ssr: false,
    variables: {
      ids: productIds|| [],
    },
    skip : productIds.length === 0
  })


  const productsSummary = React.useMemo(
    () =>
      data?.productsByIdentifier.map(product =>
        ProductSummaryCustom.mapCatalogProductToProductSummary(
          product,
          'PRICE_ASC'
        )
      ),
    [data?.productsByIdentifier]
  )

  // Extract brands from products
  const brands = React.useMemo(() => {
    if (!productsSummary) return []
    return [...new Set(productsSummary.map(p => p.brand).filter(Boolean))]
  }, [productsSummary])

  // Extract categories from products
  const categories = React.useMemo(() => {
    if (!productsSummary) return []

    const allCategories = productsSummary.reduce<string[]>((acc, p) => {
      return acc.concat(p.categories || [])
    }, [])

    const categoryNames = new Set<string>()
    allCategories.forEach(categoryPath => {
      if (!categoryPath) return

      const pathParts = categoryPath
        .split('/')
        .filter(part => part.trim() !== '')

      if (pathParts.length === 0) return

      categoryNames.add(pathParts[pathParts.length - 1])
    })

    return Array.from(categoryNames).sort((a, b) => a.localeCompare(b))
  }, [productsSummary])

  // Generate price ranges from products
  const priceRanges = React.useMemo(() => {
    if (!productsSummary) return []

    const prices = productsSummary
      .map(product => product.priceRange?.sellingPrice?.lowPrice || 0)
      .filter(price => price > 0)

    if (prices.length === 0) return []

    const maxPrice = Math.max(...prices)
    const ranges = []

    if (maxPrice <= 50) {
      ranges.push({ name: '$0 - $50', value: '0-50', selected: false, quantity: prices.length })
    } else if (maxPrice <= 100) {
      ranges.push(
        { name: '$0 - $50', value: '0-50', selected: false, quantity: prices.filter(p => p <= 50).length },
        { name: '$51 - $100', value: '51-100', selected: false, quantity: prices.filter(p => p > 50 && p <= 100).length }
      )
    } else {
      ranges.push(
        { name: '$0 - $50', value: '0-50', selected: false, quantity: prices.filter(p => p <= 50).length },
        { name: '$51 - $100', value: '51-100', selected: false, quantity: prices.filter(p => p > 50 && p <= 100).length },
        { name: '$101+', value: '101+', selected: false, quantity: prices.filter(p => p > 100).length }
      )
    }

    return ranges.filter(range => range.quantity > 0)
  }, [productsSummary])

  const searchContext = {
    map: 'c',
    hiddenFacets: {
      categories: false,
      brands: false,
      priceRange: false,
      specificationFilters: {
        hideAll: false,
      }
    },
    products: productsSummary || [],
    searchQuery: {
      data: {
        facets: {
          brands: brands.map(brand => ({
            filter:{
              selected:true,
              value:brand.toLowerCase().replace(/\s+/g, '-'),
           }
          })),
          priceRanges: priceRanges.map(range => ({
              filter:{
                  selected:true,
                  value:range.value,
              }
          })),
          categoriesTrees: categories.map(category => ({
            name: category,
            value: category.toLowerCase().replace(/\s+/g, '-'),
            selected: true,
            quantity: 1,
            children: []
          })),
          breadcrumb: [
            { name: 'Home', href: '/' },
            { name: 'Campaign', href: '/coreads/campaign' }
          ],
        },
        productSearch: {
          products: productsSummary || [],
          recordsFiltered: productsSummary?.length ?? 0,
          breadcrumb: [
            { name: 'Home', href: '/' },
            { name: 'Campaign', href: '/coreads/campaign' }
          ],
        },
      },
      loading: loading,
      error: error,
      variables: {
        query: '',
        map: 'c',
        orderBy: 'OrderByReleaseDateDESC',
        priceRange: '',
        filter: '',
        page: 1,
        perPage: 12,
      },
    },
  }


  return (
    <div className="campaign-search-results">
      <ExtensionPoint 
        id="search-result-layout" 
        {...searchContext}
      />
    </div>
  )
}

export const CoretavaCampaignProvided = () => (
  <NoSSR>
    <CoretavaCampaign />
  </NoSSR>
)

export default CoretavaCampaignProvided
