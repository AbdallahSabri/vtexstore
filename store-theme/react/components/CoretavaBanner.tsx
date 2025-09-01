import React, {useRef, useCallback, useEffect} from 'react'
import { NoSSR } from 'vtex.render-runtime'
import axios from 'axios'

import Banner from '../pages/banner/Banner'
import { CustomerIdManager } from '../utils/customerId'

interface CoretavaBannerProps {
  placementId: string
  appId: string
}

export enum ImpressionTypes {
  View = 'view',
  Click = 'click',
  Convergence = 'convergence',
}

interface ImpressionPayload {
  id: string;
  app: string;
  retailApp: string;
  bannerId?: string;
  placementType?: string;
  date?: string;
  type: ImpressionTypes;
  campaignId?: string;
  userId?: string;
  customerId: string;
  placement: string;
  globalProduct?: string[];
  globalBrand?: string[];
  globalCategory?: string[];
  globalCity?: string[];
}

const useImpressionTracking = (
    campaign: CampaignApiResponse | null,
    data: CoretavaBannerProps,
    apiUrl: string,
    extraData?: Record<string, string>,
) => {
  const { placementId, appId } = data;
  const retailerId = campaign?.campaignNotification.app!;
  const bannerId = campaign?.campaignNotification?.id || null
  const observerRef = useRef<IntersectionObserver | null>(null)
  const impressionSentRef = useRef<Set<string>>(new Set())
  const hasInitializedRef = useRef<boolean>(false)

  const trackImpression = useCallback(async (bannerId: string, type: ImpressionTypes = ImpressionTypes.View) => {
    const sessionStorageKey = `banner_impression_${placementId}_${bannerId}_${type}`

    if (impressionSentRef.current.has(sessionStorageKey)) {
      return
    }

    try {
      const customerId = CustomerIdManager.getCustomerId()
      const payload: ImpressionPayload = {
        app: appId,
        placement: placementId,
        retailApp: retailerId,
        type: type,
        date: new Date().toISOString(),
        campaignId: campaign?.campaignNotification.id,
        id: bannerId,
        userId: campaign?.campaignUser?.id,
        customerId: customerId,
        globalProduct: extraData?.globalProduct ? [extraData?.globalProduct] : undefined,
        globalBrand: extraData?.globalBrand ? [extraData?.globalBrand] : undefined,
        globalCategory: extraData?.globalCategory ? [extraData?.globalCategory] : undefined,
        globalCity: extraData?.globalCity ? [extraData?.globalCity] : undefined,
      }

      await axios.post(`${apiUrl}/v2/ecommerce/campaign-metrics`, payload, {
        headers: {
          'gamix-app-id': appId,
          'Content-Type': 'application/json',
        },
      })

      impressionSentRef.current.add(sessionStorageKey)
      // sessionStorage.setItem(sessionStorageKey, 'true')

      console.log(`Banner ${type} impression tracked:`, bannerId)
    } catch (error) {
      console.error(`Failed to track banner ${type} impression:`, error)
    }
  }, [appId, apiUrl, placementId, retailerId, campaign])

  const observeElement = useCallback((element: HTMLElement) => {
    if (!bannerId || !element) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Only track impression if this is not the initial intersection check
              if (hasInitializedRef.current) {
                trackImpression(bannerId);
                // Disconnect observer after first impression to prevent multiple triggers
                if (observerRef.current) {
                  observerRef.current.disconnect()
                  observerRef.current = null
                }
              } else {
                // Mark as initialized after the first intersection check
                hasInitializedRef.current = true;
              }
            } else if (!hasInitializedRef.current) {
              // If not intersecting on first check, mark as initialized
              // This ensures we track the impression when it enters viewport later
              hasInitializedRef.current = true;
            }
          })
        },
        {
          threshold: 0.5,
          rootMargin: '0px',
        }
    )

    observerRef.current.observe(element)
  }, [bannerId, trackImpression])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const handleClick = useCallback(() => {
    if (bannerId) {
      trackImpression(bannerId, ImpressionTypes.Click)
    }
  }, [bannerId, trackImpression])

  return { observeElement, handleClick }
}

const CoretavaBanner: React.FC<CoretavaBannerProps> = (props) => {
  const { placementId, appId } = props;
  const customerId = CustomerIdManager.getCustomerId()
  const [data, setData] = React.useState<CampaignApiResponse | null>(null)
  const apiUrl = 'https://api.staging.coretava.com'
  const bannerRef = useRef<HTMLDivElement>(null);

  const { observeElement, handleClick } = useImpressionTracking(data, props, apiUrl)

  React.useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const response = await axios.get(
            `${apiUrl}/v2/ecommerce/campaign-notification/placement/${placementId}?customerId=${customerId}`,
            {
              headers: {
                'gamix-app-id': appId,
                'Content-Type': 'application/json',
              },
            }
        )

        if (
            response.data &&
            response.data.campaignNotification &&
            response.data.campaignUser
        ) {
          setData(response.data)
        } else {
          console.warn('API returned empty or invalid data')
          setData(null)
        }
      } catch (err) {
        console.error('Error fetching campaign data:', err)
        setData(null)
      }
    }

    if (placementId && customerId && appId) {
      fetchCampaignData()
    } else {
      setData(null)
    }
  }, [placementId, customerId, appId])

  React.useEffect(() => {
    if (data && bannerRef.current) {
      observeElement(bannerRef.current);
    }
  }, [data, observeElement, bannerRef.current])

  if (!data) {
    return null
  }

  return (
      <div ref={bannerRef}>
        <Banner campaignData={data} onBannerClick={handleClick} />
      </div>
  )
}

export const CoretavaBannerProvided = ({ placementId, appId }: {
  placementId: string
  appId: string
}) => {
  return (
      <NoSSR>
        <CoretavaBanner placementId={placementId} appId={appId} />
      </NoSSR>
  )
}

export default CoretavaBannerProvided