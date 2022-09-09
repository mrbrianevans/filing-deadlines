
export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];


export function getDaysLeft(date: string){
  return Math.floor((new Date(date).getTime() - Date.now())/(86400*1000))
}
export function getDaysLeftDuration(dueDate: string|undefined){
  if(!dueDate) return ''
  const days = getDaysLeft(dueDate)
  return days > 0 ? `${days} days left` : `${-days} days ago`
}
