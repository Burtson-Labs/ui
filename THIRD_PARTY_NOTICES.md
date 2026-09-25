# Third-party notices

Burtson UI includes Burtson Labs components and vendored third-party primitives, released under the MIT license
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

## Locally maintained primitives

Radix Primitives and cmdk are maintained as TypeScript source under
`src/primitives/vendor`. They are no longer installed as runtime packages.
Their original MIT licenses are included in `LICENSES/Radix-MIT.txt` and
`LICENSES/cmdk-MIT.txt`. `vendor-manifest.json` records exact versions,
source origins, hashes, and local modifications. See `VENDORING.md`.

Floating UI, aria-hidden, react-remove-scroll and the other declared
dependencies remain external dependencies with their own licenses.
`LICENSES/DEPENDENCIES.txt` preserves the installed runtime dependency and
peer dependency notices, including class-variance-authority (Apache-2.0).
The documentation site's `/licenses.txt` includes these notices too.
Registry source files carry the applicable full MIT notices.
