import React from 'react'
import { SliderLayout } from 'vtex.slider-layout'
import './styles.css'

interface Props {
  campaignData: CampaignApiResponse
}

const Banner: React.FC<Props> = ({ campaignData }) => {
  const { campaignNotification, campaignUser } = campaignData

  const getBannerImages = () => {
    if (campaignNotification.banner) {
      const images = []

      if (campaignNotification.banner.image) {
        images.push(campaignNotification.banner.image)
      }

      if (
        campaignNotification.banner.webImages &&
        campaignNotification.banner.webImages.length > 0
      ) {
        images.push(...campaignNotification.banner.webImages)
      }

      if (
        images.length === 0 &&
        campaignNotification.banner.mobileImages &&
        campaignNotification.banner.mobileImages.length > 0
      ) {
        images.push(...campaignNotification.banner.mobileImages)
      }

      return images.length > 0 ? images : []
    }

    return []
  }

  const bannerImages = getBannerImages()

  const  handleImageClick = () => {
    if (campaignUser?.productUrl) {
      const url = campaignUser.productUrl.startsWith('http')
        ? campaignUser.productUrl
        : `https://${campaignUser.productUrl}`
      window.location.href = url
    }
  }

  return (
    <div className="coretava-banner">
      <div className="banner-slider">
        <SliderLayout
          itemsPerPage={{
            desktop: 1,
            tablet: 1,
            phone: 1,
          }}
          infinite={true}
          showNavigationArrows="always"
          showPaginationDots="always"
          usePagination={true}
          fullWidth={true}
          autoplay={{
            timeout: 5000,
            stopOnHover: true,
          }}
        >
          {bannerImages.map((image: string, index: number) => (
            <div key={index} className="banner-slide">
              <img
                src={image}
                alt={`Banner ${index + 1}`}
                className="banner-slide-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
                onClick={handleImageClick}
              />
            </div>
          ))}
        </SliderLayout>
      </div>
    </div>
  )
}

export default Banner 
