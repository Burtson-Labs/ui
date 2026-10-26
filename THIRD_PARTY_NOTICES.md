# Third-party notices

Burtson UI is Burtson Labs' own work, released under the MIT license
(see [LICENSE](LICENSE)). Its component API, the `data-slot` convention, the
colour-token names and the registry format follow
[shadcn/ui](https://github.com/shadcn-ui/ui), and several components adapt
shadcn/ui's class lists. shadcn/ui is distributed under this license:

```
MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Burtson primitives

`src/primitives` is Burtson Labs' own behaviour layer, written from the
WAI-ARIA Authoring Practices and the web platform specifications, and released
under this package's MIT license. It is not derived from Radix, cmdk, Floating
UI or any other library. Earlier releases (0.14 to 0.18) shipped locally
maintained MIT-licensed ports of Radix Primitives and cmdk; 0.19 removed the
last of them (see `VENDORING.md` for the history).

The declared dependencies remain external dependencies with their own
licenses. `LICENSES/DEPENDENCIES.txt` preserves the installed runtime dependency and
peer dependency notices, including class-variance-authority (Apache-2.0).
The documentation site's `/licenses.txt` includes these notices too.
Registry source files carry the applicable full MIT notices.
