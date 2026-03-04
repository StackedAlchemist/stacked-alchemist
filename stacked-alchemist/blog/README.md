# The Grimoire — Blog System
## By Billy Williams / Stacked Alchemist

---

## FILE STRUCTURE

```
your-portfolio/
├── blog.html          ← Blog hub page (your "homepage" for writing)
├── blog.css           ← All blog styles
├── blog.js            ← Blog engine (loads + renders posts)
├── post.html          ← Universal post reader (one page for ALL posts)
├── post.css           ← Post reader styles
├── post.js            ← Post loader engine
├── posts.json         ← YOUR POST DATABASE ← edit this to add posts
└── posts/
    ├── salvation.html           ← Poem content
    ├── religion.html            ← Reflection content
    ├── why-i-started-coding.html← Dev journal content
    └── winglord-saga-revised.html ← (add this — your story)
```

---

## HOW TO ADD A NEW POST

### Step 1 — Add entry to posts.json

Open `posts.json` and add a new object to the array:

```json
{
  "id": "my-post-id",
  "title": "My Post Title",
  "subtitle": "Optional subtitle or tagline",
  "category": "devjournal",
  "tags": ["coding", "learning"],
  "date": "2025-03-01",
  "updated": "2025-03-01",
  "author": "Billy Williams",
  "readTime": 5,
  "wordCount": 800,
  "featured": false,
  "excerpt": "A short 1-2 sentence description shown on the blog hub card.",
  "file": "posts/my-post-id.html",
  "coverIcon": "⌨",
  "accentColor": "#00ffc8"
}
```

### Step 2 — Create the post content file

Create `posts/my-post-id.html` and write your content using plain HTML.
The system handles all the header, navigation, and styling automatically.

**That's it. The blog updates instantly.**

---

## CATEGORIES

| Category     | Value        | Color    | Use for                          |
|-------------|-------------|---------|----------------------------------|
| Fiction      | `fiction`    | Gold     | Stories, novels, chapters        |
| Poetry       | `poetry`     | Violet   | Poems, verse                     |
| Dev Journal  | `devjournal` | Teal     | Coding journey, project updates  |
| Reflection   | `reflection` | Green    | Essays, personal thoughts        |
| Gaming       | `gaming`     | Pink     | Game reviews, commentary         |

---

## COVER ICONS

Pick any emoji or symbol for `coverIcon` in posts.json:
- Fiction/Fantasy: `⚔` `🐉` `✦` `🗡` `◈`
- Poetry: `✦` `🌙` `◇` `❋`
- Dev Journal: `⌨` `💻` `⚙` `{ }` `/>` 
- Gaming: `🎮` `⚡` `🏆` `◉`
- Reflection: `◈` `🔮` `☽` `⬡`

---

## WRITING POST CONTENT — HTML CLASSES

Inside your `posts/my-post.html` file, use these classes:

```html
<!-- Regular paragraph -->
<p>Your text here.</p>

<!-- Pull quote (centered, styled) -->
<p class="pull-quote">A memorable line from your post.</p>

<!-- Blockquote -->
<blockquote>A quote or excerpt.</blockquote>

<!-- Gold blockquote variant -->
<blockquote class="gold">A quote with gold styling.</blockquote>

<!-- Chapter divider line -->
<hr>

<!-- Poem stanza -->
<div class="poem">
  <p>First line of the poem</p>
  <p>Second line of the poem</p>
</div>

<!-- Chapter label + title (for fiction) -->
<span class="chapter-label">Chapter One</span>
<h2 class="chapter-title">A New Beginning</h2>
<p class="chapter-subtitle">Subtitle here</p>

<!-- Ending line (gold italic) -->
<p class="story-end">The last line of your post.</p>

<!-- Headings -->
<h2>Section Heading</h2>
<h3>Sub Heading</h3>
```

---

## FEATURED POST

Set `"featured": true` in posts.json on whichever post you want displayed
in the large featured card at the top of the blog hub. Only the first
featured post is shown. If none are marked featured, the first post is used.

---

## LINKING FROM YOUR PORTFOLIO

In your main `index.html`, add to the nav:
```html
<li><a href="blog.html">The Grimoire</a></li>
```

In the project cards, treat the blog as an Arcane Engineering project:
```html
<a href="blog.html" class="btn btn-primary">View The Grimoire</a>
```

---

## RUNNING LOCALLY

The blog uses `fetch()` to load `posts.json`, so it needs a local server.
In VS Code with Live Server extension: right-click `blog.html` → Open with Live Server.

Or in terminal:
```bash
npx serve .
```

Opening `blog.html` directly as a file (file://) will NOT work — use Live Server.

---

## TO ADD THE WINGLORD SAGA

Create `posts/winglord-saga-revised.html` and paste your story content
using `<p>` tags for paragraphs and the classes above for chapter headers,
pull quotes, and section breaks. The entry is already in `posts.json`.
