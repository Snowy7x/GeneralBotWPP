import {AnyMessageContent, proto, WAMessage} from "@whiskeysockets/baileys";
import {GroupMetadata} from "@whiskeysockets/baileys/lib/Types/GroupMetadata";

interface CustomMessage extends WAMessage {
    originalMessage?: WAMessage;
    isGroup: boolean,
    isGroupAdmin: boolean,
    isViewOnce: boolean,
    hasMedia: boolean,
    hasText: boolean,
    meAdmin: boolean,
    media: proto.Message.IImageMessage | proto.Message.IVideoMessage,
    body: string,
    groupMetadata?: GroupMetadata,
    author?: string,
    from: string,
    /** Reply function */
    reply?: (message: string | AnyMessageContent, options?: any) => Promise<void>,
    /** WebMessageInfo key */
    key: proto.IMessageKey;

    /** WebMessageInfo message */
    message?: (proto.IMessage|null);

    /** WebMessageInfo messageTimestamp */
    messageTimestamp?: (number|Long|null);

    /** WebMessageInfo status */
    status?: (proto.WebMessageInfo.Status|null);

    /** WebMessageInfo participant */
    participant?: (string|null);

    /** WebMessageInfo messageC2STimestamp */
    messageC2STimestamp?: (number|Long|null);

    /** WebMessageInfo ignore */
    ignore?: (boolean|null);

    /** WebMessageInfo starred */
    starred?: (boolean|null);

    /** WebMessageInfo broadcast */
    broadcast?: (boolean|null);

    /** WebMessageInfo pushName */
    pushName?: (string|null);

    /** WebMessageInfo mediaCiphertextSha256 */
    mediaCiphertextSha256?: (Uint8Array|null);

    /** WebMessageInfo multicast */
    multicast?: (boolean|null);

    /** WebMessageInfo urlText */
    urlText?: (boolean|null);

    /** WebMessageInfo urlNumber */
    urlNumber?: (boolean|null);

    /** WebMessageInfo messageStubType */
    messageStubType?: (proto.WebMessageInfo.StubType|null);

    /** WebMessageInfo clearMedia */
    clearMedia?: (boolean|null);

    /** WebMessageInfo messageStubParameters */
    messageStubParameters?: (string[]|null);

    /** WebMessageInfo duration */
    duration?: (number|null);

    /** WebMessageInfo labels */
    labels?: (string[]|null);

    /** WebMessageInfo paymentInfo */
    paymentInfo?: (proto.IPaymentInfo|null);

    /** WebMessageInfo finalLiveLocation */
    finalLiveLocation?: (proto.Message.ILiveLocationMessage|null);

    /** WebMessageInfo quotedPaymentInfo */
    quotedPaymentInfo?: (proto.IPaymentInfo|null);

    /** WebMessageInfo ephemeralStartTimestamp */
    ephemeralStartTimestamp?: (number|Long|null);

    /** WebMessageInfo ephemeralDuration */
    ephemeralDuration?: (number|null);

    /** WebMessageInfo ephemeralOffToOn */
    ephemeralOffToOn?: (boolean|null);

    /** WebMessageInfo ephemeralOutOfSync */
    ephemeralOutOfSync?: (boolean|null);

    /** WebMessageInfo bizPrivacyStatus */
    bizPrivacyStatus?: (proto.WebMessageInfo.BizPrivacyStatus|null);

    /** WebMessageInfo verifiedBizName */
    verifiedBizName?: (string|null);

    /** WebMessageInfo mediaData */
    mediaData?: (proto.IMediaData|null);

    /** WebMessageInfo photoChange */
    photoChange?: (proto.IPhotoChange|null);

    /** WebMessageInfo userReceipt */
    userReceipt?: (proto.IUserReceipt[]|null);

    /** WebMessageInfo reactions */
    reactions?: (proto.IReaction[]|null);

    /** WebMessageInfo quotedStickerData */
    quotedStickerData?: (proto.IMediaData|null);

    /** WebMessageInfo futureproofData */
    futureproofData?: (Uint8Array|null);

    /** WebMessageInfo statusPsa */
    statusPsa?: (proto.IStatusPSA|null);

    /** WebMessageInfo pollUpdates */
    pollUpdates?: (proto.IPollUpdate[]|null);

    /** WebMessageInfo pollAdditionalMetadata */
    pollAdditionalMetadata?: (proto.IPollAdditionalMetadata|null);

    /** WebMessageInfo agentId */
    agentId?: (string|null);

    /** WebMessageInfo statusAlreadyViewed */
    statusAlreadyViewed?: (boolean|null);

    /** WebMessageInfo messageSecret */
    messageSecret?: (Uint8Array|null);

    /** WebMessageInfo keepInChat */
    keepInChat?: (proto.IKeepInChat|null);

    /** WebMessageInfo originalSelfAuthorUserJidString */
    originalSelfAuthorUserJidString?: (string|null);

    /** WebMessageInfo revokeMessageTimestamp */
    revokeMessageTimestamp?: (number|Long|null);

    /** WebMessageInfo pinInChat */
    pinInChat?: (proto.IPinInChat|null);

    /** WebMessageInfo futureproofMessageSecretMessage */
    futureproofMessageSecretMessage?: (proto.IFutureproofMessageSecretMessage|null);
}