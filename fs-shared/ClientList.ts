export interface ClientListItem {
  "company_name"?: string,
  "company_number": string,
  "added_on": string
}

export const sortClientList = (a: ClientListItem,b: ClientListItem) => new Date(a.added_on).getTime() - new Date(b.added_on).getTime()
