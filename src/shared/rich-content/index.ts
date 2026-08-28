/**
 * The lesson rich-content domain: the document model, the tokens it resolves through, the URL
 * policy it is held to, and the renderer that draws it.
 *
 * The editor is not here. It lives with the instructor course editor and pulls TipTap in with it,
 * so a student loading a lesson does not download an editing engine to read one.
 */

export { RichContentView } from "./components/rich-content-view";
export type { RichContentViewProps } from "./components/rich-content-view";

export {
  isRichDocumentEmpty,
  parseRichDocument,
  richDocumentToPlainText,
  serializeRichDocument,
} from "./rich-content.schema";

export {
  CTA_VARIANT_STYLES,
  HEADING_SIZE_VALUES,
  LEADING_VALUES,
  SPACING_VALUES,
  TEXT_COLOR_VALUES,
  TEXT_SIZE_VALUES,
  alignmentToJustify,
} from "./rich-content.tokens";

export { alignmentToCss, isSafeLinkUrl, resolveLinkUrl, safeHref } from "./rich-content.url";
export type { LinkRejection, LinkResolution } from "./rich-content.url";

export {
  RICH_ALIGNMENTS,
  RICH_CONTENT_VERSION,
  RICH_CTA_VARIANTS,
  RICH_LEADINGS,
  RICH_SPACINGS,
  RICH_TEXT_COLORS,
  RICH_TEXT_SIZES,
  emptyRichDocument,
} from "./rich-content.types";
export type {
  RichAlignment,
  RichBlock,
  RichCtaVariant,
  RichDocument,
  RichHeadingLevel,
  RichInline,
  RichLeading,
  RichListItem,
  RichMark,
  RichSpacing,
  RichTextColor,
  RichTextSize,
} from "./rich-content.types";
