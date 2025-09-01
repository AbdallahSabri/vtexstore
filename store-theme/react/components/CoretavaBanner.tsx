import React from 'react'
import { NoSSR } from 'vtex.render-runtime'
import axios from 'axios'

import Banner from '../pages/banner/Banner'
import { CustomerIdManager } from '../utils/customerId'

interface CoretavaBannerProps {
  placementId: string
  appId: string
}

const CoretavaBanner: React.FC<CoretavaBannerProps> = ({
  placementId,
  appId,
}) => {
  const customerId = CustomerIdManager.getCustomerId()
  const [data, setData] = React.useState<CampaignApiResponse | null>(null)
  const apiUrl = 'https://api.staging.coretava.com'

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

  if (!data) {
    return null
  }

  return <Banner campaignData={data} />
}

export const CoretavaBannerProvided = ({
  placementId,
  appId,
}: {
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
