declare interface CampaignNotification {
  id: string
  app: string
  campaign: string
  date: string
  communicationType: string
  name: Record<string, string>
  messageType: string
  boosterType: string
  text: Record<string, string>
  banner: {
    image: string
    placement: string
    mobileImages: string[]
    webImages: string[]
  }
}

declare interface CampaignUser {
  id: string
  app: string
  campaign: string
  user: string
  discount: {
    id: string
    code: string
  }
  url: string
  productUrl: string
  status: string
  spin: {
    spinValue: number
    wheelOption: string
  }
  wheelOption: string
  banners: Array<{
    id: string
    active: boolean
  }>
}

declare interface CampaignApiResponse {
  campaignNotification: CampaignNotification
  campaignUser: CampaignUser
}
