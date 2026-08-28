import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  SquareArrowOutUpRight,
  Strikethrough,
  Underline,
} from "lucide-react";
import {
  RICH_LEADINGS,
  RICH_SPACINGS,
  RICH_TEXT_COLORS,
  RICH_TEXT_SIZES,
  TEXT_COLOR_VALUES,
} from "@/shared/rich-content";
import type {
  RichAlignment,
  RichLeading,
  RichSpacing,
  RichTextColor,
  RichTextSize,
} from "@/shared/rich-content";

/**
 * The authoring controls.
 *
 * Every control here maps to a value the schema allows and the server accepts — there is no colour
 * picker, no font field and no size input, because those produce values that are not in the closed
 * sets. That is the constraint doing double duty: it is the security property, and it is also what
 * makes the toolbar short enough to use.
 *
 * All buttons are real `<button type="button">` elements. The type matters: the lesson form these
 * sit inside is a form, and a default-type button in a form submits it.
 */

interface ToolbarProps {
  editor: Editor;
  onOpenLink: () => void;
  onOpenCta: () => void;
}

/** Alignment, labelled by what it does rather than by which side it lands on. */
const ALIGNMENT_CONTROLS: { value: RichAlignment; label: string; Icon: typeof AlignLeft }[] = [
  { value: "START", label: "محاذاة للبداية", Icon: AlignRight },
  { value: "CENTER", label: "توسيط", Icon: AlignCenter },
  { value: "END", label: "محاذاة للنهاية", Icon: AlignLeft },
];

const TEXT_STYLES = [
  { value: "paragraph", label: "نص عادي" },
  { value: "h1", label: "عنوان رئيسي" },
  { value: "h2", label: "عنوان فرعي" },
  { value: "h3", label: "عنوان صغير" },
] as const;

const SIZE_LABELS: Record<RichTextSize, string> = {
  SMALL: "صغير",
  NORMAL: "عادي",
  LARGE: "كبير",
};

const LEADING_LABELS: Record<RichLeading, string> = {
  TIGHT: "متقارب",
  NORMAL: "عادي",
  RELAXED: "مريح",
  LOOSE: "متباعد",
};

const SPACING_LABELS: Record<RichSpacing, string> = {
  COMPACT: "متقارب",
  NORMAL: "عادي",
  ROOMY: "واسع",
};

const COLOR_LABELS: Record<RichTextColor, string> = {
  DEFAULT: "افتراضي",
  MUTED: "باهت",
  PRIMARY: "أساسي",
  ACCENT: "مميز",
  SUCCESS: "أخضر",
  WARNING: "تحذير",
  DANGER: "خطر",
};

export function RichContentToolbar({ editor, onOpenLink, onOpenCta }: ToolbarProps) {
  const currentStyle = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : "paragraph";

  function applyTextStyle(value: (typeof TEXT_STYLES)[number]["value"]) {
    const chain = editor.chain().focus();
    if (value === "paragraph") {
      chain.setParagraph().run();
      return;
    }
    chain.setHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run();
  }

  /**
   * Applies a token to whichever block the cursor is in.
   *
   * `updateAttributes` is called for each styled node type rather than for the active one, because
   * asking which node the selection is in is a question with several answers when a selection spans
   * a paragraph and a list. Setting the attribute on the types that do not apply is a no-op.
   */
  function applyBlockAttribute(name: string, value: string) {
    const chain = editor.chain().focus();
    for (const type of ["paragraph", "heading", "bulletList", "orderedList", "blockquote"]) {
      chain.updateAttributes(type, { [name]: value });
    }
    chain.run();
  }

  const activeAlignment = (editor.getAttributes("paragraph").align ??
    editor.getAttributes("heading").align ??
    "START") as RichAlignment;

  const activeColor = (editor.getAttributes("richTextColor").value ?? "DEFAULT") as RichTextColor;

  return (
    <div className="mrce-toolbar" role="toolbar" aria-label="أدوات تنسيق محتوى الدرس">
      <select
        className="mrce-select"
        aria-label="نمط النص"
        value={currentStyle}
        onChange={(event) =>
          applyTextStyle(event.target.value as (typeof TEXT_STYLES)[number]["value"])
        }
      >
        {TEXT_STYLES.map((style) => (
          <option key={style.value} value={style.value}>
            {style.label}
          </option>
        ))}
      </select>

      <span className="mrce-sep" />

      <div className="mrce-group">
        <ToolbarToggle
          label="عريض"
          pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          Icon={Bold}
        />
        <ToolbarToggle
          label="مائل"
          pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          Icon={Italic}
        />
        <ToolbarToggle
          label="تحته خط"
          pressed={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          Icon={Underline}
        />
        <ToolbarToggle
          label="يتوسطه خط"
          pressed={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          Icon={Strikethrough}
        />
      </div>

      <span className="mrce-sep" />

      <div className="mrce-group">
        <ToolbarToggle
          label="قائمة نقطية"
          pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          Icon={List}
        />
        <ToolbarToggle
          label="قائمة مرقّمة"
          pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          Icon={ListOrdered}
        />
        <ToolbarToggle
          label="اقتباس"
          pressed={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          Icon={Quote}
        />
        <ToolbarToggle
          label="فاصل"
          pressed={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          Icon={Minus}
        />
      </div>

      <span className="mrce-sep" />

      <div className="mrce-group">
        {ALIGNMENT_CONTROLS.map(({ value, label, Icon }) => (
          <ToolbarToggle
            key={value}
            label={label}
            pressed={activeAlignment === value}
            onClick={() => applyBlockAttribute("align", value)}
            Icon={Icon}
          />
        ))}
      </div>

      <span className="mrce-sep" />

      {/*
        The palette, as swatches rather than a list of names: an instructor picking a colour is
        making a visual decision. Each still carries its name as its accessible label, so the choice
        is available to someone who cannot see the swatch.
      */}
      <div className="mrce-group" role="group" aria-label="لون النص">
        {RICH_TEXT_COLORS.map((colour) => (
          <button
            key={colour}
            type="button"
            className="mrce-swatch"
            aria-label={`لون النص: ${COLOR_LABELS[colour]}`}
            aria-pressed={activeColor === colour}
            title={COLOR_LABELS[colour]}
            style={{ background: TEXT_COLOR_VALUES[colour] }}
            onClick={() => {
              const chain = editor.chain().focus();
              if (colour === "DEFAULT") {
                chain.unsetMark("richTextColor").run();
                return;
              }
              chain.setMark("richTextColor", { value: colour }).run();
            }}
          />
        ))}
      </div>

      <span className="mrce-sep" />

      <select
        className="mrce-select"
        aria-label="حجم النص"
        value={(editor.getAttributes("paragraph").size ?? "NORMAL") as RichTextSize}
        onChange={(event) => applyBlockAttribute("size", event.target.value)}
      >
        {RICH_TEXT_SIZES.map((size) => (
          <option key={size} value={size}>
            {SIZE_LABELS[size]}
          </option>
        ))}
      </select>

      <select
        className="mrce-select"
        aria-label="تباعد الأسطر"
        value={(editor.getAttributes("paragraph").leading ?? "NORMAL") as RichLeading}
        onChange={(event) => applyBlockAttribute("leading", event.target.value)}
      >
        {RICH_LEADINGS.map((leading) => (
          <option key={leading} value={leading}>
            {LEADING_LABELS[leading]}
          </option>
        ))}
      </select>

      <select
        className="mrce-select"
        aria-label="تباعد الفقرات"
        value={
          (editor.getAttributes("paragraph").spacing ??
            editor.getAttributes("heading").spacing ??
            "NORMAL") as RichSpacing
        }
        onChange={(event) => applyBlockAttribute("spacing", event.target.value)}
      >
        {RICH_SPACINGS.map((spacing) => (
          <option key={spacing} value={spacing}>
            {SPACING_LABELS[spacing]}
          </option>
        ))}
      </select>

      <span className="mrce-sep" />

      <div className="mrce-group">
        <button
          type="button"
          className="mrce-btn"
          aria-pressed={editor.isActive("link")}
          onClick={onOpenLink}
          title="رابط"
        >
          <Link2 size={14} strokeWidth={1.9} />
          <span>رابط</span>
        </button>
        <button type="button" className="mrce-btn" onClick={onOpenCta} title="زر">
          <SquareArrowOutUpRight size={14} strokeWidth={1.9} />
          <span>زر</span>
        </button>
      </div>
    </div>
  );
}

function ToolbarToggle({
  label,
  pressed,
  onClick,
  Icon,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  Icon: typeof AlignLeft;
}) {
  return (
    <button
      type="button"
      className="mrce-btn"
      // `aria-pressed` rather than a class: a screen reader announces whether bold is on, which a
      // background colour does not convey.
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon size={14} strokeWidth={1.9} />
    </button>
  );
}
