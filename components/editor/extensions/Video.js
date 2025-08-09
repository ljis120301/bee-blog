import { Node, mergeAttributes } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';
import VideoComponent from './VideoComponent';

const Video = Node.create({
  name: 'video',

  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      src: { default: null },
      type: { default: 'video/mp4' },
      controls: { default: true },
      preload: { default: 'metadata' },
      class: { default: 'max-w-full h-auto my-4 rounded-md' },
      playsinline: { default: true },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Render src directly on <video> so reparse retains it in attrs
    const attrs = { ...HTMLAttributes };
    if (HTMLAttributes.src) {
      attrs.src = HTMLAttributes.src;
    }
    if (HTMLAttributes.type) {
      // Keep type as attribute on video as well for consistency
      attrs.type = HTMLAttributes.type;
    }
    return ['video', mergeAttributes(attrs)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },

  addCommands() {
    return {
      setVideo:
        options => ({ editor, commands }) => {
          // Insert at current selection (already adjusted for drop/paste)
          const inserted = commands.insertContent({ type: this.name, attrs: options });
          if (!inserted) return false;

          // After inserting an atomic node, ensure the user can continue typing.
          // If the insertion point is at the end of a block (e.g., first node),
          // insert a paragraph after and place the cursor inside it.
          const { state, view } = editor;
          const { selection, schema } = state;
          const $to = state.doc.resolve(selection.to);
          const isAtParentEnd = $to.index() === $to.parent.childCount;

          let tr = state.tr;
          let targetPos = selection.to;

          if (isAtParentEnd) {
            // Insert an empty paragraph after the video node
            const paragraph = schema.nodes.paragraph.create();
            tr = tr.insert(selection.to, paragraph);
            // Place cursor inside the newly inserted paragraph
            targetPos = targetPos + 1; // inside the paragraph
          }

          tr = tr.setSelection(TextSelection.create(tr.doc, Math.min(tr.doc.content.size, targetPos)));
          tr = tr.scrollIntoView();
          view.dispatch(tr);
          return true;
        },
    };
  },
});

export default Video;


