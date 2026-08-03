import { Mark } from "@tiptap/core";

import {
  isTextTone,
  textToneClassName,
  textTones,
  type TextTone as TextToneName,
} from "@/lib/markdown/markdown-policy";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textTone: {
      setTextTone: (tone: TextToneName) => ReturnType;
      unsetTextTone: () => ReturnType;
    };
  }
}

function findClosingBracket(source: string, contentStart: number) {
  let depth = 1;

  for (let index = contentStart; index < source.length; index += 1) {
    if (source[index] === "\\") {
      index += 1;
      continue;
    }

    if (source[index] === "[") {
      depth += 1;
      continue;
    }

    if (source[index] === "]") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

export const TextTone = Mark.create({
  name: "textTone",

  addAttributes() {
    return {
      tone: {
        default: null,
      },
    };
  },

  parseHTML() {
    return textTones.map((tone) => ({
      tag: `span.${textToneClassName(tone)}`,
      getAttrs: () => ({ tone }),
    }));
  },

  renderHTML({ mark }) {
    const tone = mark.attrs.tone;

    if (!isTextTone(tone)) {
      return ["span", 0];
    }

    return ["span", { class: textToneClassName(tone) }, 0];
  },

  parseMarkdown(token, helpers) {
    const tone = token.tone;

    if (!isTextTone(tone)) {
      return helpers.parseInline(token.tokens ?? []);
    }

    return helpers.applyMark(
      "textTone",
      helpers.parseInline(token.tokens ?? []),
      { tone },
    );
  },

  renderMarkdown(node, helpers) {
    const tone = node.attrs?.tone;
    const content = helpers.renderChildren(node);

    return isTextTone(tone) ? `:tone-${tone}[${content}]` : content;
  },

  markdownTokenizer: {
    name: "textTone",
    level: "inline",
    start(source) {
      const indexes = textTones
        .map((tone) => source.indexOf(`:tone-${tone}[`))
        .filter((index) => index >= 0);

      return indexes.length > 0 ? Math.min(...indexes) : -1;
    },
    tokenize(source, _tokens, lexer) {
      const match = /^:tone-(blue|red|green|amber)\[/.exec(source);

      if (!match || !isTextTone(match[1])) {
        return undefined;
      }

      const contentStart = match[0].length;
      const closingIndex = findClosingBracket(source, contentStart);

      if (closingIndex < 0 || closingIndex === contentStart) {
        return undefined;
      }

      const innerContent = source.slice(contentStart, closingIndex);

      return {
        type: "textTone",
        raw: source.slice(0, closingIndex + 1),
        tone: match[1],
        text: innerContent,
        tokens: lexer.inlineTokens(innerContent),
      };
    },
  },

  addCommands() {
    return {
      setTextTone:
        (tone) =>
        ({ commands }) =>
          isTextTone(tone) && commands.setMark(this.name, { tone }),
      unsetTextTone:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
