## Flink Extension Overview

This extension is your comprehensive solution for copying links... or it will be one day as its feature set expands. Ideally, we'll get some of this functionality built into Firefox in the future, but for now, this extension serves as a playground.

The **Flink** address bar button simply copies the URL to the clipboard as is. If you right-click, you'll see this option repeated, and then you'll also see up to three additional options:

### Copy Title
The page title is used for the label for the link. This looks for the OpenGraph title on the page if there is one, and if there isn't one, it uses the HTML title of the page.

### Copy Flink
This option is offered only for specific sites where I've authored support for extracting elements from the page.

- **Google Docs** use the document name: [Product Change Proposal April 2025]()
- **Jira Tickets** use the key as a link, followed by the title in text: [TR-1234](): Complete product specification and get review
- **Bugzilla Bugs** use the ID as the link, followed by the title in text: [1234567](): Firefox crashes when playing multiple videos in the same tab
- **Wikipedia Articles** use the article name: [Pulitzer Prize]()

### Copy Selection Link
If there is selected text on the page, that selected text is used as the label for the link.

---

## Future Feature Ideas

A lot more could be done! I am responsive to email at [david@joivid.com](mailto:david@joivid.com) and happy to take requests.

1. The way I choose to format links, whether for title, selection, or my site-specific support, is my preference, but I could make it configurable.
2. I can support more sites for flinks. Let me know your requests, and I will do it.
3. I could create a way to specify formatting using JSON and download formatting definitions from a server instead of baking them into code.
4. Users could locally choose which definitions are enabled and create their own locally as well.
5. With this model, formatting definitions could be contributed by users.
6. I could offer ways to deep link into pages using URL fragments based on the selection, including text fragments.
7. For sites that provide lists of links, I could extract the links (e.g., search results, query results, folder listings).
8. Options to right-click on a link in a page and choose to copy it instead of just supporting the address bar button.
9. Multiple links could be added one at a time to the clipboard across multiple pages.
10. I could build a previewer UI, so you can always see what was actually placed on the clipboard.

---
