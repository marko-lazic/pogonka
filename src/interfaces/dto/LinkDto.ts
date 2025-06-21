/**
 * LinkDto represents a hypermedia link in a HATEOAS-compliant API.
 */
export interface LinkDto {
  /**
   * The relation type of the link
   */
  rel: string;

  /**
   * The URL of the link
   */
  href: string;

  /**
   * The HTTP method to use with the link
   */
  method: string;
}