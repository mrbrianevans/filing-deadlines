import {swr} from "@svelte-drama/swr";
import {poster, readableSwrOptions} from "../swr.js";
import type {NotificationPreferences} from '../../../../fs-shared/Notifications.js'


function createNotificationPreferencesStore(){
  const key = '/api/user/org/member/notifications/preferences'
  const { data: {subscribe}, error, refresh, update, processing } = swr<NotificationPreferences|null>(key, readableSwrOptions)

  async function setPreference(notificationName: string, enabled: boolean){
    await update(prev => Object.assign(prev, {[notificationName]: enabled})) // optimistically update
    const success = await poster(`/api/user/org/member/notifications/preference/${notificationName}`, enabled)
    await refresh()
    return success
  }

  return {subscribe, setPreference, processing, refresh, error}
}

export const notificationPreferences = createNotificationPreferencesStore()
