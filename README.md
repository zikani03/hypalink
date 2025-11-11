# hypa-link

A web component to make sharing multiple links more convenient in websites and web apps.

One hypa-link can be used to show a list of various hyper links, currently they render in something like a popover/tooltip - but can be styled to display in a modal dialog etc..

## Usage

First, add the following to your HTML

```html
<script src="/hypalink.js" type="text/javascript"></script>
```

Then you can use the `<hypa-link>` tag as follows


1. Embed links as child nodes 

```html
<hypa-link label="You can embed links as child nodes">
    <a href="https://news.ycombinator.com">HackerNews</a>
    <a href="https://lobste.rs">Lobsters</a>
    <a href="https://reddit.com/r/programming">Reddit r/Programming</a>
</hypa-link>
```

2. With `srchrefs` - CSV of links

```html
<hypa-link srchrefs="https://news.ycombinator.com,https://lobste.rs,https://reddit.com/r/programming">Programming Links</hypa-link>
```

3. With a JSON `src` - JSON array from a remote source with a `"url"` and `"text"` fields

```html
<hypa-link src="/assets/links.json">loaded from JSON</hypa-link>
```

4. With a plain-text `src` - a plain text file from a remote source where each link is on it's own line

```html
<hypa-link src="/assets/links.txt">These documents</hypa-link>
```

## Demo 

### Basic Popover

![[]](demo.png)

### Modal 

Add the `modal` attribute to make Links popup in a modal

```html
<hypa-link label="You can embed links as child nodes" modal>
    <a href="https://news.ycombinator.com">HackerNews</a>
    <a href="https://lobste.rs">Lobsters</a>
    <a href="https://reddit.com/r/programming">Reddit r/Programming</a>
</hypa-link>
```

![[]](modal.png)