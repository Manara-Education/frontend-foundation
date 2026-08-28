import type { MouseEvent } from "react";
import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
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
 *
 * <h2>Where the "on" states come from</h2>
 * Every one of them is read out of the editor through `useEditorState`, and none is held in React
 * state here. That is not a style preference: a toolbar that keeps its own idea of whether the
 * caret is in a bullet list is a toolbar that will eventually be wrong, and being wrong looks
 * exactly like the editor being broken.
 *
 * It has to be a subscription rather than a read during render. `useEditor` does not re-render its
 * consumers on every transaction — deliberately, since that would re-render the whole form on each
 * keystroke — so a toolbar that called `editor.isActive(...)` while rendering would only refresh
 * when something else happened to re-render it. Moving the caret out of a list changes no React
 * state at all, and the button stayed lit. `useEditorState` subscribes to the editor's
 * transactions, selects just the flags below, and re-renders only when one of them actually
 * changes — so the toolbar tracks the caret, including selection-only moves, and a typed character
 * that changes none of these costs nothing.
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

/**
 * Keeps the caret where the instructor left it.
 *
 * Pressing a toolbar button would otherwise move focus out of the editing surface on mousedown,
 * before the click that runs the command. TipTap's `focus()` puts it back, so the commands work
 * either way — but the surface visibly loses its selection highlight in between, which reads as
 * the selection being dropped, and a control that only restores what it disturbed is a control
 * with a moment in which it can be wrong. Refusing the default is how the browser is told a
 * toolbar press is not a focus change.
 */
function keepSelection(event: MouseEvent) {
  event.preventDefault();
}

/**
 * Runs one of the list commands over the selection, minus the editor's trailing filler paragraph.
 *
 * TipTap keeps an empty paragraph at the end of the document — StarterKit's `TrailingNode` — so
 * there is always somewhere to put the caret after a block that cannot hold one, such as a divider
 * or a call-to-action button. It is scaffolding rather than content, and the bridge drops it on
 * save.
 *
 * Select-all includes it, and that quietly breaks both list buttons. TipTap turns a whole-document
 * list back into paragraphs only when the list is the document's *only* top-level node; with the
 * trailing paragraph beside it there are two, so the command falls through to "wrap the selection
 * in a list" instead. Pressing Bullet List a second time then added an empty item rather than
 * unwrapping, and converting a selected bullet list to a numbered one left a stray empty item on
 * the end.
 *
 * Shrinking the selection to the end of the real content is what puts the framework back on the
 * path it already has for this. The command that runs afterwards is still TipTap's own — this
 * decides what it acts on, not what it does.
 */
function runListCommand(editor: Editor, toggle: "toggleBulletList" | "toggleOrderedList") {
  const { doc, selection } = editor.state;
  const last = doc.lastChild;
  // The position just before the filler paragraph, which is where the real content ends.
  const contentEnd = last ? doc.content.size - last.nodeSize : 0;
  const isTrailingFiller =
    last?.type.name === "paragraph" && last.content.size === 0 && contentEnd > 0;

  if (isTrailingFiller && selection.to > contentEnd) {
    editor.commands.command(({ tr, dispatch }) => {
      if (dispatch) {
        // `between` with a backwards bias lands on the last position that can hold a cursor,
        // wherever that is in the nesting — the same helper TipTap uses to build this selection
        // for the case it does handle.
        tr.setSelection(
          TextSelection.between(tr.doc.resolve(selection.from), tr.doc.resolve(contentEnd), -1),
        );
      }
      return true;
    });
  }

  editor.chain().focus()[toggle]().run();
}

export function RichContentToolbar({ editor, onOpenLink, onOpenCta }: ToolbarProps) {
  /*
    Everything the toolbar draws, selected out of the editor in one place.

    Flat values rather than nested objects, because `useEditorState` compares the result to decide
    whether to re-render and a flat record of primitives makes that comparison exact.
  */
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      style: instance.isActive("heading", { level: 1 })
        ? "h1"
        : instance.isActive("heading", { level: 2 })
          ? "h2"
          : instance.isActive("heading", { level: 3 })
            ? "h3"
            : ("paragraph" as (typeof TEXT_STYLES)[number]["value"]),
      bold: instance.isActive("bold"),
      italic: instance.isActive("italic"),
      underline: instance.isActive("underline"),
      strike: instance.isActive("strike"),
      // The two this file's fix is about. Read from the document, never remembered.
      bulletList: instance.isActive("bulletList"),
      orderedList: instance.isActive("orderedList"),
      blockquote: instance.isActive("blockquote"),
      link: instance.isActive("link"),
      alignment: (instance.getAttributes("paragraph").align ??
        instance.getAttributes("heading").align ??
        instance.getAttributes("bulletList").align ??
        instance.getAttributes("orderedList").align ??
        "START") as RichAlignment,
      color: (instance.getAttributes("richTextColor").value ?? "DEFAULT") as RichTextColor,
      size: (instance.getAttributes("paragraph").size ?? "NORMAL") as RichTextSize,
      leading: (instance.getAttributes("paragraph").leading ?? "NORMAL") as RichLeading,
      spacing: (instance.getAttributes("paragraph").spacing ??
        instance.getAttributes("heading").spacing ??
        "NORMAL") as RichSpacing,
    }),
  });

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

  return (
    <div className="mrce-toolbar" role="toolbar" aria-label="أدوات تنسيق محتوى الدرس">
      <select
        className="mrce-select"
        aria-label="نمط النص"
        value={state.style}
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
          pressed={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          Icon={Bold}
        />
        <ToolbarToggle
          label="مائل"
          pressed={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          Icon={Italic}
        />
        <ToolbarToggle
          label="تحته خط"
          pressed={state.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          Icon={Underline}
        />
        <ToolbarToggle
          label="يتوسطه خط"
          pressed={state.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          Icon={Strikethrough}
        />
      </div>

      <span className="mrce-sep" />

      <div className="mrce-group">
        <ToolbarToggle
          label="قائمة نقطية"
          pressed={state.bulletList}
          onClick={() => runListCommand(editor, "toggleBulletList")}
          Icon={List}
        />
        <ToolbarToggle
          label="قائمة مرقّمة"
          pressed={state.orderedList}
          onClick={() => runListCommand(editor, "toggleOrderedList")}
          Icon={ListOrdered}
        />
        <ToolbarToggle
          label="اقتباس"
          pressed={state.blockquote}
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
            pressed={state.alignment === value}
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
            aria-pressed={state.color === colour}
            title={COLOR_LABELS[colour]}
            style={{ background: TEXT_COLOR_VALUES[colour] }}
            onMouseDown={keepSelection}
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
        value={state.size}
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
        value={state.leading}
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
        value={state.spacing}
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
          aria-pressed={state.link}
          onMouseDown={keepSelection}
          onClick={onOpenLink}
          title="رابط"
        >
          <Link2 size={14} strokeWidth={1.9} />
          <span>رابط</span>
        </button>
        <button
          type="button"
          className="mrce-btn"
          onMouseDown={keepSelection}
          onClick={onOpenCta}
          title="زر"
        >
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
      onMouseDown={keepSelection}
      onClick={onClick}
    >
      <Icon size={14} strokeWidth={1.9} />
    </button>
  );
}
