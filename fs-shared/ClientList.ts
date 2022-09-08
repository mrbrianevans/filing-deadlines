export interface ClientListItem {
  "company_name"?: string,
  "company_number": string,
  "date_added": string
}

export const sortClientList = (a: ClientListItem,b: ClientListItem) => new Date(a.date_added).getTime() - new Date(b.date_added).getTime()
