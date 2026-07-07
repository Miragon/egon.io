# Learn the basics

A domain story is built from three kinds of things, connected into a numbered sequence:

- **Actors** — the people or systems that *do* something (a customer, a clerk, a service).
- **Work objects** — what they act on or exchange (a document, an email, a request).
- **Activities** — the numbered arrows that connect them, so the story reads in order:
  *1. Customer sends order to Clerk, 2. Clerk files order in System…*

## Building a story

- **Palette** (left edge) — drag an actor or work object onto the canvas.
- **Context pad** (appears on a selected element) — connect elements, append the next step,
  or delete.
- **Labels** — double-click an element or an activity to name it.
- **Numbering** — activities are numbered automatically so the sequence stays readable.

## Custom icons

Need your own actors or work objects? Add `.svg` files to a `.egon/icons/actors` or
`.egon/icons/work-objects` folder in your workspace and they appear in the palette.

## Text and canvas stay in sync

Everything you draw is written back into the `.egn` text file, and edits to that file
re-render the canvas — so the diagram and the source never drift apart.

New to the method? Read more about [Domain Storytelling](https://domainstorytelling.org).
