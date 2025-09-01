// import Cookies from 'js-cookie'
// import { v4 as uuidv4 } from 'uuid'

export class CustomerIdManager {
  // private static readonly CUSTOMER_COOKIE_NAME = '_gamiphy_cid'
  // private static readonly CUSTOMER_TIMEOUT_YEARS = 2

  /**
   * Get customer id, create if not exist
   */
  public static getCustomerId(): string {
    return 'd111aff6-9732-4fbd-96ba-a8496436c6a2';
    // const customerId = Cookies.get(CustomerIdManager.CUSTOMER_COOKIE_NAME)
    // if (customerId) {
    //   return customerId
    // }
    //
    // const newCustomerId = uuidv4()
    // const expiryDate = new Date()
    // expiryDate.setFullYear(
    //   expiryDate.getFullYear() + CustomerIdManager.CUSTOMER_TIMEOUT_YEARS
    // )
    //
    // Cookies.set(CustomerIdManager.CUSTOMER_COOKIE_NAME, newCustomerId, {
    //   expires: expiryDate,
    // })
    //
    // return newCustomerId
  }
}
