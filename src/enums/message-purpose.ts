export enum MessagePurpose {
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',
  Event = 'event',
  Error = 'error',
  CommandRequest = 'commandRequest',
  CommandResponse = 'commandResponse',
  Encrypt = 'ws:encrypt',
  DataResponse = 'data',
  BlockDataRequest = 'data:block',
  ItemDataRequest = 'data:item',
  MobDataRequest = 'data:mob',
}