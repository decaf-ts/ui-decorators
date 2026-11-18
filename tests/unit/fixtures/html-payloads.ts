/** Inert regression corpus: parsed by jsdom without script/resource execution. */
export const htmlPayloads: [string, string][] = [
  ["report R2-1 image", '<img src=x onerror="void 0" data-poc="cf1">'],
  [
    "report R2-1 script",
    '<script data-poc="cf1">window.__POC_CF1_HIT__ = true;</script>',
  ],
  ["double quote breakout", '" autofocus onfocus="void 0'],
  ["single quote breakout", "' autofocus onfocus='void 0"],
  ["double quote element breakout", '"><img src=x onerror="void 0">'],
  ["single quote element breakout", "'><img src=x onerror='void 0'>"],
  ["mixed quote breakout", `"'><svg onload="void 0"></svg>`],
  ["unquoted handler", "<img/src=x onerror=void(0)>"],
  ["mixed case tags", "<ScRiPt>void 0</sCrIpT>"],
  ["unterminated tag", '<img src=x onerror="void 0"'],
  ["malformed nested tag", "<scr<script>ipt>void 0</scr</script>ipt>"],
  ["duplicate attributes", '<img src=x src=y onerror="void 0">'],
  ["SVG event", "<svg/onload=void(0)>"],
  [
    "SVG foreignObject",
    '<svg><foreignObject><img src=x onerror="void 0"></foreignObject></svg>',
  ],
  [
    "SVG CDATA",
    '<svg><text><![CDATA[<img src=x onerror="void 0">]]></text></svg>',
  ],
  [
    "SVG namespace mutation",
    '<svg><p><style><!--</style><img src=x onerror="void 0">--></p></svg>',
  ],
  [
    "MathML mutation",
    '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=x onerror=void(0)>">',
  ],
  [
    "SVG animation",
    '<svg><a href="#x"><animate attributeName="href" values="javascript:void(0)"/></a></svg>',
  ],
  ["script URL", '<a href="javascript:void(0)">click</a>'],
  ["entity-obfuscated URL", '<a href="jav&#x61;script:void(0)">click</a>'],
  ["control-obfuscated URL", '<a href="java\tscript:void(0)">click</a>'],
  [
    "data URL",
    '<iframe src="data:text/html,<script>void 0</script>"></iframe>',
  ],
  ["srcdoc", '<iframe srcdoc="<img src=x onerror=void(0)>"></iframe>'],
  [
    "CSS",
    '<style>body{display:none}</style><p style="background:url(javascript:void(0))">x</p>',
  ],
  [
    "refresh",
    '<meta http-equiv="refresh" content="0;url=https://example.invalid">',
  ],
  ["base URL", '<base href="https://example.invalid/">'],
  ["object", '<object data="data:text/html,<script>void 0</script>"></object>'],
  ["DOM clobbering", '<form id="document"><input name="location"></form>'],
  ["template", '<template><img src=x onerror="void 0"></template>'],
  ["comment breakout", '--><img src=x onerror="void 0"><!--'],
  [
    "raw text breakout",
    '</textarea></title></style></script><img src=x onerror="void 0">',
  ],
  [
    "HTML declaration",
    "<!DOCTYPE html><!--[if IE]><script>void 0</script><![endif]-->",
  ],
  ["encoded tags", "&lt;img src=x onerror=&quot;void 0&quot;&gt;"],
  ["numeric entities", "&#60;img src=x onerror=void(0)&#62;"],
  ["hex entities", "&#x3c;svg onload=void(0)&#x3e;"],
  ["encoded quotes", "&quot; onfocus=&quot;void 0 &#39; onerror=&#39;void 0"],
  ["entities without semicolon", "&lt &gt &#34 &#x27 &amp"],
  ["nested entities", "&amp;lt;script&amp;gt;void 0&amp;lt;/script&amp;gt;"],
  ["percent encoding", "%3Cimg%20src=x%20onerror=void(0)%3E"],
  [
    "template expressions",
    '{{constructor.constructor("void 0")()}} ${void 0} <%= value %>',
  ],
  ["plain script scheme", "javascript:void(0)"],
  ["plain data scheme", 'data:text/html,<svg onload="void 0">'],
  ["benign international text", 'Olá 世界 😀 café e\u0301 "quotes" & <text>'],
  ["benign whitespace", "one\ttwo\nthree"],
  ["empty", ""],
];

/** Reproducible combinations, including controls and unpaired UTF-16 surrogates. */
export function generatedHtmlInputs(): string[] {
  const tokens = [
    ...htmlPayloads.map(([, payload]) => payload),
    "&",
    "<",
    ">",
    '"',
    "'",
    "`",
    "=",
    "/",
    "\\",
    " ",
    "\u0000",
    "\r\n",
    "\u001f",
    "\u007f",
    "\u2028",
    "\ud800",
    "\udfff",
  ];
  let seed = 0x895;
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  return Array.from({ length: 1000 }, () => {
    const count = 1 + (next() % 8);
    return Array.from(
      { length: count },
      () => tokens[next() % tokens.length]
    ).join("");
  });
}
