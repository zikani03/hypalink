# hypa-link

A web component to make sharing multiple links more convenient in websites and web apps.

## Usage

First, add the following to your HTML

```html
<link rel="stylesheet" href="/hypalink.css">
<script src="/hypalink.js" type="text/javascript"></script>
```

Then you can use the `<hypa-link>` tag as follows

1. With `srchrefs` - CSV of links

```html
<hypa-link srchrefs="https://news.ycombinator.com,https://lobste.rs,https://reddit.com/r/programming">Programming Links</hypa-link>
```

2. With a JSON `src` - JSON array from a remote source with a `"url"` and `"text"` fields

```html
<hypa-link src="/assets/links.json">loaded from JSON</hypa-link>
```

3. With a plain-text `src` - a plain text file from a remote source where each link is on it's own line

```html
<hypa-link src="/assets/links.txt">These documents</hypa-link>
```

## Demo 

![[]](demo.png)