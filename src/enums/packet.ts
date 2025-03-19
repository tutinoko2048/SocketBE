export enum Packet {
  CommandRequest = 'commandRequest',
  CommandResponse = 'commandResponse',
  CommandError = 'error',
  DataRequest = 'data:request',
  DataResponse = 'data:response',
  EventSubscribe = 'subscribe',
  EventUnsubscribe = 'unsubscribe',
  EncryptionRequest = 'ws:encryptionRequest',
  EncryptionResponse = 'ws:encryptionResponse',

  // --- mc event packets ---
  // BlockBroken = 'BlockBroken',
  // BlockPlaced = 'BlockPlaced',
  PlayerMessage = 'PlayerMessage',
  PlayerTransform = 'PlayerTransform',
  PlayerTravelled = 'PlayerTravelled',
}

/*
AgentCommand
AgentCreated
AndroidHelpRequest
ApiInit
AppPaused
AppResumed
AppSuspended
AppUnpaused
ArmorStandItemEquipped
ArmorStandPosed
AssertFailed
AvatarsListed
AvatarUpdated
BehaviorErrored
BehaviorFailed
BlockBroken
BlockChecksumMismatchLevelFailedToLoad
BlockFound
BlockPlaced
BlockUsageAttempt
BlockUsed
BookCopied
BookEdited
BookExported
BookImageImported
BossKilled
BundleSubOfferClicked
ButtonPressed
CameraUsed
CaravanChanged
CaravanChanged
CauldronUsed
ChunkChanged
ChunkLoaded
ClassroomSettingUpdated
ClientIdCreated
ClubsEngagement
CommandBlockEdited
ConfigurationChanged
ConnectionFailed
ContentShared
ControlRemappedByPlayer
CraftingSessionCompleted
CrashDumpStatus
CustomContentRegistered
DBStorageError
DevConsoleOpen
DeviceAccountFailure
DeviceAccountSuccess
DeviceIdManagerFailOnIdentityGained
DeviceLost
DifficultySet
DiskStatus
DwellerDied
DwellerRemoved
EDUDemoConversion
EduOptionSet
EmotePlayed
GameRulesUpdated
GameSessionStart
GameTipShown
HardwareInfo
HowToPlayTopicChanged
IDESelected
IncognitoFailure
InputModeChanged
ItemAcquired
ItemCrafted
ItemDropped
ItemEquipped
ItemInteracted
ItemNamed
ItemSmelted
ItemTraded
JoinCanceled
JukeboxUsed
LockedItemGiven
MobEffectChanged
MobInteracted
NpcInteracted
OfferRated
OnAppResume
OnAppStart
OnAppSuspend
OnDeviceLost
OptionsUpdated
PackHashChanged
PackPlayed
PackRecovery
PackSettings
PatternAdded
PerformanceContext
PerformanceMetrics
PermissionsSet
PetDied
PlayerBanned
PlayerBounced
PlayerGameModeSet
PlayerMessage
PlayerSaved
PlayerTeleported
PlayerTransform
PlayerTravelled
PopupClosed
PopupFiredEdu
PortalUsed
PortfolioExported
PotionBrewed
Progressions
PurchaseFailedDetailed
PushNotificationPermission
PushNotificationReceived
QueryOfferResult
RaidUpdated
RealmShared
RealmsSubscriptionPurchaseFailed
RealmsSubscriptionPurchaseStarted
RealmsSubscriptionPurchaseSucceeded
RenderingSizeChanged
RespondedToAcceptContent
ScreenChanged
ScreenLoaded
ScreenLoadTime
ScriptRan
ServerConnection
ServerConnectionAttempt
ServerDrivenLayoutImageLoad
ServerDrivenLayoutPageLoad
SessionCrashed
SignedBookOpened
SignIn
SignInToEdu
SignOut
SignOutOfXboxLive
SlashCommandExecuted
StartClient
StartWorld
StorageCreated
storageReport
StoreDiscoveryServiceResponse
StoreOfferClicked
StorePlayFabResponse
StorePromoNotification
StorePromoNotificationClicked
StoreSearch
StoreSessionStartResponse
StructureBlockAction
TargetBlockHit
TextToSpeechToggled
TreatmentPackApplied
TreatmentPackRemoved
Treatments
TrialDeviceIdCorrelation
UgcDownloadCompleted
WaxedOnOrOff
WorldGenerated
WorldLoadedClassroomCustomization
WorldLoadTimes
XForgeCatalogSearch

*/