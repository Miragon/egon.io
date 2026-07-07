<div id="top"></div>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
<!-- END OF PROJECT SHIELDS -->

<!-- PROJECT LOGO -->
<br />
<div align="center">
    <a href="https://egon.io/">
        <img src="https://raw.githubusercontent.com/Miragon/egon.io/main/vscode/images/egon-io-logo.png" alt="Egon.io Logo" height="180">
    </a>
    <h3>Egon.io — The Domain Story Modeler</h3>
    <p>
        <i>Map how your team gets work done — visually, right inside Visual Studio Code.</i>
        <br />
        <a href="https://github.com/Miragon/egon.io/issues">Report Bug</a>
        ·
        <a href="https://github.com/Miragon/egon.io/pulls">Request Feature</a>
    </p>
</div>

## About

A **Domain Story** captures how people actually get work done — who does what, with which
documents and messages, told as a short numbered sequence you can read like a sentence. It gives
domain experts and developers one shared picture of a process, no code required.

This extension brings [Egon.io](https://egon.io/), the open-source Domain Story Modeler, into VS
Code: it opens `.egn` files — Egon's plain-text story format — in a graphical editor while the file
itself stays the source of truth. Because each story lives in your repo as text, it versions,
diffs, and reviews right alongside the code it describes.

## Getting started

Install **Egon.io — The Domain Story Modeler** (publisher `miragon-gmbh`) from the VS Code
Marketplace. The built-in **Get Started with Egon.io** walkthrough is the recommended first stop —
open it from **Help > Welcome** or run **Welcome: Open Walkthrough…** from the Command Palette
(`Cmd/Ctrl+Shift+P`).

To create a story, add a new file and save it with the `.egn` extension (for example
`my-first-story.egn`); VS Code opens it straight into the modeler. Already have an `.egn` file?
Just open it and the editor appears automatically.

## Reading a domain story

A story is read in order, following the numbered activities:

- **Actors** are the people or systems that *do* something (a customer, a clerk, a service).
- **Work objects** are what they act on or exchange (a document, an email, a request).
- **Activities** are the numbered steps that connect them, so the diagram reads in order —
  *1. Customer sends order to Clerk, 2. Clerk files order in System…*

Follow the numbers from start to finish and the whole process reads back as one continuous story.

## Editing a domain story

Open an `.egn` file and you get the full graphical modeler, backed by the plain-text file:

- **Palette** (left edge) — drag actors and work objects onto the canvas.
- **Context pad** (on a selected element) — connect elements, append the next step, change an
  element's type, or delete.
- **Labels and numbering** — double-click an element or activity to name it; activities are
  numbered automatically so the sequence stays readable.
- **Minimap** (top-right corner) — a canvas overview for navigating larger stories.
- **Keyboard shortcuts** — select all (`Cmd/Ctrl+A`), rename (`E`), lasso select (`L`), pan with
  the hand tool (`H`), the space tool (`S`), and copy/paste (`Cmd/Ctrl+C` / `Cmd/Ctrl+V`).
- **Two-way sync** — everything you draw is written back into the `.egn` file, and edits to that
  text re-render the canvas, so the canvas and the text stay in step as you work. To reopen a story
  as raw text, use **View: Reopen Editor With…** and pick **Text Editor**.

### Custom icons

Add your own actors and work objects by placing `.svg` files in an `.egon/icons/actors` or
`.egon/icons/work-objects` folder in your workspace — each file's name becomes the icon's name in
the palette. See [Custom Icons](https://github.com/Miragon/egon.io/blob/main/vscode/docs/CustomIcons.md)
for details.

## Contributing

Contributions are **greatly appreciated**.

If you have a suggestion that would make this better, open an issue with the tag `enhancement`, fork
the repo, and create a pull request. Please use
[semantic commit messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716), and
don't forget to give the project a star. Thanks!

New to the method? Learn more about [Domain Storytelling](https://domainstorytelling.org) and read
the [Egon.io user guide](https://egon.io/howto#palette).

## License

Distributed under the [GPLv3](https://github.com/Miragon/egon.io/blob/main/vscode/LICENSE) license.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Miragon/egon.io.svg?style=for-the-badge

[contributors-url]: https://github.com/Miragon/egon.io/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/Miragon/egon.io.svg?style=for-the-badge

[forks-url]: https://github.com/Miragon/egon.io/network/members

[stars-shield]: https://img.shields.io/github/stars/Miragon/egon.io.svg?style=for-the-badge

[stars-url]: https://github.com/Miragon/egon.io/stargazers

[issues-shield]: https://img.shields.io/github/issues/Miragon/egon.io.svg?style=for-the-badge

[issues-url]: https://github.com/Miragon/egon.io/issues

[license-shield]: https://img.shields.io/badge/license-GPLv3-blue.svg?style=for-the-badge

[license-url]: https://github.com/Miragon/egon.io/blob/main/vscode/LICENSE
