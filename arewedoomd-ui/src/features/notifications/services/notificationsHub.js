import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const HUB_URL = '/hubs/user-notifications';

export const RECEIVE_NOTIFICATION = 'ReceiveNotification';

// Creates (but does not start) a hub connection. The access token is read lazily
// on every (re)connect so token refreshes are picked up automatically. The token
// is sent as the `access_token` query parameter on the WebSocket, which the API
// reads in JwtBearerOptions.Events.OnMessageReceived.
export function createNotificationsConnection() {
  return new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => localStorage.getItem('accessToken') || '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
}
